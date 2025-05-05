// Get references to the elements
const menuToggle = document.querySelector('.menu-toggle');
const sidebar = document.getElementById('sidebar');
const container = document.querySelector('.container');

const profileDisplayView = document.getElementById('profileDisplayView');
const profileFormView = document.getElementById('profileFormView');
const editProfileBtn = document.getElementById('editProfileBtn');
const profileForm = document.getElementById('profileForm');

// Profile Picture Elements
const profilePicture = document.getElementById('profilePicture'); // Image element in form view
const updatePictureButton = document.getElementById('updatePictureButton'); // Button in form view
const profilePictureInput = document.getElementById('profilePictureInput'); // Hidden file input in form view

const displayProfilePicture = document.getElementById('displayProfilePicture'); // Image element in display view
const displayEditAvatarBtn = document.getElementById('displayEditAvatarBtn'); // Button in display view
const displayProfilePictureInput = document.getElementById('displayProfilePictureInput'); // Hidden file input in display view


// Add event listener to the menu toggle button
menuToggle.addEventListener('click', () => {
  // Toggle the 'active' class on the sidebar
  sidebar.classList.toggle('active');
  // Toggle the 'sidebar-active' class on the container to adjust main content margin
  container.classList.toggle('sidebar-active');
});

// Function to show the profile display view and hide the form view
function showDisplayView() {
    profileDisplayView.style.display = 'block';
    profileFormView.style.display = 'none';
    // Ensure container margin is correct for sidebar state
     if (sidebar.classList.contains('active')) {
        container.classList.add('sidebar-active');
    } else {
        container.classList.remove('sidebar-active');
    }
}

// Function to show the profile form view and hide the display view
function showFormView() {
    profileDisplayView.style.display = 'none';
    profileFormView.style.display = 'block';
     // Ensure container margin is correct for sidebar state
     if (sidebar.classList.contains('active')) {
        container.classList.add('sidebar-active');
    } else {
        container.classList.remove('sidebar-active');
    }
}

// Function to fetch user profile data (Placeholder - Replace with your database logic)
let fetchedProfileData = null; // Variable to store fetched data

async function fetchProfileData() {
  console.log('Fetching profile data...');
  // ** Replace with your actual data fetching logic **
  // Example: Fetch data from an API endpoint
  /*
  try {
    const response = await fetch('/api/profile'); // Replace with your API endpoint
    if (!response.ok) {
      throw new Error(\`HTTP error! status: ${response.status}\`);
    }
    const data = await response.json();
    fetchedProfileData = data; // Store fetched data
    return data;
  } catch (error) {
    console.error('Error fetching profile data:', error);
    fetchedProfileData = null; // Clear data on error
    return null; // Or handle error appropriately
  }
  */

  // ** Mock Data (for testing purposes) **
   const mockData = {
     fullName: 'John Doe',
     dob: '1990-01-15',
     idNumber: '9001151234567',
     gender: 'Male',
     maritalStatus: 'Single',
     nationality: 'Botswanan',
     email: 'john.doe@example.com',
     phone: '26771234567',
     physicalAddress1: 'Plot 123',
     physicalAddress2: 'Gaborone',
     postalAddress1: 'P.O. Box 456',
     postalAddress2: 'Gaborone',
     emergencyName: 'Jane Doe',
     emergencyRelationship: 'Sister',
     emergencyPhone1: '26772987654',
     emergencyPhone2: '',
     emergencyEmail: 'jane.doe@example.com',
     emergencyPhysicalAddress1: 'Plot 789',
     emergencyPhysicalAddress2: 'Francistown',
     profilePictureUrl: 'https://via.placeholder.com/150' // Placeholder image
   };
  // In a real application, you would remove the mock data and use the fetched data
   fetchedProfileData = mockData; // Store mock data
   return mockData;
}

// Function to populate the profile display view with data
function populateDisplayView(data) {
  if (!data) return;

  document.getElementById('displayFullName').textContent = data.fullName || 'Not specified';
  document.getElementById('displayDob').textContent = data.dob || 'Not specified';
  document.getElementById('displayIdNumber').textContent = data.idNumber || 'Not specified';
  document.getElementById('displayGender').textContent = data.gender || 'Not specified';
  document.getElementById('displayMaritalStatus').textContent = data.maritalStatus || 'Not specified';
  document.getElementById('displayNationality').textContent = data.nationality || 'Not specified';
  document.getElementById('displayEmail').textContent = data.email || 'Not specified';
  document.getElementById('displayPhone').textContent = data.phone || 'Not specified';
  document.getElementById('displayPhysicalAddress1').textContent = data.physicalAddress1 || 'Not specified';
  document.getElementById('displayPhysicalAddress2').textContent = data.physicalAddress2 || '';
  document.getElementById('displayPostalAddress1').textContent = data.postalAddress1 || 'Not specified';
  document.getElementById('displayPostalAddress2').textContent = data.postalAddress2 || '';
  document.getElementById('displayEmergencyName').textContent = data.emergencyName || 'Not specified';
  document.getElementById('displayEmergencyRelationship').textContent = data.emergencyRelationship || 'Not specified';
  document.getElementById('displayEmergencyPhone1').textContent = data.emergencyPhone1 || 'Not specified';
  document.getElementById('displayEmergencyPhone2').textContent = data.emergencyPhone2 || '';
  document.getElementById('displayEmergencyEmail').textContent = data.emergencyEmail || 'Not specified';
  document.getElementById('displayEmergencyPhysicalAddress1').textContent = data.emergencyPhysicalAddress1 || 'Not specified';
  document.getElementById('displayEmergencyPhysicalAddress2').textContent = data.emergencyPhysicalAddress2 || '';

  // Update profile picture if URL is available
  if (data.profilePictureUrl) {
    displayProfilePicture.src = data.profilePictureUrl;
  } else {
    // Set a default image if no picture URL
    displayProfilePicture.src = 'images/default-avatar.png'; // Make sure you have a default image
  }
}

// Function to populate the profile form view with data for editing
function populateFormView(data) {
    if (!data) return;

    // Assuming your form input IDs correspond to data keys (e.g., profileName for fullName)
    document.getElementById('profileName').value = data.fullName || '';
    document.getElementById('profileSurname').value = ''; // Surname is not in mock display data, you'll need to handle this
    document.getElementById('profileIdNum').value = data.idNumber || '';
    document.getElementById('profileDob').value = data.dob ? data.dob.split('T')[0] : ''; // Format date for input type=date
    document.getElementById('profilePob').value = ''; // Place of Birth not in mock display data
    document.getElementById('profileEyeColor').value = ''; // Eye Color not in mock display data
    document.getElementById('profilePhone').value = data.phone || '';
    // profileLastUpdate would likely be set by backend/database

    // Update profile picture in form view if URL is available
     if (data.profilePictureUrl) {
       profilePicture.src = data.profilePictureUrl;
     } else {
       // Set a default image if no picture URL
       profilePicture.src = 'https://banner2.cleanpng.com/lnd/20240806/xl/3770fe02ff172d4531ec0aaf53417e.webp'; // Make sure you have a default image
     }
}

// Function to handle form submission and save profile data (Placeholder - Replace with your database logic)
async function saveProfileData(event) {
  event.preventDefault(); // Prevent default form submission

  console.log('Saving profile data...');

  // Get data from the form
  const updatedData = {
    fullName: document.getElementById('profileName').value,
    // Add other fields from the form
    // surname: document.getElementById('profileSurname').value,
    idNumber: document.getElementById('profileIdNum').value,
    dob: document.getElementById('profileDob').value,
    // pob: document.getElementById('profilePob').value,
    // eyeColor: document.getElementById('profileEyeColor').value,
    phone: document.getElementById('profilePhone').value,
    // You would also handle the profile picture URL if it was updated
    profilePictureUrl: fetchedProfileData ? fetchedProfileData.profilePictureUrl : null // Keep existing URL if not updated via file input
  };

   // ** Replace with your actual data saving logic **
  /*
  try {
    // Example: Send updatedData to your backend API
    const response = await fetch('/api/profile', { // Replace with your API endpoint
      method: 'POST', // Or 'PUT'
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: ${response.status}\`);
    }

    const result = await response.json();
    console.log('Profile saved successfully:', result);

    // After saving, reload and display the updated data
    await loadProfile();

  } catch (error) {
    console.error('Error saving profile data:', error);
    // Display an error message to the user
  }
  */

  // ** Mock Save (for demonstration) **
  console.log('Mock saving data:', updatedData);
   // Update the fetchedProfileData with mock saved data to simulate
   fetchedProfileData = { ...fetchedProfileData, ...updatedData };
  // In a real app, you would remove the mock save and use the actual save logic
  // After a successful mock save, you might simulate reloading data or just switch views
  loadProfile(); // Reload and display after mock save
}

// Function to handle file selection and upload (Placeholder - Replace with your upload logic)
async function handleFileUpload(event) {
  const file = event.target.files[0];

  if (file) {
    console.log('File selected:', file.name);

    // ** Replace with your actual file upload logic **
    // Example: Upload file to a server or cloud storage (e.g., Firebase Storage)
    /*
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const response = await fetch('/api/uploadProfilePicture', { // Replace with your upload API endpoint
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: ${response.status}\`);
      }

      const result = await response.json();
      console.log('File uploaded successfully:', result);

      // Assuming the result contains the URL of the uploaded image
      const imageUrl = result.url; // Adjust based on your API response

      // Update the profile picture in the UI immediately (optional)
      if (profilePicture) profilePicture.src = imageUrl;
      if (displayProfilePicture) displayProfilePicture.src = imageUrl;

      // Update the profile data with the new image URL and save the profile
      if (fetchedProfileData) {
          fetchedProfileData.profilePictureUrl = imageUrl;
          // You might want to auto-save the profile here or wait for form submission
          // For now, we'll just update the fetchedData object
          console.log('Profile picture URL updated in fetchedData:', imageUrl);
           // If you want to auto-save:
           // saveProfileData(new Event('submit')); // You might need to pass data differently
      }

    } catch (error) {
      console.error('Error uploading file:', error);
      // Display an error message to the user
    }
    */

    // ** Mock File Preview and URL Update (for demonstration) **
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      if (profilePicture) profilePicture.src = imageUrl;
      if (displayProfilePicture) displayProfilePicture.src = imageUrl;

       // Simulate updating the fetched data with the new image URL
       if(fetchedProfileData) {
           fetchedProfileData.profilePictureUrl = imageUrl;
           console.log('Mock profile picture URL updated in fetchedData:', imageUrl);
       }
    };
    reader.readAsDataURL(file); // Read the file as a data URL for preview

    console.log('Mock file upload and preview complete.');
     // In a real application, the saveProfileData call would happen AFTER successful file upload to your backend
  } else {
    console.log('No file selected.');
  }
}

// Function to load profile data and display it or show the form
async function loadProfile() {
    console.log('Loading profile...');
    await fetchProfileData(); // fetchProfileData now stores data in fetchedProfileData
    if (fetchedProfileData) {
        populateDisplayView(fetchedProfileData);
        showDisplayView(); // Show the display view after loading data
    } else {
        // Handle case where data fetching failed or no data exists
        console.log('No profile data found or failed to fetch.');
        // Show the form view for initial data entry
         showFormView();
    }
}

// Event listener for the Edit Profile button
editProfileBtn.addEventListener('click', (event) => {
    event.preventDefault(); // Prevent default button action
    if (fetchedProfileData) {
        populateFormView(fetchedProfileData);
    }
    showFormView();
});

// Event listener for the profile form submission
profileForm.addEventListener('submit', saveProfileData);

// Event listeners for the profile picture buttons to trigger the file input
updatePictureButton.addEventListener('click', () => {
    profilePictureInput.click(); // Trigger click on the hidden file input
});

displayEditAvatarBtn.addEventListener('click', () => {
    displayProfilePictureInput.click(); // Trigger click on the hidden file input
});

// Event listeners for the hidden file inputs to handle file selection
profilePictureInput.addEventListener('change', handleFileUpload);
displayProfilePictureInput.addEventListener('change', handleFileUpload);

// --- Initial Load ---
// When the page loads, attempt to load and display profile data
loadProfile();