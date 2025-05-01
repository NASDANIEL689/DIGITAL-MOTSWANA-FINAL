import { auth, db, storage } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, collection, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

document.addEventListener('DOMContentLoaded', () => {
  // Handle authentication state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = './index.html';
      return;
    }
    initializeSupportPage(user);
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

  // Handle FAQ toggles
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const icon = question.querySelector('i');
      
      // Toggle answer visibility
      answer.style.maxHeight = answer.style.maxHeight ? null : answer.scrollHeight + 'px';
      
      // Rotate icon
      icon.style.transform = answer.style.maxHeight ? 'rotate(0deg)' : 'rotate(180deg)';
    });
  });

  // Handle support form submission
  const supportForm = document.getElementById('supportForm');
  if (supportForm) {
    supportForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const subject = document.getElementById('subject').value;
      const message = document.getElementById('message').value;
      const attachment = document.getElementById('attachment').files[0];

      try {
        await submitSupportTicket(subject, message, attachment);
        showSuccess('Support ticket submitted successfully');
        supportForm.reset();
      } catch (error) {
        console.error('Error submitting support ticket:', error);
        showError('Failed to submit support ticket');
      }
    });
  }

  // Initialize live chat if available
  const liveChatOption = document.querySelector('.help-option:has(i.fa-comments)');
  if (liveChatOption) {
    liveChatOption.addEventListener('click', (e) => {
      e.preventDefault();
      initializeLiveChat();
    });
  }
});

async function initializeSupportPage(user) {
  try {
    // Load user's previous tickets
    const userDoc = await doc(db, 'users', user.uid);
    updateSystemStatus();
  } catch (error) {
    console.error('Error initializing support page:', error);
    showError('Failed to load support information');
  }
}

async function submitSupportTicket(subject, message, attachment) {
  const user = auth.currentUser;
  let attachmentUrl = null;

  // Upload attachment if present
  if (attachment) {
    const storageRef = ref(storage, `support_attachments/${user.uid}/${Date.now()}_${attachment.name}`);
    await uploadBytes(storageRef, attachment);
    attachmentUrl = await getDownloadURL(storageRef);
  }

  // Create support ticket
  const ticketRef = await addDoc(collection(db, 'support_tickets'), {
    userId: user.uid,
    userEmail: user.email,
    subject,
    message,
    attachmentUrl,
    status: 'open',
    priority: 'medium',
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp()
  });

  // Update user's tickets list
  await updateDoc(doc(db, 'users', user.uid), {
    supportTickets: {
      [ticketRef.id]: {
        subject,
        status: 'open',
        createdAt: new Date().toISOString()
      }
    }
  });

  // Send email notification
  await sendEmailNotification(user.email, 'Support Ticket Created', `
    Your support ticket has been created successfully.
    Ticket ID: ${ticketRef.id}
    Subject: ${subject}
    We'll get back to you shortly.
  `);
}

function updateSystemStatus() {
  const statusItems = document.querySelectorAll('.status-item');
  
  // Simulated system status check
  const systems = {
    'Document Upload': true,
    'Verification System': true,
    'User Authentication': true,
    'API Services': true
  };

  statusItems.forEach(item => {
    const label = item.querySelector('.status-label').textContent;
    const value = item.querySelector('.status-value');
    
    if (systems[label]) {
      value.className = 'status-value operational';
      value.textContent = 'Operational';
    } else {
      value.className = 'status-value disrupted';
      value.textContent = 'Service Disruption';
    }
  });
}

function initializeLiveChat() {
  const chatContainer = document.createElement('div');
  chatContainer.className = 'chat-container';
  chatContainer.innerHTML = `
    <div class="chat-header">
      <h3>Live Support</h3>
      <button class="close-chat">&times;</button>
    </div>
    <div class="chat-messages"></div>
    <div class="chat-input">
      <input type="text" placeholder="Type your message...">
      <button><i class="fas fa-paper-plane"></i></button>
    </div>
  `;

  document.body.appendChild(chatContainer);

  // Handle chat close
  chatContainer.querySelector('.close-chat').onclick = () => chatContainer.remove();

  // Handle message sending
  const input = chatContainer.querySelector('input');
  const sendButton = chatContainer.querySelector('button');
  const messages = chatContainer.querySelector('.chat-messages');

  sendButton.onclick = () => {
    if (input.value.trim()) {
      const message = document.createElement('div');
      message.className = 'chat-message user';
      message.textContent = input.value;
      messages.appendChild(message);
      input.value = '';
      
      // Simulate response
      setTimeout(() => {
        const response = document.createElement('div');
        response.className = 'chat-message agent';
        response.textContent = 'Thank you for your message. An agent will be with you shortly.';
        messages.appendChild(response);
        messages.scrollTop = messages.scrollHeight;
      }, 1000);
    }
  };

  input.onkeypress = (e) => {
    if (e.key === 'Enter') sendButton.click();
  };
}

async function sendEmailNotification(email, subject, message) {
  // This would typically be handled by a backend service
  console.log('Email notification sent:', { email, subject, message });
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
