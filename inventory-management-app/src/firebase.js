// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC_ZYvTDc2cLX1FHt3EZ8c1HSK3M0tAGbQ",
    authDomain: "pantry-tracker-83d2f.firebaseapp.com",
    projectId: "pantry-tracker-83d2f",
    storageBucket: "pantry-tracker-83d2f.appspot.com",
    messagingSenderId: "747422121973",
    appId: "1:747422121973:web:8abaf8774b1d5fec11aabc",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
export { firestore };

// making random changes
