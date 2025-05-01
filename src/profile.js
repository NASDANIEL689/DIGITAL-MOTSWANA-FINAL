import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Debugging: Check if storage is imported correctly
console.log('Storage:', storage);

// Check if the user is authenticated
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);

    // Declare userDocRef at the top of the function
    const userDocRef = doc(db, 'users', user.uid);

    // User is signed in
    const profileForm = document.getElementById('profileForm');
    const profileName = document.getElementById('profileName');
    const profileSurname = document.getElementById('profileSurname');
    const profileDob = document.getElementById('profileDob');
    const profilePob = document.getElementById('profilePob');
    const profileEyeColor = document.getElementById('profileEyeColor');
    const profilePicture = document.getElementById('profilePicture');
    const updatePictureButton = document.getElementById('updatePictureButton');

    try {
      // Fetch user profile data from Firestore
      console.log('Fetching user data from Firestore...');
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data:', userData);

        profileName.value = userData.name || '';
        profileSurname.value = userData.surname || '';
        profileDob.value = userData.dob || '';
        profilePob.value = userData.pob || '';
        profileEyeColor.value = userData.eyeColor || '';

        // Load profile picture if it exists
        if (userData.profilePicture) {
          console.log('Profile picture URL:', userData.profilePicture);
          profilePicture.src = userData.profilePicture;
        } else {
          console.log('No profile picture found. Using default image.');
          profilePicture.src = './public/pics/default-avatar.png'; // Default image
        }
      } else {
        console.log('No user data found in Firestore.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      alert('Failed to fetch user data. Please try again.');
    }

    // Handle profile picture update
    updatePictureButton.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            console.log('File selected:', file.name);

            // Upload the file to Firebase Storage
            const storageRef = ref(storage, `profile-pictures/${user.uid}`);
            console.log('Uploading file to Firebase Storage...');
            const uploadResult = await uploadBytes(storageRef, file);
            console.log('File uploaded successfully:', uploadResult);

            // Get the download URL of the uploaded file
            console.log('Getting download URL...');
            const downloadURL = await getDownloadURL(storageRef);
            console.log('Download URL:', downloadURL);

            // Update profile picture in Firestore
            await setDoc(userDocRef, { profilePicture: downloadURL }, { merge: true });
            console.log('Profile picture updated in Firestore.');

            // Update profile picture on the page
            profilePicture.src = downloadURL;
            console.log('Profile picture updated on the page.');
            alert('Profile picture updated successfully!');
          } catch (error) {
            console.error('Error uploading profile picture:', error);
            alert('Failed to upload profile picture. Please try again.');
          }
        }
      };
      fileInput.click();
    });

    // Handle form submission
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      // Update user profile data in Firestore
      await setDoc(userDocRef, {
        name: profileName.value,
        surname: profileSurname.value,
        dob: profileDob.value,
        pob: profilePob.value,
        eyeColor: profileEyeColor.value,
      }, { merge: true });

      alert('Profile updated successfully!');
      window.location.href = './user.html'; // Redirect to home page
    });

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
      window.location.href = 'user.html';
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
  } else {
    // User is not signed in, redirect to login page
    window.location.href = 'index.html';
  }
});