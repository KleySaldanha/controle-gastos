import '../css/styles.css';
import { register, onAuthChange, authErrorMessage } from './auth.js';

const BASE = import.meta.env.BASE_URL;

/* Redireciona se já estiver logado */
onAuthChange((user) => {
  if (user) window.location.href = BASE + 'index.html';
});

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('reg-name').value.trim();
    const email    = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm').value;
    const role     = document.getElementById('reg-role').value;
    const btn      = document.getElementById('register-btn');
    const errEl    = document.getElementById('register-error');

    errEl.textContent = '';

    if (password !== confirm) {
      errEl.textContent = 'As senhas não coincidem.';
      return;
    }
    if (password.length < 6) {
      errEl.textContent = 'Senha muito fraca (mínimo 6 caracteres).';
      return;
    }

    btn.disabled = true;
    btn.textContent = 'Cadastrando...';

    try {
      await register(name, email, password, role);
      window.location.href = BASE + 'index.html';
    } catch (err) {
      errEl.textContent = authErrorMessage(err.code);
      btn.disabled = false;
      btn.textContent = 'Cadastrar';
    }
  });
});
