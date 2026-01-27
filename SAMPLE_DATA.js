/**
 * Sample Test Data for Campus Lost & Found
 * 
 * Use this to:
 * 1. Manually populate Firestore for testing
 * 2. Seed the app with example items
 * 3. Verify matching algorithm works
 * 
 * How to use:
 * - Open Firebase Console → Firestore
 * - Copy/paste items below into collections
 * - Or run: firebase shell → db.collection("items").add({...})
 */

// Sample Users
const sampleUsers = [
  {
    userId: "user1",
    name: "Alice",
    email: "alice@campus.edu",
    createdAt: new Date("2024-01-15T09:00:00Z"),
  },
  {
    userId: "user2",
    name: "Bob",
    email: "bob@campus.edu",
    createdAt: new Date("2024-01-15T09:15:00Z"),
  },
  {
    userId: "user3",
    name: "Carol",
    email: "carol@campus.edu",
    createdAt: new Date("2024-01-15T09:30:00Z"),
  },
];

// Sample Items - Perfect Match Pairs
const sampleItems = [
  // Pair 1: Apple Watch
  {
    type: "lost",
    title: "Red Apple Watch Series 8",
    description: "Lost my red Apple Watch Series 8 with red sport band. Has a small scratch on the back. Lost near the library on January 15th.",
    imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17e?w=400",
    imageLabels: [
      { description: "Watch", confidence: 0.97 },
      { description: "Wearable device", confidence: 0.91 },
      { description: "Electronic device", confidence: 0.88 },
    ],
    imageObjects: [{ name: "Watch", confidence: 0.92 }],
    imageDominantColors: [
      { red: 200, green: 20, blue: 20, pixelFraction: 0.7 },
      { red: 50, green: 50, blue: 50, pixelFraction: 0.2 },
    ],
    imageText: "",
    normalizedDescription: "Red Apple Watch Series 8 with sport band, small scratch on back",
    category: "electronics",
    features: ["Apple", "Watch", "Series 8", "Red", "Sport Band"],
    colors: ["red"],
    createdBy: "user1",
    createdAt: new Date("2024-01-15T10:30:00Z"),
    status: "open",
  },
  {
    type: "found",
    title: "Red Smartwatch Found",
    description: "Found a red smartwatch in the library. Appears to be an Apple device with a red band. Minor scratches on the back. Found on January 15th near the circulation desk.",
    imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    imageLabels: [
      { description: "Watch", confidence: 0.95 },
      { description: "Smartwatch", confidence: 0.89 },
      { description: "Wearable", confidence: 0.87 },
    ],
    imageObjects: [{ name: "Watch", confidence: 0.90 }],
    imageDominantColors: [
      { red: 210, green: 15, blue: 25, pixelFraction: 0.75 },
      { red: 40, green: 40, blue: 40, pixelFraction: 0.15 },
    ],
    imageText: "Apple",
    normalizedDescription: "Red Apple smartwatch, minor scratches, found in library",
    category: "electronics",
    features: ["Apple", "Smartwatch", "Red", "Band", "Found"],
    colors: ["red"],
    createdBy: "user2",
    createdAt: new Date("2024-01-15T11:45:00Z"),
    status: "open",
  },

  // Pair 2: Black Backpack
  {
    type: "lost",
    title: "Black College Backpack",
    description: "Lost a black North Face backpack with laptop compartment. Contains MacBook sticker on front. Lost at the student center on January 14th.",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    imageLabels: [
      { description: "Backpack", confidence: 0.96 },
      { description: "Bag", confidence: 0.93 },
      { description: "Black", confidence: 0.91 },
    ],
    imageObjects: [{ name: "Backpack", confidence: 0.94 }],
    imageDominantColors: [
      { red: 20, green: 20, blue: 20, pixelFraction: 0.85 },
      { red: 100, green: 100, blue: 100, pixelFraction: 0.1 },
    ],
    imageText: "North Face",
    normalizedDescription: "Black North Face backpack with MacBook sticker",
    category: "accessories",
    features: ["Black", "North Face", "Backpack", "Laptop"],
    colors: ["black"],
    createdBy: "user1",
    createdAt: new Date("2024-01-14T15:20:00Z"),
    status: "open",
  },
  {
    type: "found",
    title: "Black Backpack Found at Student Center",
    description: "Found a black backpack at the student center lost and found. Has a MacBook sticker on it. North Face brand. Appears to be in good condition.",
    imageUrl: "https://images.unsplash.com/photo-1577062578769-e71b99932e29?w=400",
    imageLabels: [
      { description: "Backpack", confidence: 0.94 },
      { description: "Luggage", confidence: 0.88 },
      { description: "Black", confidence: 0.90 },
    ],
    imageObjects: [{ name: "Backpack", confidence: 0.92 }],
    imageDominantColors: [
      { red: 30, green: 30, blue: 30, pixelFraction: 0.80 },
      { red: 110, green: 110, blue: 110, pixelFraction: 0.15 },
    ],
    imageText: "North Face",
    normalizedDescription: "Black North Face backpack with stickers, found at student center",
    category: "accessories",
    features: ["Black", "Backpack", "North Face", "Found"],
    colors: ["black"],
    createdBy: "user3",
    createdAt: new Date("2024-01-14T16:30:00Z"),
    status: "open",
  },

  // Pair 3: Blue Airpods Case
  {
    type: "lost",
    title: "Blue Airpods Pro Case",
    description: "Lost my blue Airpods Pro case with earbuds. Very distinctive bright blue color. Lost somewhere in the engineering building on January 15th morning.",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    imageLabels: [
      { description: "Earbuds", confidence: 0.92 },
      { description: "Electronics", confidence: 0.89 },
      { description: "Audio device", confidence: 0.86 },
    ],
    imageObjects: [{ name: "Airpods", confidence: 0.88 }],
    imageDominantColors: [
      { red: 50, green: 150, blue: 200, pixelFraction: 0.70 },
      { red: 255, green: 255, blue: 255, pixelFraction: 0.25 },
    ],
    imageText: "Airpods Pro",
    normalizedDescription: "Blue Airpods Pro case with earbuds",
    category: "electronics",
    features: ["Blue", "Airpods", "Pro", "Case"],
    colors: ["blue"],
    createdBy: "user2",
    createdAt: new Date("2024-01-15T09:00:00Z"),
    status: "open",
  },
  {
    type: "found",
    title: "Blue Earbuds Case Found",
    description: "Found a blue case with earbuds inside in the engineering building hallway. Says 'Airpods Pro' on it. Bright blue color, looks brand new.",
    imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400",
    imageLabels: [
      { description: "Earbuds", confidence: 0.90 },
      { description: "Audio", confidence: 0.87 },
      { description: "Wireless", confidence: 0.84 },
    ],
    imageObjects: [{ name: "Earbuds case", confidence: 0.89 }],
    imageDominantColors: [
      { red: 60, green: 160, blue: 210, pixelFraction: 0.72 },
      { red: 245, green: 245, blue: 245, pixelFraction: 0.23 },
    ],
    imageText: "Airpods",
    normalizedDescription: "Blue Airpods case with earbuds, found in engineering building",
    category: "electronics",
    features: ["Blue", "Earbuds", "Case", "Airpods"],
    colors: ["blue"],
    createdBy: "user3",
    createdAt: new Date("2024-01-15T10:15:00Z"),
    status: "open",
  },

  // Non-matching items (for negative test)
  {
    type: "lost",
    title: "Red Jacket",
    description: "Lost a bright red winter jacket at the gym. Very warm, puffy material. North Face brand.",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=400",
    imageLabels: [
      { description: "Jacket", confidence: 0.94 },
      { description: "Clothing", confidence: 0.91 },
      { description: "Red", confidence: 0.89 },
    ],
    imageObjects: [{ name: "Jacket", confidence: 0.91 }],
    imageDominantColors: [
      { red: 220, green: 20, blue: 20, pixelFraction: 0.80 },
    ],
    imageText: "North Face",
    normalizedDescription: "Red North Face winter jacket, puffy",
    category: "clothing",
    features: ["Red", "Jacket", "Winter", "Puffy"],
    colors: ["red"],
    createdBy: "user1",
    createdAt: new Date("2024-01-15T08:00:00Z"),
    status: "open",
  },
];

// Sample Matches (expected to be generated)
const sampleMatches = [
  {
    lostItemId: "item1", // Red Watch Lost
    foundItemId: "item2", // Red Watch Found
    confidenceScore: 0.87,
    explanation:
      "This found watch closely matches your lost item. Both are red Apple Watches with similar physical characteristics including the sport band and minor scratches. Very likely a match!",
    breakdown: {
      imageSimilarity: 0.85,
      textSimilarity: 0.82,
      metadataSimilarity: 0.94,
    },
    status: "pending",
    createdAt: new Date("2024-01-15T12:00:00Z"),
  },
  {
    lostItemId: "item3", // Black Backpack Lost
    foundItemId: "item4", // Black Backpack Found
    confidenceScore: 0.89,
    explanation:
      "Strong match! Both describe a black North Face backpack with MacBook stickers. Found at the exact location where you lost it (student center). Color, brand, and features all match perfectly.",
    breakdown: {
      imageSimilarity: 0.88,
      textSimilarity: 0.85,
      metadataSimilarity: 0.95,
    },
    status: "pending",
    createdAt: new Date("2024-01-15T12:15:00Z"),
  },
  {
    lostItemId: "item5", // Blue Airpods Lost
    foundItemId: "item6", // Blue Airpods Found
    confidenceScore: 0.84,
    explanation:
      "Good match! The found blue Airpods case matches your lost item. Distinctive blue color, found in the engineering building where you lost them. Same brand and model.",
    breakdown: {
      imageSimilarity: 0.82,
      textSimilarity: 0.78,
      metadataSimilarity: 0.92,
    },
    status: "pending",
    createdAt: new Date("2024-01-15T12:30:00Z"),
  },
];

/**
 * How to load this data into Firestore:
 *
 * Option 1: Firebase Console (Manual)
 * 1. Go to Firebase Console → Firestore
 * 2. Create collection "users"
 * 3. Add each document from sampleUsers
 * 4. Repeat for "items" and "matches"
 *
 * Option 2: Firebase Shell (Automated)
 * ```
 * firebase shell
 * > db.collection("users").add(sampleUsers[0])
 * > db.collection("items").add(sampleItems[0])
 * ```
 *
 * Option 3: Cloud Functions (Best for production)
 * Create an admin function that loads sample data
 */

// SQL for importing sample data into Firestore
const setupFirestoreData = `
// Add Users
db.collection("users").add(sampleUsers[0]);
db.collection("users").add(sampleUsers[1]);
db.collection("users").add(sampleUsers[2]);

// Add Items
for (let i = 0; i < sampleItems.length; i++) {
  db.collection("items").add(sampleItems[i]);
}

// Add Matches
for (let i = 0; i < sampleMatches.length; i++) {
  db.collection("matches").add(sampleMatches[i]);
}
`;

/**
 * Test Scenarios
 *
 * Scenario 1: Perfect Match
 * - Upload red watch image (lost)
 * - As different user, upload similar red watch (found)
 * - Expected: 85%+ confidence match
 * - Features should align: color, brand, model
 *
 * Scenario 2: Partial Match
 * - Item 1: "Black backpack"
 * - Item 2: "Found black bag"
 * - Expected: 70-75% match
 * - Category matches but description slightly different
 *
 * Scenario 3: No Match
 * - Item 1: "Red jacket"
 * - Item 2: "Blue watch"
 * - Expected: < 40% (below threshold, no match created)
 * - Different color, category, and type
 *
 * Scenario 4: Multiple Matches
 * - Add 5 lost watches
 * - Add 3 found red items
 * - Should match highest confidence items
 * - User sees top 3 matches ranked by confidence
 */

// Export for use in test files
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    sampleUsers,
    sampleItems,
    sampleMatches,
    setupFirestoreData,
  };
}

console.log("Sample data ready!");
console.log(`Users: ${sampleUsers.length}`);
console.log(`Items: ${sampleItems.length}`);
console.log(`Matches: ${sampleMatches.length}`);
