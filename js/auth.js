import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

const AUTH_ERRORS = {
  'auth/user-not-found':       'Usuário não encontrado.',
  'auth/wrong-password':       'Senha incorreta.',
  'auth/invalid-credential':   'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'E-mail já cadastrado.',
  'auth/weak-password':        'Senha muito fraca (mínimo 6 caracteres).',
  'auth/invalid-email':        'E-mail inválido.',
  'auth/too-many-requests':    'Muitas tentativas. Tente novamente mais tarde.',
};

export function authErrorMessage(code) {
  return AUTH_ERRORS[code] || 'Ocorreu um erro. Tente novamente.';
}

export async function register(name, email, password, role) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', credential.user.uid), {
    name,
    email,
    role,
    createdAt: new Date().toISOString(),
  });
  return credential.user;
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export function onAuthChange(callback) {
  onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? snap.data() : null;
}

export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, 'users', uid), { role });
}
