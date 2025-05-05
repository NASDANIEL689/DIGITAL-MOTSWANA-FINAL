import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Get the view containers
const profileFormView = document.getElementById('profileFormView');
const profileDisplayView = document.getElementById('profileDisplayView');

// Function to show the form view and hide the display view
function showFormView() {
  profileFormView.style.display = 'block';
  profileDisplayView.style.display = 'none';
}

// Function to show the display view and hide the form view
function showDisplayView() {
  profileFormView.style.display = 'none';
  profileDisplayView.style.display = 'block';
}

// Function to populate the display view with user data
function populateDisplayView(userData) {
  document.getElementById('displayFullName').textContent = `${userData.name || ''} ${userData.surname || ''}`.trim() || 'N/A';
  document.getElementById('displayDob').textContent = userData.dateOfBirth || 'N/A';
  document.getElementById('displayIdNumber').textContent = userData.idNumber || 'N/A';
  document.getElementById('displayGender').textContent = userData.gender || 'Not specified'; // Assuming gender field exists in DB
  document.getElementById('displayMaritalStatus').textContent = userData.maritalStatus || 'Not specified'; // Assuming maritalStatus field exists in DB
  document.getElementById('displayNationality').textContent = userData.nationality || 'Not specified'; // Assuming nationality field exists in DB
  document.getElementById('displayEmail').textContent = userData.email || 'N/A'; // Assuming email field exists in DB
  document.getElementById('displayPhone').textContent = userData.phone || 'N/A';
  document.getElementById('displayPhysicalAddress1').textContent = userData.physicalAddress1 || 'Not specified'; // Assuming address fields exist in DB
  document.getElementById('displayPhysicalAddress2').textContent = userData.physicalAddress2 || '';
  document.getElementById('displayPostalAddress1').textContent = userData.postalAddress1 || 'Not specified'; // Assuming address fields exist in DB
  document.getElementById('displayPostalAddress2').textContent = userData.postalAddress2 || '';
  document.getElementById('displayEmergencyName').textContent = userData.emergencyName || 'Not specified'; // Assuming emergency contact fields exist in DB
  document.getElementById('displayEmergencyRelationship').textContent = userData.emergencyRelationship || 'Not specified';
  document.getElementById('displayEmergencyPhone1').textContent = userData.emergencyPhone1 || 'Not specified';
  document.getElementById('displayEmergencyPhone2').textContent = userData.emergencyPhone2 || 'Not specified';
  document.getElementById('displayEmergencyEmail').textContent = userData.emergencyEmail || 'Not specified';
  document.getElementById('displayEmergencyPhysicalAddress1').textContent = userData.emergencyPhysicalAddress1 || 'Not specified';
  document.getElementById('displayEmergencyPhysicalAddress2').textContent = userData.emergencyPhysicalAddress2 || '';

  const displayProfilePicture = document.getElementById('displayProfilePicture');
   if (userData.profilePicture) {
        displayProfilePicture.src = userData.profilePicture;
      } else {
        displayProfilePicture.src = './public/pics/default-avatar.png'; // Default image
      }
}

// Function to populate the form view with user data
function populateFormView(userData) {
  document.getElementById('profileName').value = userData.name || '';
  document.getElementById('profileSurname').value = userData.surname || '';
  document.getElementById('profileIdNum').value = userData.idNumber || '';
  document.getElementById('profileDob').value = userData.dateOfBirth || '';
  document.getElementById('profilePob').value = userData.pob || '';
  document.getElementById('profileEyeColor').value = userData.eyeColor || '';
  document.getElementById('profilePhone').value = userData.phone || '';

   const profileLastUpdate = document.getElementById('profileLastUpdate');
   if (userData.lastUpdate) {
    const lastUpdateDate = new Date(userData.lastUpdate.seconds * 1000);
    profileLastUpdate.textContent = lastUpdateDate.toLocaleString();
  } else {
    profileLastUpdate.textContent = 'Never updated';
  }

  const profilePicture = document.getElementById('profilePicture');
   if (userData.profilePicture) {
        profilePicture.src = userData.profilePicture;
      } else {
        profilePicture.src = './public/pics/default-avatar.png'; // Default image
      }
}

// Function to check if essential profile data is complete
function isProfileComplete(userData) {
  return userData.name && userData.surname && userData.idNumber && userData.dateOfBirth && userData.pob && userData.eyeColor && userData.phone;
}

// Check if the user is authenticated
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log('User is signed in:', user.uid);

    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      console.log('User data:', userData);

      if (isProfileComplete(userData)) {
        populateDisplayView(userData);
        showDisplayView();
      } else {
        populateFormView(userData);
        showFormView();
      }
    } else {
      console.log('No user data found in Firestore. Showing form view.');
      showFormView(); // Show form if no data exists
    }

    // Handle form submission (inside onAuthStateChanged to access userDocRef)
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const profileName = document.getElementById('profileName').value;
      const profileSurname = document.getElementById('profileSurname').value;
      const profileIdNum = document.getElementById('profileIdNum').value;
      const profileDob = document.getElementById('profileDob').value;
      const profilePob = document.getElementById('profilePob').value;
      const profileEyeColor = document.getElementById('profileEyeColor').value;
      const profilePhone = document.getElementById('profilePhone').value;

      const updatedData = {
        name: profileName,
        surname: profileSurname,
        idNumber: profileIdNum,
        dateOfBirth: profileDob,
        pob: profilePob,
        eyeColor: profileEyeColor,
        phone: profilePhone,
        lastUpdate: new Date(),
      };

      try {
        await setDoc(userDocRef, updatedData, { merge: true });
        alert('Profile updated successfully!');

        // After update, re-fetch data and switch view if complete
        const updatedUserDoc = await getDoc(userDocRef);
        if (updatedUserDoc.exists()) {
          const updatedUserData = updatedUserDoc.data();
           if (isProfileComplete(updatedUserData)) {
            populateDisplayView(updatedUserData);
            showDisplayView();
          } else {
            populateFormView(updatedUserData); // Stay in form view if still incomplete
            showFormView();
          }
        }

      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile. Please try again.');
      }
    });

     // Handle profile picture update (inside onAuthStateChanged)
    const updatePictureButton = document.getElementById('updatePictureButton');
     if (updatePictureButton) {
      updatePictureButton.addEventListener('click', () => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              const storageRef = ref(storage, `profile-pictures/${user.uid}`);
              await uploadBytes(storageRef, file);
              const downloadURL = await getDownloadURL(storageRef);

              await setDoc(userDocRef, {
                profilePicture: downloadURL,
                lastUpdate: new Date(),
              }, { merge: true });

              alert('Profile picture updated successfully!');

               // After picture update, re-fetch data and update views
              const updatedUserDoc = await getDoc(userDocRef);
              if (updatedUserDoc.exists()) {
                const updatedUserData = updatedUserDoc.data();
                // Update picture in both views if they exist
                const formProfilePicture = document.getElementById('profilePicture');
                if(formProfilePicture) formProfilePicture.src = updatedUserData.profilePicture || './public/pics/default-avatar.png';
                const displayProfilePicture = document.getElementById('displayProfilePicture');
                 if(displayProfilePicture) displayProfilePicture.src = updatedUserData.profilePicture || './public/pics/default-avatar.png';

                 // Update last updated date in form view
                const profileLastUpdate = document.getElementById('profileLastUpdate');
                 if (updatedUserData.lastUpdate && profileLastUpdate) {
                  const lastUpdateDate = new Date(updatedUserData.lastUpdate.seconds * 1000);
                  profileLastUpdate.textContent = lastUpdateDate.toLocaleString();
                }

                // Re-evaluate view based on data completeness
                 if (isProfileComplete(updatedUserData)) {
                  populateDisplayView(updatedUserData);
                  showDisplayView();
                } else {
                   populateFormView(updatedUserData); // Stay in form view if still incomplete
                   showFormView();
                }
              }

            } catch (error) {
              console.error('Error uploading profile picture:', error);
              alert('Failed to upload profile picture. Please try again.');
            }
          }
        };
        fileInput.click();
      });
    }

    // Handle Edit Profile button click (inside onAuthStateChanged)
    const editProfileBtn = document.getElementById('editProfileBtn');
    if (editProfileBtn) {
      editProfileBtn.addEventListener('click', async () => {
        // Fetch latest data before showing form
        const userDoc = await getDoc(userDocRef);
         if (userDoc.exists()) {
          populateFormView(userDoc.data());
        }
        showFormView();
      });
    }

    // Toggle Side Menu
    const menuToggle = document.getElementById('menuToggle');
    const sideMenu = document.getElementById('sideMenu');
    const mainContent = document.querySelector('.main-content');

     if (menuToggle && sideMenu && mainContent) {
      menuToggle.addEventListener('click', () => {
        sideMenu.classList.toggle('active');
        mainContent.classList.toggle('active');
      });
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

  } else {
    // User is not signed in, redirect to login page
    window.location.href = 'index.html';
  }
});
