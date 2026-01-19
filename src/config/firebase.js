import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCllkJmbTVFmCIzkyIHXIO24FKlJ9i4VQg",
  authDomain: "nilspoisgolf.firebaseapp.com",
  projectId: "nilspoisgolf",
  storageBucket: "nilspoisgolf.firebasestorage.app",
  messagingSenderId: "606422939116",
  appId: "1:606422939116:web:d2a51bd4a1d5606c787cc9",
  measurementId: "G-VZ8X10ZEC4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);