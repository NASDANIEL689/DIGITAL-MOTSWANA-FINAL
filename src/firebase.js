// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage'; // Add this import

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQi7qQxRoqP0Z5vq01wz4mzDBk8j3FFIg",
  authDomain: "digitalmotswana.firebaseapp.com",
  projectId: "digitalmotswana",
  storageBucket: "digitalmotswana.appspot.com", // Ensure this matches your Storage bucket
  messagingSenderId: "1081903997713",
  appId: "1:1081903997713:web:71e91d3d96377e5ff762b0",
  measurementId: "G-3T65DGT5M6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app, "gs://digitalmotswana.firebasestorage.app"); // Explicitly set the storage bucket
// Export the services
export { auth, db, storage };