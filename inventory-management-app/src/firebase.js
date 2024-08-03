// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_ZYvTDc2cLX1FHt3EZ8c1HSK3M0tAGbQ",
  authDomain: "pantry-tracker-83d2f.firebaseapp.com",
  projectId: "pantry-tracker-83d2f",
  storageBucket: "pantry-tracker-83d2f.appspot.com",
  messagingSenderId: "747422121973",
  appId: "1:747422121973:web:e8bdb51abb60c16811aabc",
  measurementId: "G-5D4SKYD623"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);