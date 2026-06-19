import '../css/styles.css';
import { login, authErrorMessage } from './auth.js';
import { auth } from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

const BASE = import.meta.env.BASE_URL;

/* Verifica UMA VEZ se já está logado ao carregar a página */
const unsub = onAuthStateChanged(auth, (user) => {
  unsub();
  if (user) window.location.href = BASE + 'index.html';
});

document.addEventListener('DOMContentLoaded', () => {
  if (new URLSearchParams(location.search).get('desativado')) {
    document.getElementById('login-error').textContent =
      'Sua conta foi desativada. Contate o administrador.';
  }

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const btn      = document.getElementById('login-btn');
    const errEl    = document.getElementById('login-error');

    errEl.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Entrando...';

    try {
      await login(email, password);
      window.location.href = BASE + 'index.html';
    } catch (err) {
      errEl.textContent = authErrorMessage(err.code);
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  });
});
