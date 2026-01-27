/**
 * Main Cloud Functions entry point
 * Handles item uploads, image processing, and match triggering
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage().bucket();

const matching = require('./matching');

// Enable CORS for all endpoints
const corsHandler = cors({ origin: true });

/**
 * Cloud Function: Process item upload
 * Triggers when a new item is created in Firestore
 * Extracts AI features and runs matching
 */
exports.processItemUpload = functions.firestore
  .document('items/{itemId}')
  .onCreate(async snapshot => {
    const item = snapshot.data();
    const itemId = snapshot.id;

    try {
      console.log(`Processing new item: ${itemId}`);

      // Extract image features
      const imageFeatures = await matching.extractImageFeatures(item.imageUrl);

      // Normalize description
      const normalizedItem = await matching.normalizeItemDescription(
        item.description,
        imageFeatures.labels
      );

      // Update item with AI features
      await db.collection('items').doc(itemId).update({
        imageLabels: imageFeatures.labels,
        imageObjects: imageFeatures.objects,
        imageDominantColors: imageFeatures.colors,
        imageText: imageFeatures.text,
        normalizedDescription: normalizedItem.normalized_description,
        category: normalizedItem.category,
        features: normalizedItem.features,
        colors: normalizedItem.colors,
        processedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Item ${itemId} features extracted`);

      // Find matches
      await findAndCreateMatches(itemId, item, imageFeatures, normalizedItem);
    } catch (error) {
      console.error(`Error processing item ${itemId}:`, error);
      // Update item with error status
      await db.collection('items').doc(itemId).update({
        processingError: error.message,
      });
    }
  });

/**
 * Find matching items and create match records
 */
async function findAndCreateMatches(newItemId, newItem, newFeatures, newNormalized) {
  try {
    // Query items of opposite type
    const oppositeType = newItem.type === 'lost' ? 'found' : 'lost';

    const matchQuery = await db
      .collection('items')
      .where('type', '==', oppositeType)
      .where('status', '==', 'open')
      .limit(50); // Limit to prevent excessive processing

    const matchDocs = await matchQuery.get();

    console.log(`Found ${matchDocs.size} potential ${oppositeType} items`);

    const matches = [];

    for (const doc of matchDocs.docs) {
      const potentialMatch = doc.data();
      const potentialMatchId = doc.id;

      try {
        // Score this match
        const score = await matching.scoreMatch(
          newItem,
          potentialMatch,
          newFeatures,
          newNormalized,
          {
            labels: potentialMatch.imageLabels || [],
            objects: potentialMatch.imageObjects || [],
            colors: potentialMatch.imageDominantColors || [],
            text: potentialMatch.imageText || '',
          },
          {
            normalized_description: potentialMatch.normalizedDescription || potentialMatch.description,
            category: potentialMatch.category || 'other',
            features: potentialMatch.features || [],
            colors: potentialMatch.colors || [],
          }
        );

        // Only create match if above threshold
        if (score.confidenceScore >= matching.THRESHOLD) {
          matches.push({
            lostItemId: newItem.type === 'lost' ? newItemId : potentialMatchId,
            foundItemId: newItem.type === 'found' ? newItemId : potentialMatchId,
            confidenceScore: score.confidenceScore,
            explanation: score.explanation,
            breakdown: score.breakdown,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'pending', // pending review by users
          });
        }
      } catch (error) {
        console.error(`Error scoring match between ${newItemId} and ${potentialMatchId}:`, error);
      }
    }

    // Batch write matches
    if (matches.length > 0) {
      const batch = db.batch();
      matches.forEach(match => {
        batch.set(db.collection('matches').doc(), match);
      });
      await batch.commit();
      console.log(`Created ${matches.length} matches for item ${newItemId}`);
    }
  } catch (error) {
    console.error('Error finding matches:', error);
  }
}

/**
 * HTTP Endpoint: Create a new item
 * Receives item data and triggers processing
 */
exports.createItem = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { userId, title, description, imageUrl, type } = req.body;

      if (!userId || !title || !description || !imageUrl || !type) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      if (type !== 'lost' && type !== 'found') {
        res.status(400).json({ error: 'Type must be "lost" or "found"' });
        return;
      }

      // Create item in Firestore
      const itemRef = await db.collection('items').add({
        type,
        title,
        description,
        imageUrl,
        createdBy: userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'open',
        imageLabels: [],
        category: 'other',
        features: [],
        colors: [],
      });

      res.json({
        success: true,
        itemId: itemRef.id,
        message: 'Item created successfully',
      });
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * HTTP Endpoint: Get matches for an item
 */
exports.getMatches = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { itemId } = req.query;

      if (!itemId) {
        res.status(400).json({ error: 'itemId is required' });
        return;
      }

      // Get item
      const itemDoc = await db.collection('items').doc(itemId).get();
      if (!itemDoc.exists) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }

      const item = itemDoc.data();

      // Get matches
      const matchesQuery = item.type === 'lost'
        ? db.collection('matches').where('lostItemId', '==', itemId)
        : db.collection('matches').where('foundItemId', '==', itemId);

      const matchDocs = await matchesQuery.orderBy('confidenceScore', 'desc').get();

      const matches = [];
      for (const doc of matchDocs.docs) {
        const match = doc.data();
        const otherItemId = item.type === 'lost' ? match.foundItemId : match.lostItemId;
        const otherItemDoc = await db.collection('items').doc(otherItemId).get();

        if (otherItemDoc.exists) {
          matches.push({
            matchId: doc.id,
            ...match,
            otherItem: {
              id: otherItemId,
              ...otherItemDoc.data(),
            },
          });
        }
      }

      res.json({
        success: true,
        itemId,
        matchCount: matches.length,
        matches,
      });
    } catch (error) {
      console.error('Error getting matches:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * HTTP Endpoint: Get items list
 */
exports.getItems = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'GET') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { type, limit = 20, status = 'open' } = req.query;

      let query = db.collection('items').where('status', '==', status);

      if (type && (type === 'lost' || type === 'found')) {
        query = query.where('type', '==', type);
      }

      const docs = await query.orderBy('createdAt', 'desc').limit(parseInt(limit)).get();

      const items = docs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      res.json({
        success: true,
        count: items.length,
        items,
      });
    } catch (error) {
      console.error('Error getting items:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * HTTP Endpoint: Upload image to Cloud Storage
 */
exports.uploadImage = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { userId, file, filename } = req.body;

      if (!userId || !file || !filename) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const filepath = `items/${userId}/${Date.now()}_${filename}`;

      // Upload file
      const file_obj = storage.file(filepath);
      await file_obj.save(Buffer.from(file, 'base64'), {
        metadata: {
          contentType: 'image/jpeg',
        },
      });

      // Make public
      await file_obj.makePublic();

      // Get public URL
      const publicUrl = `https://storage.googleapis.com/${storage.name}/${filepath}`;

      res.json({
        success: true,
        imageUrl: publicUrl,
        filepath,
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ error: error.message });
    }
  });
});

/**
 * HTTP Endpoint: Mark match as resolved
 */
exports.resolveMatch = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    try {
      const { matchId, itemIds } = req.body;

      if (!matchId || !itemIds || itemIds.length === 0) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      // Update match status
      await db.collection('matches').doc(matchId).update({
        status: 'resolved',
        resolvedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Update item statuses
      const batch = db.batch();
      itemIds.forEach(itemId => {
        batch.update(db.collection('items').doc(itemId), {
          status: 'matched',
          matchedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      });
      await batch.commit();

      res.json({
        success: true,
        message: 'Match resolved successfully',
      });
    } catch (error) {
      console.error('Error resolving match:', error);
      res.status(500).json({ error: error.message });
    }
  });
});
