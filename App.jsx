// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-edPH5OKzgkTLoz4WpyltyLo0ahKKnjk",
  authDomain: "teamnhadatnhatnhi.firebaseapp.com",
  projectId: "teamnhadatnhatnhi",
  storageBucket: "teamnhadatnhatnhi.firebasestorage.app",
  messagingSenderId: "476226553016",
  appId: "1:476226553016:web:78fd6151200eedb7d5604d",
  measurementId: "G-WHFRJ40X1F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);