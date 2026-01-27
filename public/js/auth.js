/**
 * Authentication Module
 * Handles Firebase Authentication
 */

let currentUser = null;

// Auth Elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authModal = document.getElementById('authModal');
const authEmail = document.getElementById('authEmail');
const authPassword = document.getElementById('authPassword');
const signInBtn = document.getElementById('signInBtn');
const signUpBtn = document.getElementById('signUpBtn');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const userEmail = document.getElementById('userEmail');
const mainContent = document.getElementById('mainContent');

/**
 * Initialize Auth Listeners
 */
function initAuth() {
  auth.onAuthStateChanged(user => {
    currentUser = user;

    if (user) {
      // User is signed in
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'inline-block';
      userEmail.textContent = user.email;
      mainContent.style.display = 'block';
      authModal.style.display = 'none';

      // Create user profile in Firestore
      createUserProfile(user);
    } else {
      // User is signed out
      loginBtn.style.display = 'inline-block';
      logoutBtn.style.display = 'none';
      userEmail.textContent = '';
      mainContent.style.display = 'none';
    }
  });
}

/**
 * Create or update user profile
 */
async function createUserProfile(user) {
  try {
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      await userRef.set({
        userId: user.uid,
        name: user.email.split('@')[0],
        email: user.email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error creating user profile:', error);
  }
}

/**
 * Sign In
 */
async function handleSignIn() {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  try {
    showLoading(true);
    await auth.signInWithEmailAndPassword(email, password);
    authEmail.value = '';
    authPassword.value = '';
    showToast('Signed in successfully!', 'success');
  } catch (error) {
    showToast(`Sign in failed: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Sign Up
 */
async function handleSignUp() {
  const email = authEmail.value.trim();
  const password = authPassword.value.trim();

  if (!email || !password) {
    showToast('Please enter email and password', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  try {
    showLoading(true);
    await auth.createUserWithEmailAndPassword(email, password);
    authEmail.value = '';
    authPassword.value = '';
    showToast('Account created successfully!', 'success');
  } catch (error) {
    showToast(`Sign up failed: ${error.message}`, 'error');
  } finally {
    showLoading(false);
  }
}

/**
 * Logout
 */
async function handleLogout() {
  try {
    await auth.signOut();
    showToast('Logged out successfully', 'success');
  } catch (error) {
    showToast(`Logout failed: ${error.message}`, 'error');
  }
}

/**
 * Event Listeners
 */
loginBtn.addEventListener('click', () => {
  authModal.style.display = 'flex';
});

closeAuthBtn.addEventListener('click', () => {
  authModal.style.display = 'none';
});

signInBtn.addEventListener('click', handleSignIn);
signUpBtn.addEventListener('click', handleSignUp);
logoutBtn.addEventListener('click', handleLogout);

// Allow Enter key for password input
authPassword.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    handleSignIn();
  }
});

// Initialize on page load
initAuth();
