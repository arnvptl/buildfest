#!/bin/bash
# Environment Setup Helper
# This script helps configure your environment variables

echo "================================"
echo "Campus Lost & Found - Setup"
echo "================================"
echo ""
echo "This script helps you set up your environment."
echo ""

# Function to read user input
read_variable() {
    local prompt=$1
    local var_name=$2
    read -p "$prompt: " value
    export $var_name="$value"
    echo "$var_name=$value"
}

echo "📝 Step 1: Firebase Configuration"
echo "Get these values from: Firebase Console → Project Settings → General"
echo ""

read_variable "Enter Firebase API Key" FIREBASE_API_KEY
read_variable "Enter Project ID" FIREBASE_PROJECT_ID
read_variable "Enter Storage Bucket" FIREBASE_STORAGE_BUCKET
read_variable "Enter Messaging Sender ID" FIREBASE_MESSAGING_SENDER_ID
read_variable "Enter App ID" FIREBASE_APP_ID

echo ""
echo "📝 Step 2: Google Cloud Configuration"
echo "Get these values from: Google Cloud Console → APIs & Services"
echo ""

read_variable "Enter Google Cloud Project ID (same as Firebase)" GOOGLE_CLOUD_PROJECT_ID
read_variable "Enter Gemini API Key (from https://aistudio.google.com)" GEMINI_API_KEY
read_variable "Enter path to service-account-key.json" GOOGLE_APPLICATION_CREDENTIALS

echo ""
echo "📝 Step 3: Matching Configuration"
echo ""

read_variable "Enter Matching Confidence Threshold (0.6)" MATCHING_CONFIDENCE_THRESHOLD
read_variable "Enter Image Similarity Weight (0.4)" IMAGE_SIMILARITY_WEIGHT
read_variable "Enter Text Similarity Weight (0.4)" TEXT_SIMILARITY_WEIGHT
read_variable "Enter Metadata Similarity Weight (0.2)" METADATA_SIMILARITY_WEIGHT

echo ""
echo "✅ Creating .env file..."
echo ""

# Create .env file
cat > functions/.env << EOF
# Firebase Configuration
FIREBASE_API_KEY=$FIREBASE_API_KEY
FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET=$FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID=$FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID=$FIREBASE_APP_ID

# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=$GOOGLE_CLOUD_PROJECT_ID
GEMINI_API_KEY=$GEMINI_API_KEY
GOOGLE_APPLICATION_CREDENTIALS=$GOOGLE_APPLICATION_CREDENTIALS

# Matching Configuration
MATCHING_CONFIDENCE_THRESHOLD=$MATCHING_CONFIDENCE_THRESHOLD
IMAGE_SIMILARITY_WEIGHT=$IMAGE_SIMILARITY_WEIGHT
TEXT_SIMILARITY_WEIGHT=$TEXT_SIMILARITY_WEIGHT
METADATA_SIMILARITY_WEIGHT=$METADATA_SIMILARITY_WEIGHT
EOF

echo "✅ .env file created!"
echo ""
echo "📝 Step 4: Update Frontend Configuration"
echo "Edit: public/js/config.js"
echo ""
echo "Replace the firebaseConfig object with:"
echo ""
cat << EOF
const firebaseConfig = {
  apiKey: '$FIREBASE_API_KEY',
  authDomain: '${FIREBASE_PROJECT_ID}.firebaseapp.com',
  projectId: '$FIREBASE_PROJECT_ID',
  storageBucket: '$FIREBASE_STORAGE_BUCKET',
  messagingSenderId: '$FIREBASE_MESSAGING_SENDER_ID',
  appId: '$FIREBASE_APP_ID',
};
EOF

echo ""
echo "✅ Configuration complete!"
echo ""
echo "Next steps:"
echo "1. Edit public/js/config.js with the values above"
echo "2. Deploy: firebase deploy"
echo "3. Access your app!"
echo ""
