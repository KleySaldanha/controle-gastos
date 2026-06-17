/**
 * app.js — Ponto de entrada da aplicação
 * =========================================================
 * Responsabilidades:
 *   - Inicializar a aplicação (sequência de boot)
 *   - Montar os seletores de mês/ano no cabeçalho
 *   - Controlar a navegação entre abas
 *
 * Este arquivo é o último a ser carregado, pois depende de
 * todos os demais módulos (config, state, finance, render,
 * charts, modals).
 *
 * Ordem de carregamento no HTML:
 *   config.js → state.js → finance.js → render.js →
 *   charts.js → modals.js → app.js
 * =========================================================
 */

'use strict';

/* ============================================================
   SELETORES DE MÊS / ANO
   ============================================================ */

/**
 * Monta os seletores de mês e ano no cabeçalho e no modal
 * de lançamento. Deve ser chamado uma única vez na inicialização.
 */
function buildSelectors() {
  const selMonth  = document.getElementById('sel-month');
  const selYear   = document.getElementById('sel-year');
  const entryMonth = document.getElementById('entry-month');

  /* Seletor de meses — valor -1 = "Todos os meses" */
  selMonth.innerHTML =
    '<option value="-1">Todos os meses</option>' +
    MONTHS.map((m, i) => `<option value="${i}">${m}</option>`).join('');
  selMonth.value    = state.month;
  selMonth.onchange = () => {
    setMonth(+selMonth.value);
    render();
  };

  /* Seletor de anos: ano atual + 2 anteriores e 1 futuro */
  const cur = new Date().getFullYear();
  for (let y = cur - 2; y <= cur + 1; y++) {
    selYear.innerHTML += `<option value="${y}">${y}</option>`;
  }
  selYear.value    = state.year;
  selYear.onchange = () => {
    setYear(+selYear.value);
    render();
  };

  /* Meses disponíveis no formulário de lançamento (sem a opção "Todos") */
  entryMonth.innerHTML = MONTHS.map((m, i) =>
    `<option value="${i}">${m}</option>`).join('');
  entryMonth.value = state.month === -1 ? new Date().getMonth() : state.month;
}

/* ============================================================
   NAVEGAÇÃO POR ABAS
   ============================================================ */

/**
 * Alterna a aba visível e renderiza o conteúdo específico da aba.
 * O conteúdo pesado (gráficos, tabela) é gerado apenas quando
 * a aba é aberta, economizando processamento.
 *
 * @param {'dashboard'|'anual'|'graficos'} tab — aba de destino
 * @param {HTMLButtonElement} btn — botão clicado (para marcar como active)
 */
function switchTab(tab, btn) {
  /* Esconde todas as abas */
  ['dashboard', 'anual', 'graficos'].forEach(t => {
    document.getElementById('tab-' + t).classList.add('hidden');
  });

  /* Remove destaque de todos os botões */
  document.querySelectorAll('.nav-tab').forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
  });

  /* Mostra a aba selecionada e destaca o botão */
  document.getElementById('tab-' + tab).classList.remove('hidden');
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');

  /* Renderiza conteúdo pesado apenas quando necessário */
  if (tab === 'graficos') renderCharts();
  if (tab === 'anual')    renderAnnual();
}

/* ============================================================
   INICIALIZAÇÃO — SEQUÊNCIA DE BOOT
   ============================================================ */

/**
 * Ponto de entrada da aplicação.
 * Executado automaticamente quando o DOM estiver pronto.
 *
 * Sequência:
 *   1. loadState()        — recupera dados do localStorage
 *   2. buildSelectors()   — monta seletores de mês/ano
 *   3. initModals()       — registra listeners de modais
 *   4. populateCatSelect()— carrega categorias nos selects dos modais
 *   5. populateSubcats()  — carrega subcategorias do select inicial
 *   6. render()           — renderiza o dashboard com os dados carregados
 */
function init() {
  loadState();
  buildSelectors();
  initModals();
  populateCatSelect();
  populateSubcats();
  render();
}

/* Aguarda o DOM estar completamente carregado antes de iniciar */
document.addEventListener('DOMContentLoaded', init);
