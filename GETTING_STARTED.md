# 🚀 Getting Started Guide

Welcome to **Campus Lost & Found** - an AI-powered web application that helps students recover lost items on campus using Google Cloud AI technologies.

This guide will get you up and running in **15-20 minutes**.

---

## ✅ Prerequisites

Before you start, ensure you have:

- **Node.js v18+** ([download](https://nodejs.org))
  ```bash
  node --version  # Should be v18 or higher
  ```

- **Google Cloud Account** ([create free account](https://cloud.google.com))

- **Firebase Account** ([create free project](https://console.firebase.google.com))

- **Text Editor** (VS Code, Sublime, etc.)

- **Command Line Terminal** (Terminal, CMD, PowerShell)

---

## 🎯 Step 1: Get Your Google Cloud Credentials (5 min)

### 1a. Create a Google Cloud Project
```bash
1. Go to: https://console.cloud.google.com
2. Click "Select a Project" → "New Project"
3. Name: "Campus Lost Found"
4. Click "Create"
5. Wait for project to be created
```

### 1b. Enable Required APIs
```bash
# In Google Cloud Console, search for and enable:
1. "Cloud Vision API" → Click "Enable"
2. "Generative Language API" → Click "Enable"
3. "Firestore API" → Click "Enable"
4. "Cloud Functions API" → Click "Enable"
5. "Cloud Logging API" → Click "Enable"
```

### 1c. Create Service Account
```bash
1. Go to: APIs & Services → Credentials
2. Click "Create Credentials" → "Service Account"
3. Name: "lostandfound-sa"
4. Click "Create and Continue"
5. Grant role: "Editor" (for simplicity)
6. Click "Continue" and "Done"
```

### 1d. Create and Download Service Account Key
```bash
1. Click the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose "JSON"
5. Click "Create" (JSON file downloads)
6. Save it as: `service-account-key.json`
7. Keep this file safe! (Don't share or commit to git)
```

### 1e. Get Gemini API Key
```bash
1. Go to: https://aistudio.google.com
2. Click "Get API Key"
3. Click "Create API Key in new project"
4. Copy the API key
5. Keep this safe!
```

---

## 🎯 Step 2: Create a Firebase Project (5 min)

### 2a. Create Firebase Project
```bash
1. Go to: https://console.firebase.google.com
2. Click "Add Project"
3. Name: "campus-lost-found"
4. Uncheck "Enable Google Analytics" (for MVP)
5. Click "Create Project"
6. Wait 2-3 minutes for creation
```

### 2b. Enable Firestore Database
```bash
1. In Firebase Console, click "Firestore Database"
2. Click "Create Database"
3. Choose "Start in Production Mode"
4. Choose location: "us-central1" (or nearest to you)
5. Click "Create"
```

### 2c. Enable Authentication
```bash
1. Click "Authentication" → "Get Started"
2. Click "Email/Password"
3. Enable it
4. Click "Save"
```

### 2d. Enable Cloud Storage
```bash
1. Click "Storage" → "Get Started"
2. Keep default rules (for now)
3. Choose location: "us-central1"
4. Click "Done"
```

### 2e. Get Firebase Config
```bash
1. Click the gear icon → "Project Settings"
2. Go to "General" tab
3. You'll see the "firebaseConfig" object
4. Keep this page open (you'll need these values)
```

---

## 🎯 Step 3: Clone and Configure Project (3 min)

### 3a. Clone the Repository
```bash
# Navigate to where you want the project
cd Desktop

# Clone (or download and unzip)
git clone https://github.com/your-username/ai-campus-lostandfound.git
cd ai-campus-lostandfound

# Or download ZIP from GitHub and extract
```

### 3b. Install Dependencies
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Install Cloud Functions dependencies
cd functions
npm install
cd ..
```

### 3c. Configure Environment Variables
```bash
# Copy example file
cp .env.example functions/.env

# Edit functions/.env with your values
# Open in editor and fill in:
#   - FIREBASE_PROJECT_ID: "campus-lost-found"
#   - GEMINI_API_KEY: your_key_from_aistudio
#   - GOOGLE_CLOUD_PROJECT_ID: your_project_id
#   - GOOGLE_APPLICATION_CREDENTIALS: path/to/service-account-key.json
#
# Save the file
```

### 3d. Configure Firebase Frontend
```bash
# Edit: public/js/config.js
# Find this section:
const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

# Replace with values from Firebase Console
# Go to: Project Settings → General → scroll down
# Copy the whole firebaseConfig object
# Paste it to replace the template
```

---

## 🎯 Step 4: Deploy to Firebase (5 min)

### 4a. Login to Firebase
```bash
firebase login

# This opens a browser to sign in
# Click "Allow" when prompted
# Return to terminal when done
```

### 4b. Link Project to Your Firebase
```bash
firebase use --add

# Terminal will list your Firebase projects
# Select "campus-lost-found" (or your project name)
# Give it an alias (e.g., "default")
```

### 4c. Deploy Everything
```bash
# Deploy Cloud Functions (takes 2-3 min)
firebase deploy --only functions

# Deploy Database Rules
firebase deploy --only firestore:rules

# Deploy Storage Rules
firebase deploy --only storage

# Deploy Frontend
firebase deploy --only hosting

# Or deploy everything at once:
firebase deploy
```

### 4d. View Your Live App
```bash
# Firebase will show the URL after deployment:
# https://your-project-id.web.app

# Open it in your browser!
# You should see the Campus Lost & Found landing page
```

---

## 🎯 Step 5: Test the Application (2 min)

### 5a. Create Test Accounts
```
1. Open your app: https://your-project-id.web.app
2. Click "Login"
3. Click "Create Account"
4. Create Account 1:
   - Email: student1@campus.edu
   - Password: Test1234!
5. Sign Out
6. Create Account 2:
   - Email: student2@campus.edu
   - Password: Test1234!
```

### 5b. Test Lost Item Report
```
1. Sign in as student1@campus.edu
2. Click "Report Lost Item"
3. Upload a watch/backpack image (any image)
4. Title: "Red Apple Watch"
5. Description: "Lost my red apple watch, series 8, near library"
6. Click "Submit"
7. Wait 30 seconds (AI is processing)
```

### 5c. Test Found Item Report
```
1. Sign out (click "Logout")
2. Open in another browser/incognito: https://your-project-id.web.app
3. Sign in as student2@campus.edu
4. Click "Report Found Item"
5. Upload a similar watch image
6. Title: "Red Watch Found"
7. Description: "Found a red smartwatch with apple logo in library"
8. Click "Submit"
```

### 5d. Check for Matches
```
1. Sign out
2. Sign back in as student1@campus.edu
3. Refresh page or wait 30 seconds
4. Click "View Matches"
5. You should see a match card!
   - Confidence score (e.g., 85%)
   - Both images side-by-side
   - AI explanation from Gemini
   - Matching breakdown
6. Click "This is a Match!" to confirm
```

✅ **Congratulations!** Your app is working!

---

## 🎬 Demo Script (for presentation)

### Setup (Before Demo)
```
- Pre-create 5-10 items in the app
- Have 2-3 matches already created
- Test on WiFi (not mobile hotspot)
- Close unnecessary browser tabs
- Clear browser cache
```

### Demo Flow (3 minutes)
```
[0:00-0:30] Problem
"Students lose items on campus. Finding them is hard - 
no centralized system, no search, just lost. 
We built Campus Lost & Found with Google AI."

[0:30-1:00] Upload Lost Item
- Sign in as User 1
- Click "Report Lost Item"
- Show image upload and description
- Submit
- Say: "Within seconds, Google Vision API analyzes the image"

[1:00-1:30] Upload Found Item
- Switch to User 2 (different browser tab)
- Report Found Item
- Use similar image/description
- Submit
- Say: "Gemini API understands the description"

[1:30-2:30] Show Matching
- Back to User 1
- Click "View Matches"
- Show match card
- Highlight: confidence score, images, explanation
- Show breakdown (visual/text/category scores)
- Say: "Our matching algorithm combines three signals:
  1. Image analysis (Google Vision)
  2. Text understanding (Gemini)
  3. Metadata matching (colors, categories)"
- Click "This is a Match!"

[2:30-3:00] Closing
"Campus Lost & Found demonstrates:
- Google Cloud Vision API for image analysis
- Gemini API for semantic understanding
- Firestore for real-time database
- Multimodal AI for accurate matching
Imagine this deployed across your entire campus!"
```

---

## ❌ Troubleshooting

### Problem: "Module not found" error
```bash
# Solution: Reinstall dependencies
cd functions
npm install
cd ..
firebase deploy --only functions
```

### Problem: "API key not valid"
```
1. Check your firebaseConfig in public/js/config.js
2. Make sure it matches Firebase Console → Project Settings
3. Redeploy: firebase deploy --only hosting
4. Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
```

### Problem: "Vision API not enabled"
```bash
# Solution: Enable in Google Cloud Console
gcloud services enable vision.googleapis.com

# Or via web:
# 1. Google Cloud Console
# 2. APIs & Services → Library
# 3. Search "Cloud Vision"
# 4. Click "Enable"
```

### Problem: "Images not uploading"
```
1. Check file size (< 5MB)
2. Ensure file is image format (jpg, png, etc.)
3. Check storage.rules in Firebase Console
4. Restart the app
```

### Problem: "Matches not showing"
```
1. Wait 30-60 seconds (AI processing)
2. Refresh the page
3. Check Cloud Functions logs for errors
   - Firebase Console → Functions → Logs
4. Create items with very similar descriptions
```

---

## 📊 Next Steps

### Immediate (If Presenting)
1. Practice the 3-minute demo
2. Create compelling sample items
3. Test on different browsers
4. Have WiFi backup plan

### Short-term (MVP Improvements)
1. Add user profiles
2. Implement in-app messaging
3. Add location/GPS matching
4. Create item categories with icons

### Medium-term (Scaling)
1. Deploy to your campus
2. Market to student body
3. Collect feedback
4. Improve matching algorithm

### Long-term (Production)
1. Multi-campus network
2. Mobile apps (iOS/Android)
3. Advanced analytics
4. University integration

---

## 📚 Learning Resources

- **Firebase Docs**: https://firebase.google.com/docs
- **Google Cloud Vision**: https://cloud.google.com/vision/docs
- **Gemini API**: https://ai.google.dev
- **Cloud Functions**: https://firebase.google.com/docs/functions
- **JavaScript Guide**: https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Google Cloud project created
- [ ] Firebase project created
- [ ] Service account key downloaded
- [ ] Gemini API key obtained
- [ ] Project cloned locally
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Firebase frontend config updated
- [ ] Project deployed to Firebase
- [ ] App is live at web.app URL
- [ ] Test accounts created
- [ ] Item upload tested
- [ ] Matching works end-to-end
- [ ] Demo script practiced

---

## 🎉 You're Ready!

Your AI-powered Campus Lost & Found is live and ready to demo!

Questions? See:
- [README.md](README.md) - Project overview
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical details
- [QUICK_REFERENCE.md](QUICK_REFERENCE.md) - Quick answers
- [SETUP.md](SETUP.md) - Advanced setup

**Good luck with your hackathon! 🚀**

---

*Built with ❤️ using Google Cloud AI*
