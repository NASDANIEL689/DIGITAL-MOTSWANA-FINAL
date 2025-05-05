import { db } from './firebase.js';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const userListElement = document.getElementById('userList');

async function fetchUsers() {
  try {
    const usersCollection = collection(db, 'users');
    const userSnapshot = await getDocs(usersCollection);
    const users = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    displayUsers(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    userListElement.innerHTML = '<p>Error loading users.</p>';
  }
}

function displayUsers(users) {
  userListElement.innerHTML = ''; // Clear loading message

  if (users.length === 0) {
    userListElement.innerHTML = '<p>No users found.</p>';
    return;
  }

  users.forEach(user => {
    const userItem = document.createElement('div');
    userItem.classList.add('user-item');

    const userDetails = document.createElement('div');
    userDetails.classList.add('user-details');
    userDetails.innerHTML = `
            <h4>${user.name || 'N/A'}</h4>
            <p>Email: ${user.email || 'N/A'}</p>
            <p>ID Number: ${user.idNumber || 'N/A'}</p>
        `;

    const verificationStatus = document.createElement('span');
    verificationStatus.classList.add('verification-status');
    updateVerificationStatusUI(verificationStatus, user.isVerified);

    const verifyButton = document.createElement('button');
    verifyButton.classList.add('verify-button');
    verifyButton.textContent = user.isVerified ? 'Unverify' : 'Verify';
    verifyButton.addEventListener('click', () => toggleVerification(user.id, user.isVerified, verificationStatus, verifyButton));

    userItem.appendChild(userDetails);
    userItem.appendChild(verificationStatus);
    userItem.appendChild(verifyButton);
    userListElement.appendChild(userItem);
  });
}

async function toggleVerification(userId, currentStatus, statusElement, buttonElement) {
    const userDocRef = doc(db, 'users', userId);
    const newStatus = !currentStatus;
    try {
        await updateDoc(userDocRef, {
            isVerified: newStatus
        });
        updateVerificationStatusUI(statusElement, newStatus);
        buttonElement.textContent = newStatus ? 'Unverify' : 'Verify';
        alert(`User ${userId} verification status updated to ${newStatus}`);
    } catch (error) {
        console.error('Error toggling verification status:', error);
        alert('Failed to update verification status.');
    }
}

function updateVerificationStatusUI(element, isVerified) {
    element.textContent = isVerified ? '✓' : '✗';
    element.classList.remove('verified-status', 'unverified-status');
    element.classList.add(isVerified ? 'verified-status' : 'unverified-status');
}

// Fetch users when the page loads
fetchUsers();
