/**
 * Main Application Logic
 */

// State
let currentReportType = 'lost';
let selectedImage = null;
let currentFilter = 'all';

// Elements
const reportLostBtn = document.getElementById('reportLostBtn');
const reportFoundBtn = document.getElementById('reportFoundBtn');
const viewMatchesBtn = document.getElementById('viewMatchesBtn');
const reportModal = document.getElementById('reportModal');
const reportTitle = document.getElementById('reportTitle');
const itemImage = document.getElementById('itemImage');
const imagePreview = document.getElementById('imagePreview');
const itemTitle = document.getElementById('itemTitle');
const itemDescription = document.getElementById('itemDescription');
const submitItemBtn = document.getElementById('submitItemBtn');
const closeReportBtn = document.getElementById('closeReportBtn');
const itemsList = document.getElementById('itemsList');
const matchesList = document.getElementById('matchesList');
const matchesContainer = document.getElementById('matchesContainer');
const loading = document.getElementById('loading');
const toast = document.getElementById('toast');

/**
 * Show Loading Indicator
 */
function showLoading(show) {
  loading.style.display = show ? 'flex' : 'none';
}

/**
 * Show Toast Notification
 */
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.style.display = 'block';

  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

/**
 * Handle Image Selection
 */
itemImage.addEventListener('change', e => {
  const file = e.target.files[0];

  if (!file) return;

  // Check file size
  if (file.size > CONFIG.MAX_IMAGE_SIZE) {
    showToast('Image size must be less than 5MB', 'error');
    return;
  }

  // Check file type
  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file', 'error');
    return;
  }

  selectedImage = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = e => {
    imagePreview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; border-radius: 8px;" />`;
  };
  reader.readAsDataURL(file);
});

/**
 * Open Report Modal
 */
function openReportModal(type) {
  currentReportType = type;
  reportTitle.textContent = type === 'lost' ? 'Report Lost Item' : 'Report Found Item';
  reportModal.style.display = 'flex';

  // Reset form
  itemTitle.value = '';
  itemDescription.value = '';
  selectedImage = null;
  itemImage.value = '';
  imagePreview.innerHTML = '';
}

/**
 * Close Report Modal
 */
function closeReportModal() {
  reportModal.style.display = 'none';
}

/**
 * Compress Image
 */
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(blob => {
          resolve(blob);
        }, 'image/jpeg', CONFIG.IMAGE_COMPRESS_QUALITY);
      };
    };
    reader.onerror = reject;
  });
}

/**
 * Upload Image to Firebase Storage
 */
async function uploadImage(file, userId) {
  try {
    // Compress image
    const compressedFile = await compressImage(file);

    // Create storage path
    const timestamp = Date.now();
    const filename = `${timestamp}_${file.name}`;
    const filepath = `items/${userId}/${filename}`;

    // Upload to Storage
    const storageRef = storage.ref(filepath);
    const uploadTask = storageRef.put(compressedFile);

    // Return download URL
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload progress: ${progress}%`);
        },
        error => {
          reject(error);
        },
        async () => {
          const downloadUrl = await storageRef.getDownloadURL();
          resolve(downloadUrl);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

/**
 * Submit Item Report
 */
async function submitItemReport() {
  if (!selectedImage) {
    showToast('Please select an image', 'error');
    return;
  }

  const title = itemTitle.value.trim();
  const description = itemDescription.value.trim();

  if (!title || !description) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  try {
    showLoading(true);

    // Upload image
    console.log('Uploading image...');
    const imageUrl = await uploadImage(selectedImage, currentUser.uid);
    console.log('Image uploaded:', imageUrl);

    // Create item in Firestore
    console.log('Creating item...');
    const itemRef = await db.collection('items').add({
      type: currentReportType,
      title,
      description,
      imageUrl,
      createdBy: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'open',
      imageLabels: [],
      category: 'other',
      features: [],
      colors: [],
    });

    console.log('Item created:', itemRef.id);

    showToast(
      'Item reported successfully! AI will find matches in the next few moments.',
      'success'
    );

    // Reset form and close modal
    closeReportModal();
    selectedImage = null;
    itemImage.value = '';
    imagePreview.innerHTML = '';

    // Refresh items list
    setTimeout(() => {
      loadItems();
    }, 1000);
  } catch (error) {
    console.error('Error submitting item:', error);
    showToast(`Error: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Load Items from Firestore
 */
async function loadItems() {
  try {
    let query = db.collection('items').where('status', '==', 'open');

    if (currentFilter !== 'all') {
      query = query.where('type', '==', currentFilter);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').limit(20).get();

    itemsList.innerHTML = '';

    if (snapshot.empty) {
      itemsList.innerHTML = '<p style="text-align: center; padding: 20px;">No items found</p>';
      return;
    }

    for (const doc of snapshot.docs) {
      const item = doc.data();
      const badge = item.type === 'lost' ? '😭 LOST' : '🎉 FOUND';
      const badgeClass = item.type === 'lost' ? 'badge-lost' : 'badge-found';

      const matchCount = await getMatchCount(doc.id);

      const itemCard = document.createElement('div');
      itemCard.className = 'item-card';
      itemCard.innerHTML = `
        <div class="item-image-container">
          <img src="${item.imageUrl}" alt="${item.title}" class="item-image" />
          <span class="badge ${badgeClass}">${badge}</span>
          ${matchCount > 0 ? `<span class="match-badge">🔗 ${matchCount}</span>` : ''}
        </div>
        <div class="item-info">
          <h3>${item.title}</h3>
          <p>${item.description.substring(0, 80)}${item.description.length > 80 ? '...' : ''}</p>
          <div class="item-footer">
            <small>${formatDate(item.createdAt)}</small>
            <button class="btn btn-small" onclick="viewItemMatches('${doc.id}')">View Matches</button>
          </div>
        </div>
      `;
      itemsList.appendChild(itemCard);
    }
  } catch (error) {
    console.error('Error loading items:', error);
    showToast('Error loading items', 'error');
  }
}

/**
 * Get Match Count for Item
 */
async function getMatchCount(itemId) {
  try {
    const item = await db.collection('items').doc(itemId).get();
    const itemType = item.data().type;

    const query = itemType === 'lost'
      ? db.collection('matches').where('lostItemId', '==', itemId)
      : db.collection('matches').where('foundItemId', '==', itemId);

    const snapshot = await query.get();
    return snapshot.size;
  } catch (error) {
    return 0;
  }
}

/**
 * View Matches for Item
 */
async function viewItemMatches(itemId) {
  try {
    showLoading(true);

    const itemDoc = await db.collection('items').doc(itemId).get();
    const item = itemDoc.data();
    const itemType = item.type;

    // Query for matches
    const matchQuery = itemType === 'lost'
      ? db.collection('matches').where('lostItemId', '==', itemId)
      : db.collection('matches').where('foundItemId', '==', itemId);

    const matchDocs = await matchQuery.orderBy('confidenceScore', 'desc').get();

    matchesList.innerHTML = '';
    matchesContainer.style.display = matchDocs.size === 0 ? 'none' : 'block';

    if (matchDocs.size === 0) {
      showToast('No matches found yet. Check back soon!', 'info');
      return;
    }

    for (const doc of matchDocs.docs) {
      const match = doc.data();
      const otherItemId = itemType === 'lost' ? match.foundItemId : match.lostItemId;
      const otherItemDoc = await db.collection('items').doc(otherItemId).get();
      const otherItem = otherItemDoc.data();

      const confidencePercent = (match.confidenceScore * 100).toFixed(1);
      const scoreColor =
        match.confidenceScore >= 0.8 ? '#4CAF50' :
        match.confidenceScore >= 0.6 ? '#FFC107' : '#FF9800';

      const matchCard = document.createElement('div');
      matchCard.className = 'match-card';
      matchCard.innerHTML = `
        <div class="match-header">
          <h3>Potential Match!</h3>
          <div class="confidence-score" style="background-color: ${scoreColor};">
            ${confidencePercent}% Match
          </div>
        </div>

        <div class="match-items">
          <div class="match-item">
            <h4>Your ${item.type === 'lost' ? 'Lost' : 'Found'} Item</h4>
            <img src="${item.imageUrl}" alt="${item.title}" />
            <p><strong>${item.title}</strong></p>
            <p>${item.description}</p>
          </div>

          <div class="match-separator">↔️</div>

          <div class="match-item">
            <h4>${otherItem.type === 'lost' ? 'Lost' : 'Found'} Item</h4>
            <img src="${otherItem.imageUrl}" alt="${otherItem.title}" />
            <p><strong>${otherItem.title}</strong></p>
            <p>${otherItem.description}</p>
          </div>
        </div>

        <div class="match-explanation">
          <h4>🤖 AI Analysis</h4>
          <p>${match.explanation}</p>
          <div class="match-breakdown">
            <div class="breakdown-item">
              <span>Visual Match:</span>
              <strong>${(match.breakdown.imageSimilarity * 100).toFixed(1)}%</strong>
            </div>
            <div class="breakdown-item">
              <span>Text Match:</span>
              <strong>${(match.breakdown.textSimilarity * 100).toFixed(1)}%</strong>
            </div>
            <div class="breakdown-item">
              <span>Category Match:</span>
              <strong>${(match.breakdown.metadataSimilarity * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>

        <div class="match-actions">
          <button class="btn btn-success" onclick="resolveMatch('${doc.id}', ['${itemId}', '${otherItemId}'])">
            ✓ This is a Match!
          </button>
          <button class="btn btn-secondary" onclick="dismissMatch()">
            ✗ Not a Match
          </button>
        </div>
      `;
      matchesList.appendChild(matchCard);
    }

    // Scroll to matches
    matchesContainer.scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error loading matches:', error);
    showToast('Error loading matches', 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Resolve Match
 */
async function resolveMatch(matchId, itemIds) {
  try {
    showLoading(true);

    // Update match status
    await db.collection('matches').doc(matchId).update({
      status: 'resolved',
      resolvedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Update item statuses
    for (const itemId of itemIds) {
      await db.collection('items').doc(itemId).update({
        status: 'matched',
        matchedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }

    showToast('Great! Match recorded. Contact the other user to arrange pickup!', 'success');
    loadItems();
    matchesContainer.style.display = 'none';
  } catch (error) {
    console.error('Error resolving match:', error);
    showToast('Error resolving match', 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Dismiss Match
 */
function dismissMatch() {
  matchesContainer.style.display = 'none';
  showToast('Match dismissed', 'info');
}

/**
 * Format Date
 */
function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Event Listeners
 */
reportLostBtn.addEventListener('click', () => openReportModal('lost'));
reportFoundBtn.addEventListener('click', () => openReportModal('found'));
submitItemBtn.addEventListener('click', submitItemReport);
closeReportBtn.addEventListener('click', closeReportModal);

viewMatchesBtn.addEventListener('click', () => {
  loadItems();
});

// Filter buttons
document.querySelectorAll('[data-filter]').forEach(btn => {
  btn.addEventListener('click', e => {
    currentFilter = e.target.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    loadItems();
  });
});

// Load items on startup
loadItems();

// Refresh items every 30 seconds
setInterval(() => {
  if (currentUser && matchesContainer.style.display === 'none') {
    loadItems();
  }
}, 30000);
