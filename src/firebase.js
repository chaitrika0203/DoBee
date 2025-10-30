// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
 apiKey: "AIzaSy...yourkey...",
  authDomain: "dobee.firebaseapp.com",
  projectId: "dobee",
  storageBucket: "dobee.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export default app;