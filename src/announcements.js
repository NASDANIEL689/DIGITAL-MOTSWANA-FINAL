import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

document.addEventListener('DOMContentLoaded', () => {
  // Handle authentication state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = './index.html';
      return;
    }
    loadAnnouncements();
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

  // Handle announcement filters
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      
      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter announcements
      const announcements = document.querySelectorAll('.announcement-card');
      announcements.forEach(card => {
        if (filter === 'all' || card.classList.contains(filter)) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Handle "Read More" buttons
  document.addEventListener('click', (e) => {
    if (e.target.matches('.btn-secondary')) {
      const card = e.target.closest('.announcement-card');
      const title = card.querySelector('h3').textContent;
      const content = card.querySelector('p').textContent;
      const date = card.querySelector('.date').textContent;
      const badge = card.querySelector('.badge').textContent;

      showAnnouncementModal(title, content, date, badge);
    }
  });
});

async function loadAnnouncements() {
  try {
    const announcementsRef = collection(db, 'announcements');
    const q = query(announcementsRef, orderBy('date', 'desc'), limit(10));
    const querySnapshot = await getDocs(q);

    const announcementsList = document.querySelector('.announcements-list');
    announcementsList.innerHTML = '';

    querySnapshot.forEach(doc => {
      const announcement = doc.data();
      const card = createAnnouncementCard(announcement);
      announcementsList.appendChild(card);
    });
  } catch (error) {
    console.error('Error loading announcements:', error);
    showError('Failed to load announcements');
  }
}

function createAnnouncementCard(announcement) {
  const card = document.createElement('div');
  card.className = `announcement-card ${announcement.type.toLowerCase()}`;
  
  card.innerHTML = `
    <div class="announcement-header">
      <span class="badge ${announcement.type.toLowerCase()}">${announcement.type}</span>
      <span class="date">${formatDate(announcement.date)}</span>
    </div>
    <h3>${announcement.title}</h3>
    <p>${announcement.preview || announcement.content}</p>
    <div class="announcement-footer">
      <button class="btn-secondary">Read More</button>
      <span class="time-ago">${getTimeAgo(announcement.date)}</span>
    </div>
  `;

  return card;
}

function showAnnouncementModal(title, content, date, type) {
  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close">&times;</span>
      <div class="announcement-header">
        <span class="badge ${type.toLowerCase()}">${type}</span>
        <span class="date">${date}</span>
      </div>
      <h2>${title}</h2>
      <div class="announcement-content">
        ${content}
      </div>
    </div>
  `;

  modal.querySelector('.close').onclick = () => modal.remove();
  document.body.appendChild(modal);
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function getTimeAgo(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffTime / (1000 * 60));

  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(timestamp);
}

function showError(message) {
  const notification = document.createElement('div');
  notification.className = 'notification error';
  notification.textContent = message;
  document.querySelector('.content-area').prepend(notification);
  setTimeout(() => notification.remove(), 5000);
}
