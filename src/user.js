
import { auth, db } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

// Check if the user is authenticated
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // User is signed in
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userId = document.getElementById('userId');
    const userProfilePicture = document.getElementById('userProfilePicture');

    // Fetch user profile data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      userName.textContent = userData.name || 'User';
      userEmail.textContent = user.email;
      userId.textContent = user.uid;

      // Load profile picture if it exists
      if (userData.profilePicture) {
        userProfilePicture.src = userData.profilePicture;
      }
    }

    // Toggle Side Menu
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const mainContent = document.querySelector('.main-content');

    menuToggle.addEventListener('click', () => {
      sideMenu.classList.toggle('active');
      mainContent.classList.toggle('active');
    });

    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    logoutButton.addEventListener('click', () => {
      signOut(auth)
        .then(() => {
          window.location.href = './index.html';
        })
        .catch((error) => {
          console.error('Error signing out:', error);
        });
    });

    // Home button
    const homeButton = document.getElementById('homeButton');
    homeButton.addEventListener('click', () => {
      window.location.href = './user.html';
    });

    // Profile button
    const profileButton = document.getElementById('profileButton');
    profileButton.addEventListener('click', () => {
      window.location.href = './profile.html';
    });

    // Settings button
    const settingsButton = document.getElementById('settingsButton');
    settingsButton.addEventListener('click', () => {
      alert('Settings feature coming soon!');
    });

    // Service buttons
    document.getElementById('applyForCertification').addEventListener('click', () => {
      alert('Apply for Certification feature coming soon!');
    });

    document.getElementById('updateProfile').addEventListener('click', () => {
      window.location.href = './profile.html';
    });

    document.getElementById('checkStatus').addEventListener('click', () => {
      alert('Check Application Status feature coming soon!');
    });
  } else {
    // User is not signed in, redirect to login page
    window.location.href = 'index.html';
  }
});