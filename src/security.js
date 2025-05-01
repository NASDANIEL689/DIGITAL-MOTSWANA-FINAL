import { auth, db } from './firebase.js';
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  // Handle authentication state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = './index.html';
      return;
    }
    loadSecuritySettings(user.uid);
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

  // Handle password change
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (newPassword !== confirmPassword) {
        showError('New passwords do not match');
        return;
      }

      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        
        // Re-authenticate user
        await reauthenticateWithCredential(user, credential);
        
        // Update password
        await updatePassword(user, newPassword);
        
        showSuccess('Password updated successfully');
        passwordForm.reset();
      } catch (error) {
        console.error('Error updating password:', error);
        showError(getErrorMessage(error));
      }
    });
  }

  // Handle 2FA toggle
  const twoFactorToggle = document.getElementById('twoFactorToggle');
  if (twoFactorToggle) {
    twoFactorToggle.addEventListener('change', async () => {
      try {
        const user = auth.currentUser;
        await updateDoc(doc(db, 'users', user.uid), {
          twoFactorEnabled: twoFactorToggle.checked
        });
        
        if (twoFactorToggle.checked) {
          showSuccess('Two-factor authentication enabled');
        } else {
          showWarning('Two-factor authentication disabled');
        }
      } catch (error) {
        console.error('Error updating 2FA:', error);
        showError('Failed to update two-factor authentication');
        twoFactorToggle.checked = !twoFactorToggle.checked;
      }
    });
  }

  // Handle security alert preferences
  const alertOptions = document.querySelectorAll('.alert-option input');
  alertOptions.forEach(option => {
    option.addEventListener('change', async () => {
      try {
        const user = auth.currentUser;
        const alertSettings = Array.from(alertOptions).reduce((acc, opt) => {
          acc[opt.parentElement.textContent.trim()] = opt.checked;
          return acc;
        }, {});

        await updateDoc(doc(db, 'users', user.uid), {
          alertSettings
        });
      } catch (error) {
        console.error('Error updating alert settings:', error);
        showError('Failed to update alert settings');
      }
    });
  });
});

async function loadSecuritySettings(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    const data = userDoc.data();

    // Set 2FA toggle state
    const twoFactorToggle = document.getElementById('twoFactorToggle');
    if (twoFactorToggle) {
      twoFactorToggle.checked = data.twoFactorEnabled || false;
    }

    // Set alert preferences
    const alertSettings = data.alertSettings || {};
    const alertOptions = document.querySelectorAll('.alert-option input');
    alertOptions.forEach(option => {
      const settingName = option.parentElement.textContent.trim();
      option.checked = alertSettings[settingName] ?? option.checked;
    });

    // Load login history
    const loginHistory = document.querySelector('.login-history');
    if (loginHistory && data.loginHistory) {
      loginHistory.innerHTML = data.loginHistory
        .slice(0, 5)
        .map(login => createLoginHistoryItem(login))
        .join('');
    }
  } catch (error) {
    console.error('Error loading security settings:', error);
    showError('Failed to load security settings');
  }
}

function createLoginHistoryItem(login) {
  return `
    <div class="history-item">
      <i class="fas ${login.device.includes('Mobile') ? 'fa-mobile-alt' : 'fa-desktop'}"></i>
      <div class="history-details">
        <p>${login.device}</p>
        <small>Last access: ${formatDate(login.timestamp)}</small>
      </div>
      ${login.current ? '<span class="status current">Current</span>' : ''}
    </div>
  `;
}

function formatDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

function getErrorMessage(error) {
  switch (error.code) {
    case 'auth/wrong-password':
      return 'Current password is incorrect';
    case 'auth/weak-password':
      return 'New password is too weak. Please use at least 6 characters';
    default:
      return 'An error occurred. Please try again';
  }
}

function showError(message) {
  showNotification(message, 'error');
}

function showSuccess(message) {
  showNotification(message, 'success');
}

function showWarning(message) {
  showNotification(message, 'warning');
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.querySelector('.content-area').prepend(notification);
  setTimeout(() => notification.remove(), 5000);
}
