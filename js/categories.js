import '../css/styles.css';
import { computeBg } from './config.js';
import { state, loadState, getCategories, setCategories, renameSubcat } from './state.js';
import { onAuthChange, getUserProfile, logout } from './auth.js';

const BASE = import.meta.env.BASE_URL;

let editingCatId = null; // null = novo, string = edição

/* ── Auth guard ── */
onAuthChange(async (user) => {
  if (!user) { window.location.href = BASE + 'login.html'; return; }

  const profile = await getUserProfile(user.uid);
  if (!profile || profile.active === false) {
    window.location.href = BASE + 'login.html?desativado=1';
    return;
  }

  document.getElementById('back-link').href = BASE + 'index.html';
  document.getElementById('user-info').innerHTML = `
    <a href="${BASE}profile.html" class="user-name-link">
      <span class="user-name">${profile.name || user.email}</span>
    </a>
    <button class="btn" onclick="handleLogout()">Sair</button>`;

  await loadState();
  renderAll();

  document.getElementById('page-loading').style.display = 'none';
  document.getElementById('page-content').style.display = '';
});

window.handleLogout = async () => {
  await logout();
  window.location.href = BASE + 'login.html';
};

/* ── Helpers ── */
function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function escJs(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
function entryCount(catId, subcat) {
  return state.entries.filter(
    e => e.catId === catId && (subcat === undefined || e.subcat === subcat)
  ).length;
}

/* ── Renderização ── */
function renderAll() {
  document.getElementById('cat-list').innerHTML =
    getCategories().map(cat => renderCatCard(cat)).join('');
}

function renderCatCard(cat) {
  const total = entryCount(cat.id);
  const canDelete = total === 0;

  return `
  <div class="cat-mgr-card" id="catcard-${cat.id}">
    <div class="cat-mgr-header">
      <span class="cat-mgr-dot" style="background:${cat.color}"></span>
      <span class="cat-mgr-name">${esc(cat.name)}</span>
      <span class="cat-mgr-badge ${cat.isExpense ? 'badge-expense' : 'badge-invest'}">
        ${cat.isExpense ? 'Despesa' : 'Não-despesa'}
      </span>
      <div class="cat-mgr-actions">
        <button class="btn btn-sm" onclick="openEditCatModal('${cat.id}')">Editar</button>
        <button class="btn btn-sm btn-danger"
          onclick="deleteCategory('${cat.id}')"
          ${!canDelete ? `disabled title="${total} lançamento(s) nesta categoria"` : ''}>
          Excluir
        </button>
      </div>
    </div>

    <div class="cat-mgr-subcats">
      <div class="cat-mgr-subcats-label">Subcategorias</div>
      <div id="subcats-${cat.id}">
        ${cat.subcats.map((s, i) => renderSubcatRow(cat.id, s, i)).join('')}
      </div>
      <div class="cat-mgr-add-row">
        <input type="text" id="new-sub-${cat.id}" class="input input-sm"
               placeholder="Nova subcategoria"
               onkeydown="if(event.key==='Enter') addSubcat('${cat.id}')">
        <button class="btn btn-sm btn-primary" onclick="addSubcat('${cat.id}')">+ Adicionar</button>
      </div>
    </div>
  </div>`;
}

function renderSubcatRow(catId, name, idx) {
  const count    = entryCount(catId, name);
  const canDelete = count === 0;
  return `
  <div class="cat-mgr-subcat-row" data-catid="${catId}" data-idx="${idx}">
    <span class="subcat-row-name">${esc(name)}</span>
    ${count > 0 ? `<span class="subcat-row-count">${count} lanç.</span>` : ''}
    <div class="subcat-row-actions">
      <button class="btn btn-sm" onclick="startEditSubcat('${catId}',${idx})">Renomear</button>
      <button class="btn btn-sm btn-danger"
        onclick="deleteSubcat('${catId}',${idx})"
        ${!canDelete ? `disabled title="${count} lançamento(s)"` : ''}>×</button>
    </div>
  </div>`;
}

function reRenderSubcats(catId) {
  const cat = getCategories().find(c => c.id === catId);
  if (!cat) return;
  document.getElementById(`subcats-${catId}`).innerHTML =
    cat.subcats.map((s, i) => renderSubcatRow(catId, s, i)).join('');
}

/* ── Modal categoria ── */
window.openAddCatModal = () => {
  editingCatId = null;
  document.getElementById('modal-cat-title').textContent = 'Nova Categoria';
  document.getElementById('cat-form-name').value    = '';
  document.getElementById('cat-form-color').value   = '#534AB7';
  document.getElementById('cat-form-expense').checked = true;
  document.getElementById('cat-color-hex').textContent   = '#534AB7';
  document.getElementById('cat-color-swatch').style.background = '#534AB7';
  document.getElementById('cat-form-msg').textContent = '';
  document.getElementById('modal-cat').classList.add('open');
  document.getElementById('cat-form-name').focus();
};

window.openEditCatModal = (id) => {
  const cat = getCategories().find(c => c.id === id);
  if (!cat) return;
  editingCatId = id;
  document.getElementById('modal-cat-title').textContent  = 'Editar Categoria';
  document.getElementById('cat-form-name').value          = cat.name;
  document.getElementById('cat-form-color').value         = cat.color;
  document.getElementById('cat-form-expense').checked     = cat.isExpense;
  document.getElementById('cat-color-hex').textContent        = cat.color;
  document.getElementById('cat-color-swatch').style.background = cat.color;
  document.getElementById('cat-form-msg').textContent     = '';
  document.getElementById('modal-cat').classList.add('open');
  document.getElementById('cat-form-name').focus();
};

window.closeCatModal = () => {
  document.getElementById('modal-cat').classList.remove('open');
};

window.previewCatColor = () => {
  const hex = document.getElementById('cat-form-color').value;
  document.getElementById('cat-color-hex').textContent        = hex;
  document.getElementById('cat-color-swatch').style.background = hex;
};

window.saveCatForm = () => {
  const name      = document.getElementById('cat-form-name').value.trim();
  const color     = document.getElementById('cat-form-color').value;
  const isExpense = document.getElementById('cat-form-expense').checked;
  const msg       = document.getElementById('cat-form-msg');

  if (!name) { msg.textContent = 'Informe um nome para a categoria.'; return; }

  const cats = getCategories().slice();

  if (editingCatId) {
    const idx = cats.findIndex(c => c.id === editingCatId);
    if (idx !== -1) {
      cats[idx] = { ...cats[idx], name, color, bg: computeBg(color), isExpense };
    }
  } else {
    const id = 'cat_' + Date.now();
    cats.push({ id, name, color, bg: computeBg(color), isExpense, subcats: [] });
  }

  setCategories(cats);
  window.closeCatModal();
  renderAll();
};

window.deleteCategory = (id) => {
  const count = entryCount(id);
  if (count > 0) { alert(`Esta categoria possui ${count} lançamento(s) e não pode ser excluída.`); return; }
  if (!confirm('Excluir esta categoria?')) return;
  setCategories(getCategories().filter(c => c.id !== id));
  renderAll();
};

/* ── Subcategorias ── */
window.addSubcat = (catId) => {
  const input = document.getElementById(`new-sub-${catId}`);
  const name  = input.value.trim();
  if (!name) return;

  const cats = getCategories().map(c =>
    c.id === catId ? { ...c, subcats: [...c.subcats, name] } : c
  );
  setCategories(cats);
  input.value = '';
  reRenderSubcats(catId);
};

window.startEditSubcat = (catId, idx) => {
  const cat  = getCategories().find(c => c.id === catId);
  const name = cat?.subcats[idx];
  if (name === undefined) return;

  const row = document.querySelector(
    `.cat-mgr-subcat-row[data-catid="${catId}"][data-idx="${idx}"]`
  );
  if (!row) return;

  row.innerHTML = `
    <input type="text" id="edit-sub-${catId}-${idx}" value="${esc(name)}"
           class="input input-sm" style="flex:1"
           onkeydown="if(event.key==='Enter') saveSubcatRename('${catId}',${idx},'${escJs(name)}');
                      if(event.key==='Escape') reRenderSubcatsWindow('${catId}')">
    <div class="subcat-row-actions">
      <button class="btn btn-sm btn-primary"
              onclick="saveSubcatRename('${catId}',${idx},'${escJs(name)}')">✓</button>
      <button class="btn btn-sm"
              onclick="reRenderSubcatsWindow('${catId}')">✕</button>
    </div>`;

  document.getElementById(`edit-sub-${catId}-${idx}`).focus();
};

window.reRenderSubcatsWindow = (catId) => reRenderSubcats(catId);

window.saveSubcatRename = (catId, idx, oldName) => {
  const newName = document.getElementById(`edit-sub-${catId}-${idx}`)?.value.trim();
  if (!newName) return;
  if (newName === oldName) { reRenderSubcats(catId); return; }

  renameSubcat(catId, oldName, newName);
  reRenderSubcats(catId);
};

window.deleteSubcat = (catId, idx) => {
  const cat  = getCategories().find(c => c.id === catId);
  const name = cat?.subcats[idx];
  if (!name) return;

  const count = entryCount(catId, name);
  if (count > 0) { alert(`Esta subcategoria possui ${count} lançamento(s) e não pode ser excluída.`); return; }
  if (!confirm(`Excluir a subcategoria "${name}"?`)) return;

  const cats = getCategories().map(c =>
    c.id === catId ? { ...c, subcats: c.subcats.filter((_, i) => i !== idx) } : c
  );
  setCategories(cats);
  reRenderSubcats(catId);
};

/* Fechar modal clicando no backdrop */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modal-cat').addEventListener('click', e => {
    if (e.target === document.getElementById('modal-cat')) window.closeCatModal();
  });
});
