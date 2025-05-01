import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  // Handle authentication state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = './index.html';
      return;
    }
    loadVerificationStatus(user.uid);
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

  // Handle verification card buttons
  document.querySelectorAll('.verification-card button').forEach(button => {
    button.addEventListener('click', async (e) => {
      const card = e.target.closest('.verification-card');
      const status = card.querySelector('.verification-status');
      const type = status.querySelector('h3').textContent;

      switch (button.textContent.trim()) {
        case 'Start Verification':
          startVerification(type);
          break;
        case 'Check Status':
          checkVerificationStatus(type);
          break;
        case 'View Details':
          viewVerificationDetails(type);
          break;
        case 'Renew Now':
          renewVerification(type);
          break;
      }
    });
  });
});

async function loadVerificationStatus(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data();
    const verifications = data.verifications || {};

    // Update verification cards based on status
    Object.entries(verifications).forEach(([type, status]) => {
      updateVerificationCard(type, status);
    });

    // Update timeline
    updateVerificationTimeline(data.verificationHistory || []);
  } catch (error) {
    console.error('Error loading verification status:', error);
    showError('Failed to load verification status');
  }
}

function updateVerificationCard(type, status) {
  const card = document.querySelector(`.verification-card:has(h3:contains('${type}'))`);
  if (!card) return;

  const statusDiv = card.querySelector('.verification-status');
  statusDiv.className = `verification-status ${status.state}`;
  
  const icon = statusDiv.querySelector('i');
  icon.className = `fas ${getStatusIcon(status.state)}`;
  
  const details = statusDiv.querySelector('.verification-details');
  details.innerHTML = getStatusDetails(status);
}

function updateVerificationTimeline(history) {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  timeline.innerHTML = history
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map(event => createTimelineItem(event))
    .join('');
}

function createTimelineItem(event) {
  return `
    <div class="timeline-item">
      <div class="timeline-dot ${event.status}"></div>
      <div class="timeline-content">
        <h4>${event.title}</h4>
        <p>${event.description}</p>
        <span class="timeline-date">${formatDate(event.date)}</span>
      </div>
    </div>
  `;
}

async function startVerification(type) {
  try {
    const user = auth.currentUser;
    await updateDoc(doc(db, 'users', user.uid), {
      [`verifications.${type}`]: {
        state: 'pending',
        startDate: new Date().toISOString(),
        expectedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    });

    showSuccess(`${type} verification process started`);
    loadVerificationStatus(user.uid);
  } catch (error) {
    console.error('Error starting verification:', error);
    showError('Failed to start verification process');
  }
}

async function checkVerificationStatus(type) {
  try {
    const user = auth.currentUser;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const status = userDoc.data().verifications[type];

    showModal(`
      <h3>${type} Verification Status</h3>
      <div class="status-details">
        <p><strong>Status:</strong> ${status.state}</p>
        <p><strong>Started:</strong> ${formatDate(status.startDate)}</p>
        <p><strong>Expected Completion:</strong> ${formatDate(status.expectedCompletion)}</p>
        ${status.notes ? `<p><strong>Notes:</strong> ${status.notes}</p>` : ''}
      </div>
    `);
  } catch (error) {
    console.error('Error checking status:', error);
    showError('Failed to check verification status');
  }
}

function viewVerificationDetails(type) {
  // Implementation would depend on specific verification type
  showModal(`
    <h3>${type} Details</h3>
    <p>Detailed information about your verified ${type.toLowerCase()} would appear here.</p>
  `);
}

async function renewVerification(type) {
  try {
    const user = auth.currentUser;
    await updateDoc(doc(db, 'users', user.uid), {
      [`verifications.${type}`]: {
        state: 'pending',
        startDate: new Date().toISOString(),
        expectedCompletion: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        renewalDate: new Date().toISOString()
      }
    });

    showSuccess(`${type} renewal process started`);
    loadVerificationStatus(user.uid);
  } catch (error) {
    console.error('Error renewing verification:', error);
    showError('Failed to start renewal process');
  }
}

function getStatusIcon(state) {
  switch (state) {
    case 'completed': return 'fa-check-circle';
    case 'pending': return 'fa-clock';
    case 'expired': return 'fa-exclamation-circle';
    default: return 'fa-file-upload';
  }
}

function getStatusDetails(status) {
  const details = [];
  
  if (status.state === 'completed') {
    details.push(`<span><i class="fas fa-calendar"></i> Verified on: ${formatDate(status.completionDate)}</span>`);
    if (status.expiryDate) {
      details.push(`<span><i class="fas fa-clock"></i> Valid until: ${formatDate(status.expiryDate)}</span>`);
    }
  } else if (status.state === 'pending') {
    details.push(`<span><i class="fas fa-calendar"></i> Submitted on: ${formatDate(status.startDate)}</span>`);
    details.push(`<span><i class="fas fa-clock"></i> Expected: 2-3 business days</span>`);
  }

  return details.join('');
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function showModal(content) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      ${content}
    </div>
  `;

  modal.querySelector('.close').onclick = () => modal.remove();
  document.body.appendChild(modal);
}

function showError(message) {
  showNotification(message, 'error');
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.querySelector('.content-area').prepend(notification);
  setTimeout(() => notification.remove(), 5000);
}
