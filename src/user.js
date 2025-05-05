
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
    const userDob = document.getElementById('userDob');
    const profileIdNum = document.getElementById('profileIdNum');
    const userPhone = document.getElementById('userPhone');
    const userProfilePicture = document.getElementById('userProfilePicture');
    const userVerificationStatusElement = document.getElementById('userVerificationStatus'); // Get the status element

    // Fetch user profile data from Firestore
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User data fetched from Firestore:', userData); // Added console log
      userName.textContent = userData.name || 'User';
      userEmail.textContent = user.email;
      userId.textContent = user.uid;
      userDob.textContent = userData.dateOfBirth || 'N/A'; // Added
      profileIdNum.textContent = userData.idNumber || 'N/A'; // Added
      userPhone.textContent = userData.phone || 'N/A'; // Added

      // Update verification status
      if (userVerificationStatusElement) {
        userVerificationStatusElement.textContent = userData.isVerified ? '✓' : '✗';
        // Optional: Add class for styling (requires corresponding CSS in user.css)
        userVerificationStatusElement.classList.add(userData.isVerified ? 'verified-status' : 'unverified-status');
      }

      // Load profile picture if it exists
      if (userData.profilePicture) {
        userProfilePicture.src = userData.profilePicture;
      }
    }

    // Logout button
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
      logoutButton.addEventListener('click', () => {
        signOut(auth)
          .then(() => {
            window.location.href = './index.html';
          })
          .catch((error) => {
            console.error('Error signing out:', error);
          });
      });
    }

    // Home button
    const homeButton = document.getElementById('homeButton');
    if (homeButton) {
      homeButton.addEventListener('click', () => {
        window.location.href = './user.html';
      });
    }

    // Profile button
    const profileButton = document.getElementById('profileButton');
    if (profileButton) {
      profileButton.addEventListener('click', () => {
        window.location.href = './profile.html';
      });
    }

    // Settings button
    const settingsButton = document.getElementById('settingsButton');
    if (settingsButton) {
      settingsButton.addEventListener('click', () => {
        alert('Settings feature coming soon!');
      });
    }

    // Service buttons - Check if elements exist before adding event listeners
    const applyForCertificationButton = document.getElementById('applyForCertification');
    if (applyForCertificationButton) {
      applyForCertificationButton.addEventListener('click', () => {
        alert('Apply for Certification feature coming soon!');
      });
    }

    const updateProfileButton = document.getElementById('updateProfile');
    if (updateProfileButton) {
      updateProfileButton.addEventListener('click', () => {
        window.location.href = './profile.html';
      });
    }

    const checkStatusButton = document.getElementById('checkStatus');
    if (checkStatusButton) {
      checkStatusButton.addEventListener('click', () => {
        alert('Check Application Status feature coming soon!');
      });
    }


  } else {
    // User is not signed in, redirect to login page
    window.location.href = 'index.html';
  }
});
