// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDBKtylKJAaSSUtDy3lxWIZJNiBuwo2Pzs",
  authDomain: "myproject-7510b.firebaseapp.com",
  projectId: "myproject-7510b",
  storageBucket: "myproject-7510b.appspot.com",
  messagingSenderId: "1091492539492",
  appId: "1:1091492539492:web:e3c12058678cb0e5f60371"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app)
const database = getFirestore(app)
export { app, database, storage}