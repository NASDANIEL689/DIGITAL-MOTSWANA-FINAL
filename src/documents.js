import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

document.addEventListener('DOMContentLoaded', () => {
  // Handle authentication state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = './index.html';
      return;
    }
    loadUserDocuments(user.uid);
  });

  // Set up logout functionality
  const logoutButton = document.getElementById('logoutButton');
  logoutButton.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await auth.signOut();
      window.location.href = './index.html';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  });

  // Handle document upload
  const addDocumentBtn = document.querySelector('.btn-add');
  if (addDocumentBtn) {
    addDocumentBtn.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.pdf,.jpg,.jpeg,.png';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          const user = auth.currentUser;
          const storageRef = ref(storage, `documents/${user.uid}/${file.name}`);
          
          // Show loading state
          addDocumentBtn.disabled = true;
          addDocumentBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';

          // Upload file
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          // Update Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          const documents = userDoc.data().documents || [];
          
          documents.push({
            name: file.name,
            url: downloadURL,
            type: file.type,
            uploadDate: new Date().toISOString(),
            status: 'pending'
          });

          await updateDoc(userDocRef, { documents });
          
          // Refresh documents display
          loadUserDocuments(user.uid);
        } catch (error) {
          console.error('Error uploading document:', error);
          showError('Failed to upload document. Please try again.');
        } finally {
          addDocumentBtn.disabled = false;
          addDocumentBtn.innerHTML = '<i class="fas fa-plus"></i> Add Document';
        }
      };

      input.click();
    });
  }
});

async function loadUserDocuments(userId) {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const documents = userDoc.data()?.documents || [];

    const documentsGrid = document.querySelector('.documents-grid');
    const documentCards = documents.map(doc => createDocumentCard(doc));
    
    // Keep the "Add New" card at the end
    const addNewCard = documentsGrid.querySelector('.add-new');
    documentsGrid.innerHTML = '';
    documentCards.forEach(card => documentsGrid.appendChild(card));
    documentsGrid.appendChild(addNewCard);
  } catch (error) {
    console.error('Error loading documents:', error);
    showError('Failed to load documents. Please refresh the page.');
  }
}

function createDocumentCard(document) {
  const card = document.createElement('div');
  card.className = 'document-card';
  card.innerHTML = `
    <div class="document-icon">
      <i class="fas ${getDocumentIcon(document.type)}"></i>
    </div>
    <h3>${document.name}</h3>
    <p class="status ${document.status}">${document.status}</p>
    <div class="document-actions">
      <button class="btn-view" onclick="window.open('${document.url}', '_blank')">
        <i class="fas fa-eye"></i> View
      </button>
      <button class="btn-update">
        <i class="fas fa-upload"></i> Update
      </button>
    </div>
  `;
  return card;
}

function getDocumentIcon(type) {
  if (type.includes('pdf')) return 'fa-file-pdf';
  if (type.includes('image')) return 'fa-file-image';
  return 'fa-file';
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  document.querySelector('.content-area').prepend(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}
