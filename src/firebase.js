import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAIHd-7HSKxv7GzlwNipxLWRe2H6fjdGPA",
  authDomain: "petitjeuseg3525.firebaseapp.com",
  projectId: "petitjeuseg3525",
  storageBucket: "petitjeuseg3525.firebasestorage.app",
  messagingSenderId: "930372658010",
  appId: "1:930372658010:web:7beaa6ce80de3590e6c963",
  measurementId: "G-PR3BSNVCNV"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
