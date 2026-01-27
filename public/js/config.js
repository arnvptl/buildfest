/**
 * Firebase Configuration
 * Update these values with your Firebase project settings
 */

const firebaseConfig = {
  apiKey: 'YOUR_FIREBASE_API_KEY',
  authDomain: 'your-project-id.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project-id.appspot.com',
  messagingSenderId: 'your-messaging-sender-id',
  appId: 'your-app-id',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get references
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Cloud Functions Base URL
const FUNCTIONS_URL = 'https://your-region-your-project-id.cloudfunctions.net';

// Configuration
const CONFIG = {
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  IMAGE_COMPRESS_QUALITY: 0.8,
  MATCHING_THRESHOLD: 0.6,
};
