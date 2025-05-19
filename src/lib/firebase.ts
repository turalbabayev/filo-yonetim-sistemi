// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6O0quETj4rSGCvaaKtr-IStVXQLk0ixU",
  authDomain: "filo-yonetim-sistemi.firebaseapp.com",
  projectId: "filo-yonetim-sistemi",
  storageBucket: "filo-yonetim-sistemi.firebasestorage.app",
  messagingSenderId: "104453417934",
  appId: "1:104453417934:web:f885a2175dbd77a45c401c"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth }; 