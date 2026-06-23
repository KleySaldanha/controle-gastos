import '../css/styles.css';
import {
  onAuthChange, getUserProfile, getAllUsers,
  updateUserRole, setUserActive, logout,
  updateOtherUserName, sendPasswordReset, authErrorMessage,
} from './auth.js';

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
    tbody.innerHTML = `<tr><td colspan="5" class="auth-error" style="padding:24px;text-align:center">Erro ao carregar usuários.</td></tr>`;
    console.error(err);
  }
}

function renderRow(u) {
  const isMe       = u.uid === currentUid;
  const roleBadge  = u.role === 'admin'
    ? '<span class="role-badge admin">Admin</span>'
    : '<span class="role-badge">Usuário</span>';
  const activeBadge = u.active !== false
    ? '<span class="status-badge active">Ativo</span>'
    : '<span class="status-badge inactive">Inativo</span>';

  const roleBtn = isMe ? '' : `
    <button class="btn btn-sm" onclick="toggleRole('${u.uid}','${u.role}')">
      ${u.role === 'admin' ? 'Tornar Usuário' : 'Tornar Admin'}
    </button>`;

  const activeBtn = isMe ? '' : `
    <button class="btn btn-sm ${u.active !== false ? 'btn-danger' : ''}"
            onclick="toggleActive('${u.uid}',${u.active !== false})">
      ${u.active !== false ? 'Desativar' : 'Ativar'}
    </button>`;

  return `
    <tr id="row-${u.uid}">
      <td class="td-name">
        <div class="user-row-name" id="name-display-${u.uid}">${u.name || '—'}</div>
        <div class="user-row-email">${u.email}</div>
      </td>
      <td>${roleBadge}</td>
      <td>${activeBadge}</td>
      <td class="td-since">${u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}</td>
      <td class="td-actions">
        <div class="td-actions-inner">
          <button class="btn btn-sm" onclick="openEditModal('${u.uid}','${(u.name||'').replace(/'/g,"\\'")}','${u.email}')">Editar</button>
          ${roleBtn}
          ${activeBtn}
        </div>
      </td>
    </tr>`;
}

/* ── Modal de edição ── */
window.openEditModal = (uid, name, email) => {
  if (uid === currentUid) {
    window.location.href = BASE + 'profile.html';
    return;
  }
  document.getElementById('edit-uid').value   = uid;
  document.getElementById('edit-name').value  = name;
  document.getElementById('edit-email-info').textContent = email;
  document.getElementById('edit-msg').textContent = '';
  document.getElementById('edit-modal').classList.add('open');
};

window.closeEditModal = () => {
  document.getElementById('edit-modal').classList.remove('open');
};

window.toggleRole   = async (uid, role) => {
  try { await updateUserRole(uid, role === 'admin' ? 'user' : 'admin'); loadUsers(); }
  catch (err) { alert(authErrorMessage(err.code)); }
};

window.toggleActive = async (uid, active) => {
  try { await setUserActive(uid, !active); loadUsers(); }
  catch (err) { alert(authErrorMessage(err.code)); }
};

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    window.location.href = BASE + 'login.html';
  });

  document.getElementById('refresh-btn').addEventListener('click', loadUsers);

  /* Salvar nome */
  document.getElementById('edit-name-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const uid  = document.getElementById('edit-uid').value;
    const name = document.getElementById('edit-name').value.trim();
    const msg  = document.getElementById('edit-msg');
    if (!name) { msg.textContent = 'Informe um nome.'; msg.className = 'auth-error'; return; }
    try {
      await updateOtherUserName(uid, name);
      document.getElementById(`name-display-${uid}`).textContent = name;
      msg.textContent = 'Nome atualizado!';
      msg.className = 'form-success';
    } catch (err) {
      msg.textContent = authErrorMessage(err.code);
      msg.className = 'auth-error';
    }
  });

  /* Enviar reset de senha */
  document.getElementById('send-reset-btn').addEventListener('click', async () => {
    const email = document.getElementById('edit-email-info').textContent;
    const msg   = document.getElementById('edit-msg');
    try {
      await sendPasswordReset(email);
      msg.textContent = `E-mail de redefinição enviado para ${email}.`;
      msg.className = 'form-success';
    } catch (err) {
      msg.textContent = authErrorMessage(err.code);
      msg.className = 'auth-error';
    }
  });

  /* Fechar modal clicando fora */
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('edit-modal')) closeEditModal();
  });
});
