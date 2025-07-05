import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// إعدادات مشروعك من Firebase
const firebaseConfig = {
  apiKey: "AIzaSyApBWOINYGbS3cHPzN8Vzy-XMEztueR5Ek",
  authDomain: "cazabet-bd515.firebaseapp.com",
  projectId: "cazabet-bd515",
  storageBucket: "cazabet-bd515.firebasestorage.app",
  messagingSenderId: "815113045261",
  appId: "1:815113045261:web:9dd24f0897a5bcf73d5c44",
  measurementId: "G-C1NQ3P9HRL"
};

// تهيئة التطبيق وربطه بفايرباز
const app = initializeApp(firebaseConfig);

// تهيئة قاعدة البيانات Firestore
export const db = getFirestore(app);
