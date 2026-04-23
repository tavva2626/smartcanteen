import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA6nEPr6a_EJ-NyS5I_xVRFT85JYC0rOhg",
  authDomain: "smartcanteen-7f879.firebaseapp.com",
  projectId: "smartcanteen-7f879",
  storageBucket: "smartcanteen-7f879.firebasestorage.app",
  messagingSenderId: "345436231047",
  appId: "1:345436231047:web:4e57999a783e7f0d802f22",
  measurementId: "G-XXSF0G78B1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
