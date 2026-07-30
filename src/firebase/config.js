import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAW8BjUQX8IxHyYzI7gOpEGmeHCBMCTwvs",
  authDomain: "topshiriq-test.firebaseapp.com",
  projectId: "topshiriq-test",
  storageBucket: "topshiriq-test.firebasestorage.app",
  messagingSenderId: "214783651590",
  appId: "1:214783651590:web:451cf27107f1b58a01f887"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;