# AI-Powered Campus Lost & Found - Setup Guide

## 🚀 Quick Start (5-10 minutes)

### Prerequisites
- Node.js v18+ installed
- Google Cloud Account with billing enabled
- Firebase project created
- Gemini API access enabled

### Step 1: Clone & Setup Project

```bash
# Navigate to project directory
cd ai-campus-lostandfound

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project named `campus-lost-found`
3. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Cloud Storage
   - Cloud Functions
   - Firebase Hosting

### Step 3: Configure Google Cloud

#### Enable APIs

```bash
gcloud services enable \
  vision.googleapis.com \
  generativeai.googleapis.com \
  firestore.googleapis.com \
  cloudfunctions.googleapis.com \
  cloudbuild.googleapis.com
```

#### Create Service Account

```bash
# Create service account
gcloud iam service-accounts create lostandfound-sa \
  --display-name="Lost and Found Service Account"

# Grant permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:lostandfound-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/vision.serviceAgent"

gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:lostandfound-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/firestore.serviceAgent"

# Create and download key
gcloud iam service-accounts keys create service-account-key.json \
  --iam-account=lostandfound-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

#### Enable Gemini API

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Click "Get API Key"
3. Create a new API key for the project

### Step 4: Configure Environment Variables

```bash
# Copy example to actual file
cp .env.example functions/.env

# Edit functions/.env with your values:
# - FIREBASE_PROJECT_ID
# - GEMINI_API_KEY
# - GOOGLE_APPLICATION_CREDENTIALS path
```

### Step 5: Update Firebase Config

Edit `public/js/config.js`:

```javascript
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

const FUNCTIONS_URL = 'https://your-region-your-project-id.cloudfunctions.net';
```

Get these values from Firebase Console → Project Settings → General tab.

### Step 6: Initialize Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Or link to existing project
firebase use --add
```

### Step 7: Deploy to Firebase

```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Storage Rules
firebase deploy --only storage

# Deploy Frontend to Hosting
firebase deploy --only hosting
```

### Step 8: Access Your App

- Frontend: `https://your-project-id.web.app`
- Admin Panel: Firebase Console

---

## 🧪 Testing the Application

### 1. Create Test Users

```bash
# Access Firebase Console → Authentication
# Create 2-3 test users with Gmail format emails
```

### 2. Test Lost Item Submission

1. Sign in as first user
2. Click "Report Lost Item"
3. Upload a sample image (use images from your campus)
4. Add description:
   - Title: "Red Apple Watch"
   - Description: "Apple Watch Series 8, red sport band, lost near library"
5. Submit

### 3. Test Found Item Submission

1. Sign in as second user
2. Click "Report Found Item"
3. Upload similar image
4. Add description:
   - Title: "Apple Watch Found"
   - Description: "Found red watch in library, apple logo visible"
5. Submit

### 4. Check Matches

- Cloud Functions will automatically process
- After 30-60 seconds, check "View Matches"
- Should show AI-generated match with confidence score

---

## 📊 Firestore Data Structure

### Items Collection
```json
{
  "type": "lost",
  "title": "Red Apple Watch",
  "description": "Apple Watch Series 8 with red band",
  "imageUrl": "https://storage.googleapis.com/...",
  "imageLabels": [
    {"description": "Watch", "confidence": 0.95},
    {"description": "Clothing", "confidence": 0.82}
  ],
  "category": "electronics",
  "features": ["Red", "Apple Watch", "Series 8"],
  "colors": [{"red": 255, "green": 0, "blue": 0}],
  "createdBy": "user123",
  "createdAt": "2024-01-15T10:30:00Z",
  "status": "open"
}
```

### Matches Collection
```json
{
  "lostItemId": "item1",
  "foundItemId": "item2",
  "confidenceScore": 0.87,
  "explanation": "This found watch matches your lost item - same color, brand, and distinctive features.",
  "breakdown": {
    "imageSimilarity": 0.90,
    "textSimilarity": 0.82,
    "metadataSimilarity": 0.88
  },
  "status": "pending",
  "createdAt": "2024-01-15T10:35:00Z"
}
```

---

## 🔧 Cloud Functions Details

### processItemUpload Function
- **Trigger**: New item created in Firestore
- **Actions**:
  1. Call Google Vision API for image analysis
  2. Call Gemini API for text normalization
  3. Find potential matches
  4. Score matches using multimodal algorithm
  5. Create match records if score > threshold

### Matching Algorithm
```
Confidence Score = 
  (Image Similarity × 40%) +
  (Text Similarity × 40%) +
  (Metadata Similarity × 20%)

Threshold: 0.6 (60%)
```

---

## 🚨 Troubleshooting

### Vision API errors
```bash
# Check API is enabled
gcloud services list --enabled | grep vision

# Check service account permissions
gcloud projects get-iam-policy YOUR_PROJECT_ID \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:*"
```

### Gemini API errors
- Verify API key in `functions/.env`
- Check API key has access to `generative-language` service

### Firestore quota errors
- Check Firestore usage in Firebase Console
- Free tier: 50K reads/day, 20K writes/day

### Storage errors
- Verify bucket name in `public/js/config.js`
- Check storage.rules allows authenticated uploads

---

## 📈 Performance Tips

1. **Image Optimization**
   - Frontend compresses to 80% JPEG quality
   - Vision API processes efficiently
   - Storage caches downloads

2. **Database Optimization**
   - Firestore indexes created for common queries
   - Limit match searches to 50 items
   - Archive old items after 30 days

3. **Function Optimization**
   - Functions run in parallel for multiple items
   - Gemini API calls batched when possible
   - Vision API uses cached results when available

---

## 🔐 Security Notes

- Firebase Rules restrict data access to authenticated users
- Storage Rules limit uploads to 5MB images
- Environment variables kept in Cloud Secret Manager (production)
- No API keys hardcoded in frontend

---

## 💰 Cost Estimation (Monthly)

| Service | Free Tier | Estimated Cost |
|---------|-----------|-----------------|
| Firestore | 50K reads, 20K writes | $1-5 |
| Cloud Functions | 2M requests | $2-10 |
| Cloud Storage | 5GB | $0.2-1 |
| Vision API | N/A | $3-15 |
| Gemini API | N/A | $2-10 |
| Firebase Hosting | 10GB/month | Free |
| **Total** | | ~$10-40 |

For a campus deployment, request credits from Google Cloud.

---

## 🎓 Demo Script (3 minutes)

1. **Introduction** (30 sec)
   - Show landing page
   - Explain the problem: Students lose items, takes time to find them

2. **Report Lost Item** (30 sec)
   - Click "Report Lost Item"
   - Show image upload and description
   - Submit

3. **Report Found Item** (30 sec)
   - Switch to another browser tab/incognito
   - Sign in as different user
   - Report similar item as "Found"
   - Submit

4. **AI Matching** (60 sec)
   - Show Firestore data with extracted features
   - Explain Vision API labels
   - Show "View Matches"
   - Highlight confidence score and AI explanation
   - Show match breakdown (image/text/metadata scores)

5. **Close Match** (30 sec)
   - Click "This is a Match!"
   - Show confirmation
   - Explain next steps for users

---

## 📞 Support & Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Google Cloud Vision API](https://cloud.google.com/vision/docs)
- [Gemini API Docs](https://ai.google.dev)
- [Cloud Functions](https://firebase.google.com/docs/functions)

---

## ✅ Deployment Checklist

- [ ] Google Cloud project created
- [ ] Firebase project configured
- [ ] Service account created and permissions granted
- [ ] Gemini API key obtained
- [ ] Environment variables configured
- [ ] Firebase config updated with real credentials
- [ ] Cloud Functions deployed
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Frontend deployed to Hosting
- [ ] Test users created
- [ ] App tested end-to-end
- [ ] Demo script practiced

Good luck with your hackathon! 🚀
