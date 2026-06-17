import '../css/styles.css';
import { MONTHS } from './config.js';
import { state, loadState, setYear, setMonth } from './state.js';
import { render } from './render.js';
import { renderAnnual } from './render.js';
import { renderCharts } from './charts.js';
import {
  initModals, openModal, closeModal,
  openAddModal, openSalaryModal,
  saveEntry, deleteEntry,
  saveSalary, populateCatSelect, populateSubcats,
  clearSubcatContext, openEditSubcat,
  addFromSubcatModal, editEntryFromSubcat, deleteEntryFromSubcat,
} from './modals.js';

/* ── Expõe funções chamadas via onclick no HTML ── */
window.openSalaryModal     = openSalaryModal;
window.openAddModal        = openAddModal;
window.closeModal          = closeModal;
window.saveEntry           = saveEntry;
window.deleteEntry         = deleteEntry;
window.saveSalary          = saveSalary;
window.populateSubcats     = populateSubcats;
window.clearSubcatContext  = clearSubcatContext;
window.openEditSubcat      = openEditSubcat;
window.addFromSubcatModal  = addFromSubcatModal;
window.editEntryFromSubcat = editEntryFromSubcat;
window.deleteEntryFromSubcat = deleteEntryFromSubcat;
window.switchTab           = switchTab;

function buildSelectors() {
  const selMonth   = document.getElementById('sel-month');
  const selYear    = document.getElementById('sel-year');
  const entryMonth = document.getElementById('entry-month');

  selMonth.innerHTML =
    '<option value="-1">Todos os meses</option>' +
    MONTHS.map((m, i) => `<option value="${i}">${m}</option>`).join('');
  selMonth.value    = state.month;
  selMonth.onchange = () => {
    setMonth(+selMonth.value);
    render();
  };

  const cur = new Date().getFullYear();
  for (let y = cur - 2; y <= cur + 1; y++) {
    selYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  selYear.value    = state.year;
  selYear.onchange = () => {
    setYear(+selYear.value);
    render();
  };

  entryMonth.innerHTML = MONTHS.map((m, i) =>
    `<option value="${i}">${m}</option>`).join('');
  entryMonth.value = state.month === -1 ? new Date().getMonth() : state.month;
}

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

function init() {
  loadState();
  buildSelectors();
  initModals();
  populateCatSelect();
  populateSubcats();
  render();
}

document.addEventListener('DOMContentLoaded', init);
