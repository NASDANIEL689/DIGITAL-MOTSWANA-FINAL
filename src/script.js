import { auth, db } from './firebase.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Debug: Log Firebase initialization
console.log('Firebase auth:', auth);
console.log('Firebase db:', db);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  // Check if Firebase is initialized
  if (!auth || !db) {
    console.error('Firebase not initialized properly');
    showError('Error initializing application. Please try again.');
    return;
  }
  const container = document.getElementById('container');
  const registerBtn = document.getElementById('register');
  const loginBtn = document.getElementById('login');
  const signUpForm = document.getElementById('signUpForm');
  const signInForm = document.getElementById('signInForm');

  // Helper function to show loading state
  const setLoading = (form, isLoading) => {
    const button = form.querySelector('button[type="submit"]');
    const originalText = button.dataset.originalText || button.textContent;
    
    if (isLoading) {
      button.disabled = true;
      button.dataset.originalText = originalText;
      button.textContent = 'Please wait...';
      form.classList.add('loading');
    } else {
      button.disabled = false;
      button.textContent = originalText;
      form.classList.remove('loading');
    }
  };

  // Helper function to show error message
  const showError = (message) => {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    // Remove after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
    return errorDiv;
  };

  // Helper function to get Firebase error message
  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled. Please contact support.';
      case 'auth/weak-password':
        return 'Please choose a stronger password (at least 8 characters).';
      case 'auth/user-disabled':
        return 'This account has been disabled. Please contact support.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  // Toggle between sign-up and sign-in forms
  registerBtn.addEventListener('click', (event) => {
    event.preventDefault();
    container.classList.add('active');
  });

  loginBtn.addEventListener('click', (event) => {
    event.preventDefault();
    container.classList.remove('active');
  });

  // Handle Sign Up
  signUpForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const name = document.getElementById('signUpName').value.trim();
    const email = document.getElementById('signUpEmail').value.trim();
    const password = document.getElementById('signUpPassword').value;

    // Enhanced validation
    if (!name || !email || !password) {
      const error = showError('Please fill in all fields');
      signUpForm.insertBefore(error, signUpForm.firstChild);
      return;
    }

    // Password validation
    if (password.length < 8) {
      const error = showError('Password must be at least 8 characters long');
      signUpForm.insertBefore(error, signUpForm.firstChild);
      return;
    }

    if (!/[A-Z]/.test(password)) {
      const error = showError('Password must contain at least one uppercase letter');
      signUpForm.insertBefore(error, signUpForm.firstChild);
      return;
    }

    if (!/[0-9]/.test(password)) {
      const error = showError('Password must contain at least one number');
      signUpForm.insertBefore(error, signUpForm.firstChild);
      return;
    }

    setLoading(signUpForm, true);

    try {
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });

      // Redirect to the user page after successful registration
      window.location.href = './user.html';
    } catch (error) {
      console.error('Error signing up:', error);
      const errorMessage = getErrorMessage(error);
      const errorDiv = showError(errorMessage);
      signUpForm.insertBefore(errorDiv, signUpForm.firstChild);
      setLoading(signUpForm, false);
    }
  });

  // Handle Sign In
  signInForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('signInEmail').value.trim();
    const password = document.getElementById('signInPassword').value;

    // Basic validation
    if (!email || !password) {
      const error = showError('Please fill in all fields');
      signInForm.insertBefore(error, signInForm.firstChild);
      return;
    }

    setLoading(signInForm, true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Log the authenticated user's email for debugging
      console.log('Logged in user email:', user.email);

      // Check if the logged-in user is the official user
      if (user.email === 'official@gmail.com') {
        window.location.href = './official_verification.html';
      } else {
         // Update last login time for regular users
        await setDoc(doc(db, 'users', user.uid), {
          lastLogin: new Date().toISOString()
        }, { merge: true });
        // Redirect to the user page after successful login for regular users
        window.location.href = './user.html';
      }

    } catch (error) {
      console.error('Error signing in:', error);
      const errorMessage = getErrorMessage(error);
      const errorDiv = showError(errorMessage);
      signInForm.insertBefore(errorDiv, signInForm.firstChild);
      setLoading(signInForm, false);
    }
  });
});