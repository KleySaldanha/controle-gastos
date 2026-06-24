import { MONTHS } from './config.js';
import { state, getEntries, getSalary, setSalary, addEntry, updateEntry, removeEntry, getCategories } from './state.js';
import { fmt } from './finance.js';
import { render } from './render.js';

let editingEntryId = null;

export let subcatContext = { catId: null, subcat: null };

export function openModal(id) {
  document.getElementById(id).classList.add('open');
}

export function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

export function showToast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

export function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target !== overlay) return;
      overlay.classList.remove('open');
      if (overlay.id === 'modal-subcat') clearSubcatContext();
    });
  });
}

export function populateCatSelect() {
  document.getElementById('entry-cat').innerHTML =
    getCategories().map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

export function populateSubcats() {
  const catId = document.getElementById('entry-cat').value;
  const cat   = getCategories().find(c => c.id === catId);
  document.getElementById('entry-subcat').innerHTML =
    cat.subcats.map(s => `<option value="${s}">${s}</option>`).join('');
}

export function openAddModal(catId = null) {
  editingEntryId = null;
  document.getElementById('modal-entry-title').textContent = 'Novo lançamento';
  document.getElementById('btn-delete-entry').classList.add('hidden');

  populateCatSelect();
  if (catId) document.getElementById('entry-cat').value = catId;
  populateSubcats();

  document.getElementById('entry-desc').value  = '';
  document.getElementById('entry-value').value = '';
  document.getElementById('entry-month').value =
    state.month === -1 ? new Date().getMonth() : state.month;

  openModal('modal-entry');
}

export function saveEntry() {
  const catId  = document.getElementById('entry-cat').value;
  const subcat = document.getElementById('entry-subcat').value;
  const desc   = document.getElementById('entry-desc').value.trim();
  const value  = parseFloat(document.getElementById('entry-value').value);
  const month  = parseInt(document.getElementById('entry-month').value);

  if (!value || value <= 0) {
    showToast('Informe um valor válido.');
    return;
  }

  if (editingEntryId !== null) {
    updateEntry(editingEntryId, { catId, subcat, desc, value, month });
  } else {
    addEntry({ year: state.year, month, catId, subcat, desc, value });
  }

  closeModal('modal-entry');
  render();

  if (subcatContext.catId) {
    renderSubcatModal();
    openModal('modal-subcat');
  }

  showToast('Lançamento salvo!');
}

export function deleteEntry() {
  if (editingEntryId === null) return;
  removeEntry(editingEntryId);
  closeModal('modal-entry');
  render();

  if (subcatContext.catId) {
    renderSubcatModal();
    openModal('modal-subcat');
  }

  showToast('Lançamento excluído.');
}

export function openSalaryModal() {
  const current = getSalary(state.year, state.month);
  document.getElementById('salary-value').value = current || '';
  // Mostrar botão remover só se há salário definido no mês atual
  const removeBtn = document.getElementById('btn-remove-salary');
  if (removeBtn) removeBtn.style.display = (current > 0 && state.month !== -1) ? '' : 'none';
  openModal('modal-salary');
}

export function removeSalary() {
  if (state.month === -1) return;
  if (!confirm('Remover o salário de ' + (state.month >= 0 ? document.getElementById('sel-month').options[state.month + 1]?.text : '') + '?')) return;
  setSalary(state.year, state.month, 0);
  closeModal('modal-salary');
  render();
  showToast('Salário removido.');
}

export function saveSalary() {
  const value = parseFloat(document.getElementById('salary-value').value);
  const scope = document.getElementById('salary-scope').value;

  if (!value || value < 0) {
    showToast('Informe um valor válido.');
    return;
  }

  const targetMonth = scope === 'year' ? -1 : state.month;
  setSalary(state.year, targetMonth, value);

  closeModal('modal-salary');
  render();
  showToast('Salário atualizado!');
}

export function clearSubcatContext() {
  subcatContext = { catId: null, subcat: null };
}

export function openEditSubcat(catId, subcat) {
  subcatContext = { catId, subcat };
  renderSubcatModal();
  openModal('modal-subcat');
}

export function renderSubcatModal() {
  const { catId, subcat } = subcatContext;
  const { year, month }   = state;
  const cat     = getCategories().find(c => c.id === catId);
  const entries = getEntries(year, month).filter(
    e => e.catId === catId && e.subcat === subcat
  );
  const total   = entries.reduce((a, e) => a + e.value, 0);

  document.getElementById('subcat-modal-title').textContent = subcat;
  document.getElementById('subcat-modal-total').textContent =
    `${month === -1 ? 'Ano ' + year : MONTHS[month] + ' ' + year} · Total: ${fmt(total)}`;

  const list = document.getElementById('subcat-entries-list');

  if (entries.length === 0) {
    list.innerHTML = `
      <div class="entries-empty">
        Nenhum lançamento neste período.<br>
        Clique em "+ Novo lançamento" para adicionar.
      </div>`;
    return;
  }

  list.innerHTML = entries.map(e => `
    <div class="entry-row">
      <div class="entry-row-info">
        <div class="entry-row-desc ${!e.desc ? 'no-desc' : ''}">
          ${e.desc || 'Sem descrição'}
        </div>
        <div class="entry-row-meta">${MONTHS[e.month]} ${e.year}</div>
      </div>
      <div class="entry-row-value" style="color:${cat.color}">${fmt(e.value)}</div>
      <div class="entry-row-actions">
        <button class="btn-icon" title="Editar"  onclick="editEntryFromSubcat('${e.id}')">✏️</button>
        <button class="btn-icon danger" title="Excluir" onclick="deleteEntryFromSubcat('${e.id}')">🗑️</button>
      </div>
    </div>`).join('');
}

export function editEntryFromSubcat(entryId) {
  const entry = state.entries.find(e => String(e.id) === String(entryId));
  if (!entry) return;

  editingEntryId = entry.id;
  document.getElementById('modal-entry-title').textContent = 'Editar lançamento';
  document.getElementById('btn-delete-entry').classList.remove('hidden');

  populateCatSelect();
  document.getElementById('entry-cat').value   = entry.catId;
  populateSubcats();
  document.getElementById('entry-subcat').value = entry.subcat;
  document.getElementById('entry-desc').value   = entry.desc  || '';
  document.getElementById('entry-value').value  = entry.value;
  document.getElementById('entry-month').value  = entry.month;

  closeModal('modal-subcat');
  openModal('modal-entry');
}

export function deleteEntryFromSubcat(entryId) {
  removeEntry(Number(entryId));
  renderSubcatModal();
  render();
  showToast('Lançamento excluído.');
}

export function addFromSubcatModal() {
  closeModal('modal-subcat');
  openAddModal(subcatContext.catId);
  document.getElementById('entry-subcat').value = subcatContext.subcat;
}

export function openCatAllEntries(catId) {
  const { year, month } = state;
  const cat     = getCategories().find(c => c.id === catId);
  const entries = getEntries(year, month)
    .filter(e => e.catId === catId)
    .sort((a, b) => a.month - b.month);

  const total = entries.reduce((s, e) => s + e.value, 0);

  document.getElementById('cat-all-title').textContent = cat?.name || catId;
  document.getElementById('cat-all-period').textContent =
    month === -1 ? `Ano ${year}` : `${MONTHS[month]} ${year}`;
  document.getElementById('cat-all-total').textContent = fmt(total);

  const color = cat?.color || 'var(--invest)';

  document.getElementById('cat-all-list').innerHTML = entries.length === 0
    ? `<div class="entries-empty">Nenhum lançamento neste período.</div>`
    : entries.map(e => `
        <div class="entry-row">
          <div class="entry-row-info">
            <div class="entry-row-desc ${!e.desc ? 'no-desc' : ''}">${e.desc || 'Sem descrição'}</div>
            <div class="entry-row-meta">${e.subcat} · ${MONTHS[e.month]} ${e.year}</div>
          </div>
          <div class="entry-row-value" style="color:${color}">${fmt(e.value)}</div>
          <div class="entry-row-actions">
            <button class="btn-icon" title="Editar"  onclick="editEntryFromCatAll('${e.id}')">✏️</button>
            <button class="btn-icon danger" title="Excluir" onclick="deleteEntryFromCatAll('${e.id}')">🗑️</button>
          </div>
        </div>`).join('');

  openModal('modal-cat-all');
}

export function editEntryFromCatAll(entryId) {
  const entry = state.entries.find(e => String(e.id) === String(entryId));
  if (!entry) return;

  editingEntryId = entry.id;
  document.getElementById('modal-entry-title').textContent = 'Editar lançamento';
  document.getElementById('btn-delete-entry').classList.remove('hidden');

  populateCatSelect();
  document.getElementById('entry-cat').value    = entry.catId;
  populateSubcats();
  document.getElementById('entry-subcat').value = entry.subcat;
  document.getElementById('entry-desc').value   = entry.desc  || '';
  document.getElementById('entry-value').value  = entry.value;
  document.getElementById('entry-month').value  = entry.month;

  closeModal('modal-cat-all');
  openModal('modal-entry');
}

export function deleteEntryFromCatAll(entryId) {
  const catId = state.entries.find(e => String(e.id) === String(entryId))?.catId;
  removeEntry(Number(entryId));
  render();
  showToast('Lançamento excluído.');
  openCatAllEntries(catId);
}
