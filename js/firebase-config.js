import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCy6joFaV8ThyNK8cFViuzsy7SuWy1-58s",
  authDomain: "restaurantapp-f1905.firebaseapp.com",
  projectId: "restaurantapp-f1905",
  storageBucket: "restaurantapp-f1905.firebasestorage.app",
  messagingSenderId: "989382348245",
  appId: "1:989382348245:web:5aaceabc1c547fac5c415c",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
