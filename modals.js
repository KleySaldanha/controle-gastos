/**
 * modals.js — Gerenciamento de modais
 * =========================================================
 * Controla os três modais da aplicação:
 *   1. modal-entry   — adicionar / editar lançamento
 *   2. modal-salary  — definir salário mensal ou anual
 *   3. modal-subcat  — listar/editar lançamentos de uma subcat
 *
 * Depende de: config.js, state.js, finance.js, render.js
 * =========================================================
 */

'use strict';

/* ── ID do lançamento em edição; null = criação de novo ── */
let editingEntryId = null;

/**
 * Contexto do modal de subcategoria.
 * Armazena qual categoria/subcat está sendo gerenciada.
 * @type {{ catId: string|null, subcat: string|null }}
 */
let subcatContext = { catId: null, subcat: null };

/* ============================================================
   UTILITÁRIOS DE MODAL
   ============================================================ */

/**
 * Abre um modal pelo seu id.
 * @param {string} id — id do elemento .modal-overlay
 */
function openModal(id) {
  document.getElementById(id).classList.add('open');
}

/**
 * Fecha um modal pelo seu id.
 * @param {string} id
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

/**
 * Exibe uma mensagem toast temporária no canto da tela.
 * @param {string} msg — texto a exibir
 * @param {number} [duration=2200] — duração em ms
 */
function showToast(msg, duration = 2200) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

/* ============================================================
   INICIALIZAÇÃO DOS MODAIS
   Registra listeners globais (fechar ao clicar fora, etc.)
   ============================================================ */

/**
 * Configura os listeners de todos os modais.
 * Deve ser chamado uma vez na inicialização.
 */
function initModals() {
  /* Fecha modal ao clicar no overlay (fora do painel) */
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target !== overlay) return;
      overlay.classList.remove('open');
      /* Limpa o contexto ao fechar o modal de subcategoria */
      if (overlay.id === 'modal-subcat') clearSubcatContext();
    });
  });
}

/* ============================================================
   MODAL 1: LANÇAMENTO (adicionar / editar)
   ============================================================ */

/**
 * Preenche o select de categorias com as opções de CATEGORIES.
 */
function populateCatSelect() {
  document.getElementById('entry-cat').innerHTML =
    CATEGORIES.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
}

/**
 * Atualiza as subcategorias conforme a categoria selecionada.
 * Chamada pelo onchange do select de categoria.
 */
function populateSubcats() {
  const catId = document.getElementById('entry-cat').value;
  const cat   = CATEGORIES.find(c => c.id === catId);
  document.getElementById('entry-subcat').innerHTML =
    cat.subcats.map(s => `<option value="${s}">${s}</option>`).join('');
}

/**
 * Abre o modal de novo lançamento.
 * @param {string|null} [catId] — pré-seleciona uma categoria
 */
function openAddModal(catId = null) {
  editingEntryId = null;
  document.getElementById('modal-entry-title').textContent = 'Novo lançamento';
  document.getElementById('btn-delete-entry').classList.add('hidden');

  populateCatSelect();
  if (catId) document.getElementById('entry-cat').value = catId;
  populateSubcats();

  document.getElementById('entry-desc').value  = '';
  document.getElementById('entry-value').value = '';
  /* Se "todos os meses" estiver ativo, usa o mês atual como padrão */
  document.getElementById('entry-month').value =
    state.month === -1 ? new Date().getMonth() : state.month;

  openModal('modal-entry');
}

/**
 * Salva o lançamento (novo ou editado) a partir dos valores do formulário.
 * Chamado pelo botão "Salvar" do modal.
 */
function saveEntry() {
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
    /* Edição: atualiza o lançamento existente */
    updateEntry(editingEntryId, { catId, subcat, desc, value, month });
  } else {
    /* Criação: adiciona ao estado */
    addEntry({ year: state.year, month, catId, subcat, desc, value });
  }

  closeModal('modal-entry');
  render();

  /* Se veio da lista de subcategoria, reabre com dados atualizados */
  if (subcatContext.catId) {
    renderSubcatModal();
    openModal('modal-subcat');
  }

  showToast('Lançamento salvo!');
}

/**
 * Remove o lançamento em edição.
 * Chamado pelo botão "Excluir" do modal.
 */
function deleteEntry() {
  if (editingEntryId === null) return;
  removeEntry(editingEntryId);
  closeModal('modal-entry');
  render();

  /* Se veio da lista de subcategoria, reabre com dados atualizados */
  if (subcatContext.catId) {
    renderSubcatModal();
    openModal('modal-subcat');
  }

  showToast('Lançamento excluído.');
}

/* ============================================================
   MODAL 2: SALÁRIO
   ============================================================ */

/**
 * Abre o modal de salário pré-preenchido com o valor atual.
 */
function openSalaryModal() {
  document.getElementById('salary-value').value =
    getSalary(state.year, state.month) || '';
  openModal('modal-salary');
}

/**
 * Salva o salário definido no modal.
 * Pode aplicar ao mês atual ou a todos os meses do ano.
 */
function saveSalary() {
  const value = parseFloat(document.getElementById('salary-value').value);
  const scope = document.getElementById('salary-scope').value; // 'month' | 'year'

  if (!value || value < 0) {
    showToast('Informe um valor válido.');
    return;
  }

  /* scope 'year' → month -1 indica "aplicar a todos os meses" em setSalary */
  const targetMonth = scope === 'year' ? -1 : state.month;
  setSalary(state.year, targetMonth, value);

  closeModal('modal-salary');
  render();
  showToast('Salário atualizado!');
}

/* ============================================================
   MODAL 3: LISTA DE LANÇAMENTOS DA SUBCATEGORIA
   ============================================================ */

/**
 * Limpa o contexto de subcategoria ativo.
 * Chamado ao fechar o modal manualmente.
 */
function clearSubcatContext() {
  subcatContext = { catId: null, subcat: null };
}

/**
 * Abre o modal de gerenciamento de lançamentos de uma subcategoria.
 * @param {string} catId
 * @param {string} subcat
 */
function openEditSubcat(catId, subcat) {
  subcatContext = { catId, subcat };
  renderSubcatModal();
  openModal('modal-subcat');
}

/**
 * Renderiza (ou re-renderiza) a lista de lançamentos no modal de subcategoria.
 * Chamado ao abrir e após cada operação (editar/excluir/adicionar).
 */
function renderSubcatModal() {
  const { catId, subcat } = subcatContext;
  const { year, month }   = state;
  const cat     = CATEGORIES.find(c => c.id === catId);
  const entries = getEntries(year, month).filter(
    e => e.catId === catId && e.subcat === subcat
  );
  const total   = entries.reduce((a, e) => a + e.value, 0);

  /* Cabeçalho do modal */
  document.getElementById('subcat-modal-title').textContent = subcat;
  document.getElementById('subcat-modal-total').textContent =
    `${month === -1 ? 'Ano ' + year : MONTHS[month] + ' ' + year} · Total: ${fmt(total)}`;

  /* Lista de lançamentos */
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

/**
 * Abre o formulário de edição para um lançamento específico da lista.
 * Fecha o modal de subcategoria para evitar sobreposição de modais.
 * @param {string} entryId
 */
function editEntryFromSubcat(entryId) {
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

  /* Fecha lista antes de abrir edição — evita sobreposição */
  closeModal('modal-subcat');
  openModal('modal-entry');
}

/**
 * Exclui um lançamento diretamente da lista sem abrir o formulário.
 * @param {string} entryId
 */
function deleteEntryFromSubcat(entryId) {
  removeEntry(Number(entryId));
  renderSubcatModal();
  render();
  showToast('Lançamento excluído.');
}

/**
 * Abre o formulário de novo lançamento pré-selecionando
 * a categoria e subcategoria do contexto atual.
 */
function addFromSubcatModal() {
  closeModal('modal-subcat');
  openAddModal(subcatContext.catId);
  document.getElementById('entry-subcat').value = subcatContext.subcat;
}
