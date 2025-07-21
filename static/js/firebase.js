import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN4mtnSONe9zq2-6qeHsvlxED8S0JBDqo",
  authDomain: "recipemagic-eae24.firebaseapp.com",
  projectId: "recipemagic-eae24",
  storageBucket: "recipemagic-eae24.appspot.com",
  messagingSenderId: "923506249829",
  appId: "1:923506249829:web:087b600d2b463f5bb3f68c",
  measurementId: "G-6QH7L7Z4Z9",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
