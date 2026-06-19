import '../css/styles.css';
import { onAuthChange, getUserProfile, getAllUsers, updateUserRole, setUserActive, logout, authErrorMessage } from './auth.js';
import { auth } from './firebase.js';

const BASE = import.meta.env.BASE_URL;

let currentUid = null;

onAuthChange(async (user) => {
  if (!user) { window.location.href = BASE + 'login.html'; return; }

  const profile = await getUserProfile(user.uid);
  if (profile?.role !== 'admin') { window.location.href = BASE + 'index.html'; return; }

  currentUid = user.uid;
  document.getElementById('admin-name').textContent = profile.name || user.email;
  loadUsers();
});

async function loadUsers() {
  const tbody  = document.getElementById('users-tbody');
  const countEl = document.getElementById('users-count');
  tbody.innerHTML = '<tr><td colspan="5" class="table-loading">Carregando...</td></tr>';

  try {
    const users = await getAllUsers();
    countEl.textContent = `${users.length} usuário${users.length !== 1 ? 's' : ''}`;
    tbody.innerHTML = users.map(u => renderRow(u)).join('');
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="5" class="auth-error">Erro ao carregar usuários.</td></tr>`;
    console.error(err);
  }
}

function renderRow(u) {
  const isMe      = u.uid === currentUid;
  const roleBadge = u.role === 'admin'
    ? '<span class="role-badge admin">Admin</span>'
    : '<span class="role-badge">Usuário</span>';
  const activeBadge = u.active !== false
    ? '<span class="status-badge active">Ativo</span>'
    : '<span class="status-badge inactive">Inativo</span>';

  const roleBtn = isMe ? '' : `
    <button class="btn btn-sm" onclick="toggleRole('${u.uid}', '${u.role}')">
      ${u.role === 'admin' ? 'Tornar Usuário' : 'Tornar Admin'}
    </button>`;

  const activeBtn = isMe ? '' : `
    <button class="btn btn-sm ${u.active !== false ? 'btn-danger' : ''}" onclick="toggleActive('${u.uid}', ${u.active !== false})">
      ${u.active !== false ? 'Desativar' : 'Ativar'}
    </button>`;

  return `
    <tr id="row-${u.uid}">
      <td class="td-name">
        <div class="user-row-name">${u.name || '—'}</div>
        <div class="user-row-email">${u.email}</div>
      </td>
      <td>${roleBadge}</td>
      <td>${activeBadge}</td>
      <td class="td-since">${u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
      <td class="td-actions">${roleBtn}${activeBtn}</td>
    </tr>`;
}

window.toggleRole = async (uid, currentRole) => {
  const newRole = currentRole === 'admin' ? 'user' : 'admin';
  try {
    await updateUserRole(uid, newRole);
    loadUsers();
  } catch (err) {
    alert('Erro ao alterar perfil: ' + authErrorMessage(err.code));
  }
};

window.toggleActive = async (uid, currentActive) => {
  try {
    await setUserActive(uid, !currentActive);
    loadUsers();
  } catch (err) {
    alert('Erro ao alterar status: ' + authErrorMessage(err.code));
  }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    window.location.href = BASE + 'login.html';
  });

  document.getElementById('refresh-btn').addEventListener('click', loadUsers);
});
