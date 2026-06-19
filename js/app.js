import '../css/styles.css';
import { MONTHS } from './config.js';
import { state, loadState, setYear, setMonth } from './state.js';
import { render, renderAnnual } from './render.js';
import { renderCharts } from './charts.js';
import {
  initModals, openAddModal, openSalaryModal,
  closeModal, saveEntry, deleteEntry,
  saveSalary, populateCatSelect, populateSubcats,
  clearSubcatContext, openEditSubcat,
  addFromSubcatModal, editEntryFromSubcat, deleteEntryFromSubcat,
} from './modals.js';
import { onAuthChange, logout, getUserProfile } from './auth.js';

/* ── Expõe funções chamadas via onclick no HTML ── */
window.openSalaryModal       = openSalaryModal;
window.openAddModal          = openAddModal;
window.closeModal            = closeModal;
window.saveEntry             = saveEntry;
window.deleteEntry           = deleteEntry;
window.saveSalary            = saveSalary;
window.populateSubcats       = populateSubcats;
window.clearSubcatContext    = clearSubcatContext;
window.openEditSubcat        = openEditSubcat;
window.addFromSubcatModal    = addFromSubcatModal;
window.editEntryFromSubcat   = editEntryFromSubcat;
window.deleteEntryFromSubcat = deleteEntryFromSubcat;
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
    const profile = await getUserProfile(user.uid);
    showUserInfo(user, profile);
    await loadState();
    init();
    document.getElementById('app-loading').style.display = 'none';
    document.getElementById('app-content').style.display = '';
  });
});

function showUserInfo(user, profile) {
  const name  = profile?.name || user.email;
  const role  = profile?.role || 'user';
  const badge = role === 'admin' ? '<span class="role-badge admin">Admin</span>' : '<span class="role-badge">Usuário</span>';
  document.getElementById('user-info').innerHTML =
    `<span class="user-name">${name}</span>${badge}`;
}

async function handleLogout() {
  await logout();
  window.location.href = BASE + 'login.html';
}

/* ── FAB speed-dial ── */
function toggleFab() {
  document.getElementById('fab-container').classList.toggle('open');
}
function closeFab() {
  document.getElementById('fab-container').classList.remove('open');
}
function fabOpenEntry() {
  closeFab();
  openAddModal();
}
function fabOpenSalary() {
  closeFab();
  openSalaryModal();
}

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
