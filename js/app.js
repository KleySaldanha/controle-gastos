import '../css/styles.css';
import { MONTHS } from './config.js';
import { state, loadState, setYear, setMonth } from './state.js';
import { render, renderAnnual } from './render.js';
import { renderCharts } from './charts.js';
import {
  initModals, openAddModal, openSalaryModal,
  closeModal, saveEntry, deleteEntry,
  saveSalary, removeSalary, populateCatSelect, populateSubcats,
  clearSubcatContext, openEditSubcat,
  addFromSubcatModal, editEntryFromSubcat, deleteEntryFromSubcat,
  openCatAllEntries, editEntryFromCatAll, deleteEntryFromCatAll,
} from './modals.js';
import { onAuthChange, logout, getUserProfile, createAdminProfile } from './auth.js';

/* ── Expõe funções chamadas via onclick no HTML ── */
window.openSalaryModal       = openSalaryModal;
window.openAddModal          = openAddModal;
window.closeModal            = closeModal;
window.saveEntry             = saveEntry;
window.deleteEntry           = deleteEntry;
window.saveSalary            = saveSalary;
window.removeSalary          = removeSalary;
window.populateSubcats       = populateSubcats;
window.clearSubcatContext    = clearSubcatContext;
window.openEditSubcat        = openEditSubcat;
window.addFromSubcatModal    = addFromSubcatModal;
window.editEntryFromSubcat   = editEntryFromSubcat;
window.deleteEntryFromSubcat = deleteEntryFromSubcat;
window.openCatAllEntries     = openCatAllEntries;
window.editEntryFromCatAll   = editEntryFromCatAll;
window.deleteEntryFromCatAll = deleteEntryFromCatAll;
window.switchTab             = switchTab;
window.toggleFab             = toggleFab;
window.closeFab              = closeFab;
window.fabOpenEntry          = fabOpenEntry;
window.fabOpenSalary         = fabOpenSalary;
window.handleLogout          = handleLogout;

const BASE = import.meta.env.BASE_URL;

/* ── Auth guard ── */
document.addEventListener('DOMContentLoaded', () => {
  onAuthChange(async (user) => {
    if (!user) {
      window.location.href = BASE + 'login.html';
      return;
    }

    let profile = await getUserProfile(user.uid);

    /* Usuário criado via console do Firebase não tem perfil — cria como admin */
    if (!profile) {
      profile = await createAdminProfile(user);
    }

    /* Conta desativada pelo admin */
    if (profile.active === false) {
      await logout();
      window.location.href = BASE + 'login.html?desativado=1';
      return;
    }

    renderHeader(user, profile);
    await loadState();
    init();

    document.getElementById('app-loading').style.display = 'none';
    document.getElementById('app-content').style.display = '';
  });
});

function renderHeader(user, profile) {
  const name       = profile?.name || user.email;
  const isAdmin    = profile?.role === 'admin';
  const badge      = isAdmin
    ? '<span class="role-badge admin">Admin</span>'
    : '<span class="role-badge">Usuário</span>';
  const adminLink  = isAdmin
    ? `<a href="${BASE}admin.html" class="btn-nav">👥 Usuários</a>`
    : '';

  document.getElementById('user-info').innerHTML = `
    <a href="${BASE}profile.html" class="user-name-link" title="Minha conta">
      <span class="user-name">${name}</span>${badge}
    </a>
    <a href="${BASE}categories.html" class="btn-nav">🏷️ Categorias</a>
    ${adminLink}
  `;
}

async function handleLogout() {
  await logout();
  window.location.href = BASE + 'login.html';
}

/* ── FAB speed-dial ── */
function toggleFab() { document.getElementById('fab-container').classList.toggle('open'); }
function closeFab()  { document.getElementById('fab-container').classList.remove('open'); }
function fabOpenEntry()  { closeFab(); openAddModal(); }
function fabOpenSalary() { closeFab(); openSalaryModal(); }

/* ── Seletores de mês / ano ── */
function buildSelectors() {
  const selMonth   = document.getElementById('sel-month');
  const selYear    = document.getElementById('sel-year');
  const entryMonth = document.getElementById('entry-month');

  selMonth.innerHTML =
    '<option value="-1">Todos os meses</option>' +
    MONTHS.map((m, i) => `<option value="${i}">${m}</option>`).join('');
  selMonth.value    = state.month;
  selMonth.onchange = () => { setMonth(+selMonth.value); render(); };

  const cur = new Date().getFullYear();
  for (let y = cur - 2; y <= cur + 1; y++) {
    selYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  selYear.value    = state.year;
  selYear.onchange = () => { setYear(+selYear.value); render(); };

  entryMonth.innerHTML = MONTHS.map((m, i) =>
    `<option value="${i}">${m}</option>`).join('');
  entryMonth.value = state.month === -1 ? new Date().getMonth() : state.month;
}

/* ── Navegação por abas ── */
function switchTab(tab, btn) {
  ['dashboard', 'anual', 'graficos'].forEach(t => {
    document.getElementById('tab-' + t).classList.add('hidden');
  });
  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });
  document.getElementById('tab-' + tab).classList.remove('hidden');
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  if (tab === 'graficos') renderCharts();
  if (tab === 'anual')    renderAnnual();
}

/* ── Inicialização ── */
function init() {
  buildSelectors();
  initModals();
  populateCatSelect();
  populateSubcats();
  render();
}
