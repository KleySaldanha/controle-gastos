import '../css/styles.css';
import { onAuthChange, getUserProfile, updateUserName, changePassword, authErrorMessage, logout } from './auth.js';

const BASE = import.meta.env.BASE_URL;

onAuthChange(async (user) => {
  if (!user) { window.location.href = BASE + 'login.html'; return; }

  const profile = await getUserProfile(user.uid);
  document.getElementById('profile-name-display').textContent = profile?.name || user.email;
  document.getElementById('profile-email').textContent = user.email;
  const badge = profile?.role === 'admin'
    ? '<span class="role-badge admin">Administrador</span>'
    : '<span class="role-badge">Usuário</span>';
  document.getElementById('profile-role').innerHTML = badge;
  document.getElementById('name-input').value = profile?.name || '';
});

document.addEventListener('DOMContentLoaded', () => {
  /* ── Alterar nome ── */
  document.getElementById('name-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name  = document.getElementById('name-input').value.trim();
    const btn   = document.getElementById('name-btn');
    const msgEl = document.getElementById('name-msg');

    if (!name) { msgEl.textContent = 'Informe um nome.'; msgEl.className = 'auth-error'; return; }

    btn.disabled = true;
    try {
      await updateUserName(name);
      document.getElementById('profile-name-display').textContent = name;
      msgEl.textContent = 'Nome atualizado!';
      msgEl.className = 'form-success';
    } catch {
      msgEl.textContent = 'Erro ao atualizar nome.';
      msgEl.className = 'auth-error';
    } finally {
      btn.disabled = false;
    }
  });

  /* ── Alterar senha ── */
  document.getElementById('password-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const current  = document.getElementById('pw-current').value;
    const newPw    = document.getElementById('pw-new').value;
    const confirm  = document.getElementById('pw-confirm').value;
    const btn      = document.getElementById('pw-btn');
    const msgEl    = document.getElementById('pw-msg');

    msgEl.textContent = '';

    if (newPw !== confirm) { msgEl.textContent = 'As senhas não coincidem.'; msgEl.className = 'auth-error'; return; }
    if (newPw.length < 6)  { msgEl.textContent = 'Mínimo 6 caracteres.';     msgEl.className = 'auth-error'; return; }

    btn.disabled = true;
    try {
      await changePassword(current, newPw);
      msgEl.textContent = 'Senha alterada com sucesso!';
      msgEl.className = 'form-success';
      document.getElementById('password-form').reset();
    } catch (err) {
      msgEl.textContent = authErrorMessage(err.code);
      msgEl.className = 'auth-error';
    } finally {
      btn.disabled = false;
    }
  });

  /* ── Sair ── */
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    window.location.href = BASE + 'login.html';
  });
});
