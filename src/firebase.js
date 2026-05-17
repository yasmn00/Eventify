import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCPnpQ9ppzRhmdttCnLaUHk7H9yQlzMJo",
  authDomain: "eventero-1e682.firebaseapp.com",
  projectId: "eventero-1e682",
  storageBucket: "eventero-1e682.firebasestorage.app",
  messagingSenderId: "232327197580",
  appId: "1:232327197580:web:fe0ecefabefdf9daa39ca9",
  measurementId: "G-E59LXTTXG0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
const analytics = getAnalytics(app);