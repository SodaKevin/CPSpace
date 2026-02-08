// Import Firebase core
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

/*const firebaseConfig = {
    apiKey: "AIzaSyBM32ltj6MOpr7Dqr-2uqKI-y6gNijouEU",
    authDomain: "cpspace.firebaseapp.com",
    projectId: "cpspace",
    storageBucket: "cpspace.firebasestorage.app",
    messagingSenderId: "118287740412",
    appId: "1:118287740412:web:d6a36e8e6dbf23ee2a1679"
};*/

const firebaseConfig = {
  apiKey: "AIzaSyAfHK5XxC0wE2eH-cEqvrR0IOyJ4nbH-Ew",
  authDomain: "cpspace-b4a82.firebaseapp.com",
  projectId: "cpspace-b4a82",
  storageBucket: "cpspace-b4a82.firebasestorage.app",
  messagingSenderId: "1088049481368",
  appId: "1:1088049481368:web:06e14a1f6e6928303db2ed",
  measurementId: "G-S6VXM3JSVZ"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
