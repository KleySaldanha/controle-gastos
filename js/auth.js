import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, updateDoc,
  collection, getDocs,
} from 'firebase/firestore';
import { auth, db } from './firebase.js';

const AUTH_ERRORS = {
  'auth/user-not-found':       'Usuário não encontrado.',
  'auth/wrong-password':       'Senha incorreta.',
  'auth/invalid-credential':   'E-mail ou senha incorretos.',
  'auth/email-already-in-use': 'E-mail já cadastrado.',
  'auth/weak-password':        'Senha muito fraca (mínimo 6 caracteres).',
  'auth/invalid-email':        'E-mail inválido.',
  'auth/too-many-requests':    'Muitas tentativas. Tente novamente mais tarde.',
  'auth/requires-recent-login':'Faça login novamente para alterar a senha.',
};

export function authErrorMessage(code) {
  return AUTH_ERRORS[code] || 'Ocorreu um erro. Tente novamente.';
}

/* ── Registro (novos usuários sempre como 'user') ── */
export async function register(name, email, password) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', credential.user.uid), {
    name,
    email,
    role:      'user',
    active:    true,
    createdAt: new Date().toISOString(),
  });
  return credential.user;
}

/* ── Cria perfil de administrador para usuário criado via console ── */
export async function createAdminProfile(user) {
  const name = user.displayName || user.email.split('@')[0];
  await setDoc(doc(db, 'users', user.uid), {
    name,
    email:     user.email,
    role:      'admin',
    active:    true,
    createdAt: new Date().toISOString(),
  });
  return { name, email: user.email, role: 'admin', active: true };
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

/* ── Admin: lista todos os usuários ── */
export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ uid: d.id, ...d.data() }));
}

/* ── Admin: altera perfil de acesso ── */
export async function updateUserRole(uid, role) {
  await updateDoc(doc(db, 'users', uid), { role });
}

/* ── Admin: ativa / desativa conta ── */
export async function setUserActive(uid, active) {
  await updateDoc(doc(db, 'users', uid), { active });
}

/* ── Perfil: atualiza nome ── */
export async function updateUserName(name) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await updateDoc(doc(db, 'users', uid), { name });
}

/* ── Perfil: altera senha (requer senha atual para re-autenticar) ── */
export async function changePassword(currentPassword, newPassword) {
  const user = auth.currentUser;
  const credential = EmailAuthProvider.credential(user.email, currentPassword);
  await reauthenticateWithCredential(user, credential);
  await updatePassword(user, newPassword);
}
