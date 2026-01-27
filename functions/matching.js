/**
 * AI Matching Logic for Lost & Found Items
 * Combines Vision API, Gemini API, and semantic similarity
 */

const vision = require('@google-cloud/vision');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const visionClient = new vision.ImageAnnotatorClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Weights for matching algorithm
const WEIGHTS = {
  IMAGE_SIMILARITY: parseFloat(process.env.IMAGE_SIMILARITY_WEIGHT) || 0.4,
  TEXT_SIMILARITY: parseFloat(process.env.TEXT_SIMILARITY_WEIGHT) || 0.4,
  METADATA_SIMILARITY: parseFloat(process.env.METADATA_SIMILARITY_WEIGHT) || 0.2,
};

const THRESHOLD = parseFloat(process.env.MATCHING_CONFIDENCE_THRESHOLD) || 0.6;

/**
 * Extract image features using Google Cloud Vision API
 */
async function extractImageFeatures(imageUrl) {
  try {
    const request = {
      image: { source: { imageUri: imageUrl } },
      features: [
        { type: 'LABEL_DETECTION', maxResults: 10 },
        { type: 'OBJECT_LOCALIZATION', maxResults: 10 },
        { type: 'IMAGE_PROPERTIES' },
        { type: 'TEXT_DETECTION' },
      ],
    };

    const [response] = await visionClient.annotateImage(request);

    return {
      labels: response.labelAnnotations?.map(l => ({
        description: l.description,
        confidence: l.confidence,
      })) || [],
      objects: response.localizedObjectAnnotations?.map(o => ({
        name: o.name,
        confidence: o.confidence,
      })) || [],
      colors: response.imagePropertiesAnnotation?.dominantColors?.colors?.slice(0, 3).map(c => ({
        red: c.color?.red || 0,
        green: c.color?.green || 0,
        blue: c.color?.blue || 0,
        pixelFraction: c.pixelFraction,
      })) || [],
      text: response.textAnnotations?.[0]?.description || '',
    };
  } catch (error) {
    console.error('Vision API error:', error);
    throw error;
  }
}

/**
 * Normalize and understand text using Gemini API
 */
async function normalizeItemDescription(description, imageLabels) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const labelsText = imageLabels
      .map(l => `${l.description} (${(l.confidence * 100).toFixed(1)}%)`)
      .join(', ');

    const prompt = `You are analyzing a lost or found item description for a campus lost & found system.

Description: "${description}"
Detected visual features: ${labelsText}

Please provide:
1. A normalized, standardized description (2-3 sentences)
2. The primary item category (electronics, clothing, accessories, documents, other)
3. Key identifying features (max 5 bullet points)
4. Color(s) if mentioned or detected

Respond in JSON format:
{
  "normalized_description": "...",
  "category": "...",
  "features": ["...", "..."],
  "colors": ["..."]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      normalized_description: description,
      category: 'other',
      features: [],
      colors: [],
    };
  } catch (error) {
    console.error('Gemini normalization error:', error);
    return {
      normalized_description: description,
      category: 'other',
      features: [],
      colors: [],
    };
  }
}

/**
 * Calculate semantic similarity between two texts using Gemini
 */
async function calculateSemanticSimilarity(text1, text2) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Compare these two item descriptions for a lost & found system.
How similar are they? Consider the objects described, colors, materials, and identifying features.

Item 1: "${text1}"
Item 2: "${text2}"

Respond with ONLY a number between 0 and 1 (e.g., 0.85) representing the similarity.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const score = parseFloat(text);

    return isNaN(score) ? 0 : Math.min(1, Math.max(0, score));
  } catch (error) {
    console.error('Semantic similarity error:', error);
    return 0;
  }
}

/**
 * Calculate image similarity based on Vision API features
 */
function calculateImageSimilarity(features1, features2) {
  let score = 0;

  // Label similarity (most important)
  const labels1 = features1.labels.map(l => l.description.toLowerCase());
  const labels2 = features2.labels.map(l => l.description.toLowerCase());

  const commonLabels = labels1.filter(l => labels2.includes(l)).length;
  const labelSimilarity = (2 * commonLabels) / (labels1.length + labels2.length) || 0;
  score += labelSimilarity * 0.6;

  // Color similarity
  const avgColor1 = features1.colors[0];
  const avgColor2 = features2.colors[0];

  if (avgColor1 && avgColor2) {
    const colorDistance = Math.sqrt(
      Math.pow(avgColor1.red - avgColor2.red, 2) +
        Math.pow(avgColor1.green - avgColor2.green, 2) +
        Math.pow(avgColor1.blue - avgColor2.blue, 2)
    );
    const colorSimilarity = 1 - colorDistance / (255 * Math.sqrt(3));
    score += colorSimilarity * 0.4;
  }

  return Math.min(1, Math.max(0, score));
}

/**
 * Calculate metadata similarity (category and features)
 */
function calculateMetadataSimilarity(normalized1, normalized2) {
  let score = 0;

  // Category match
  if (normalized1.category === normalized2.category) {
    score += 0.5;
  }

  // Feature overlap
  const features1 = normalized1.features.map(f => f.toLowerCase());
  const features2 = normalized2.features.map(f => f.toLowerCase());

  const commonFeatures = features1.filter(f => features2.some(f2 => f2.includes(f) || f.includes(f2))).length;
  const featureOverlap = (2 * commonFeatures) / (features1.length + features2.length) || 0;
  score += featureOverlap * 0.5;

  return Math.min(1, Math.max(0, score));
}

/**
 * Generate a human-readable explanation for a match using Gemini
 */
async function generateMatchExplanation(lostItem, foundItem, imageSimilarity, textSimilarity, metadataSimilarity) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `You are analyzing a potential match between a lost item and a found item for a campus lost & found system.

Lost Item: ${lostItem.title}
Description: ${lostItem.description}

Found Item: ${foundItem.title}
Description: ${foundItem.description}

Matching Scores:
- Visual Similarity: ${(imageSimilarity * 100).toFixed(1)}%
- Description Similarity: ${(textSimilarity * 100).toFixed(1)}%
- Category Match: ${(metadataSimilarity * 100).toFixed(1)}%

Generate a brief, friendly explanation (2-3 sentences) for why these items might match.
Focus on the most compelling matching features.
Speak to a student.

Response format:
"[Explanation text]"`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Remove quotes if present
    if (text.startsWith('"') && text.endsWith('"')) {
      text = text.slice(1, -1);
    }

    return text;
  } catch (error) {
    console.error('Explanation generation error:', error);
    return 'These items may match based on their visual and textual similarities.';
  }
}

/**
 * Main matching function
 */
async function findMatches(item) {
  try {
    console.log(`Processing item: ${item.id}`);

    // Extract image features
    const imageFeatures = await extractImageFeatures(item.imageUrl);
    console.log('Image features extracted');

    // Normalize description
    const normalizedItem = await normalizeItemDescription(item.description, imageFeatures.labels);
    console.log('Description normalized');

    // This would be called for each opposite-type item in database
    return {
      imageFeatures,
      normalizedItem,
    };
  } catch (error) {
    console.error('Matching error:', error);
    throw error;
  }
}

/**
 * Score a single match
 */
async function scoreMatch(lostItem, foundItem, lostFeatures, lostNormalized, foundFeatures, foundNormalized) {
  try {
    // Calculate individual similarity scores
    const imageSimilarity = calculateImageSimilarity(lostFeatures, foundFeatures);
    const textSimilarity = await calculateSemanticSimilarity(lostItem.description, foundItem.description);
    const metadataSimilarity = calculateMetadataSimilarity(lostNormalized, foundNormalized);

    // Calculate weighted confidence score
    const confidenceScore =
      imageSimilarity * WEIGHTS.IMAGE_SIMILARITY +
      textSimilarity * WEIGHTS.TEXT_SIMILARITY +
      metadataSimilarity * WEIGHTS.METADATA_SIMILARITY;

    // Generate explanation only if above threshold
    let explanation = '';
    if (confidenceScore >= THRESHOLD) {
      explanation = await generateMatchExplanation(
        lostItem,
        foundItem,
        imageSimilarity,
        textSimilarity,
        metadataSimilarity
      );
    }

    return {
      confidenceScore: Math.min(1, Math.max(0, confidenceScore)),
      explanation,
      breakdown: {
        imageSimilarity,
        textSimilarity,
        metadataSimilarity,
      },
    };
  } catch (error) {
    console.error('Scoring error:', error);
    throw error;
  }
}

module.exports = {
  extractImageFeatures,
  normalizeItemDescription,
  calculateSemanticSimilarity,
  calculateImageSimilarity,
  calculateMetadataSimilarity,
  generateMatchExplanation,
  findMatches,
  scoreMatch,
  WEIGHTS,
  THRESHOLD,
};
