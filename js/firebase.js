import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBBsyDDdtTMqnGauVStygImTAre7UkrZ0g",
  authDomain: "controle-gastos-48fba.firebaseapp.com",
  projectId: "controle-gastos-48fba",
  storageBucket: "controle-gastos-48fba.firebasestorage.app",
  messagingSenderId: "252971513565",
  appId: "1:252971513565:web:28ca390461feae8d958d34",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
