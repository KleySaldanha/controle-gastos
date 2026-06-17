/**
 * state.js — Gerenciamento de estado e persistência
 * =========================================================
 * Responsabilidade única: manter, ler e salvar o estado
 * global da aplicação no localStorage.
 *
 * Nenhuma função aqui toca o DOM — apenas dados.
 *
 * Estrutura do estado:
 * {
 *   year    : number            — ano selecionado na UI
 *   month   : number (0-11|-1) — mês selecionado; -1 = todos
 *   salary  : { [year]: { [month]: number } }
 *   entries : Entry[]
 * }
 *
 * @typedef {Object} Entry
 * @property {number} id      — ID único (timestamp + random)
 * @property {number} year    — ano do lançamento
 * @property {number} month   — mês do lançamento (0-11)
 * @property {string} catId   — id da categoria (de CATEGORIES)
 * @property {string} subcat  — nome da subcategoria
 * @property {string} desc    — descrição livre (pode ser vazia)
 * @property {number} value   — valor em reais
 * =========================================================
 */

'use strict';

/* ── Estado inicial ── */
let state = {
  year:    new Date().getFullYear(),
  month:   new Date().getMonth(),   // 0-11; -1 = todos os meses
  salary:  {},
  entries: [],
};

/* ============================================================
   PERSISTÊNCIA
   ============================================================ */

/**
 * Serializa o estado atual e grava no localStorage.
 * Falhas silenciosas (ex: modo privado sem espaço) são ignoradas.
 */
function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[state] Não foi possível salvar:', e);
  }
}

/**
 * Lê o estado persistido e mescla com o estado inicial.
 * Mescla (spread) garante que campos novos adicionados no código
 * não sejam perdidos ao carregar dados antigos.
 */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('[state] Não foi possível carregar:', e);
  }
}

/* ============================================================
   LEITURAS DO ESTADO
   Funções puras — não modificam o estado.
   ============================================================ */

/**
 * Retorna lançamentos filtrados por ano e mês.
 * @param {number} year
 * @param {number} month — use -1 para todos os meses do ano
 * @returns {Entry[]}
 */
function getEntries(year, month) {
  if (month === -1) return state.entries.filter(e => e.year === year);
  return state.entries.filter(e => e.year === year && e.month === month);
}

/**
 * Retorna o salário de um mês/ano.
 * @param {number} year
 * @param {number} month — use -1 para somar todos os meses do ano
 * @returns {number}
 */
function getSalary(year, month) {
  if (month === -1) {
    if (!state.salary[year]) return 0;
    return Object.values(state.salary[year]).reduce((a, b) => a + b, 0);
  }
  return (state.salary[year] && state.salary[year][month]) || 0;
}

/* ============================================================
   ESCRITAS DO ESTADO
   Modificam o estado e chamam saveState() automaticamente.
   ============================================================ */

/**
 * Define o ano selecionado na UI.
 * @param {number} year
 */
function setYear(year) {
  state.year = year;
  saveState();
}

/**
 * Define o mês selecionado na UI.
 * @param {number} month — 0-11 ou -1 para "todos os meses"
 */
function setMonth(month) {
  state.month = month;
  saveState();
}

/**
 * Salva o salário para um ou todos os meses do ano.
 * @param {number} year
 * @param {number} month  — mês específico, ou -1 para aplicar a todos
 * @param {number} value  — valor em reais
 */
function setSalary(year, month, value) {
  if (!state.salary[year]) state.salary[year] = {};

  if (month === -1) {
    /* Aplica o mesmo valor a todos os 12 meses */
    MONTHS.forEach((_, m) => { state.salary[year][m] = value; });
  } else {
    state.salary[year][month] = value;
  }
  saveState();
}

/**
 * Adiciona um novo lançamento ao estado.
 * @param {Omit<Entry,'id'>} data — todos os campos exceto id
 * @returns {Entry} o lançamento criado (com id gerado)
 */
function addEntry(data) {
  const entry = { id: Date.now() + Math.random(), ...data };
  state.entries.push(entry);
  saveState();
  return entry;
}

/**
 * Atualiza um lançamento existente pelo id.
 * @param {number} id
 * @param {Partial<Entry>} updates — campos a sobrescrever
 * @returns {boolean} true se encontrou e atualizou
 */
function updateEntry(id, updates) {
  const idx = state.entries.findIndex(e => e.id === id);
  if (idx === -1) return false;
  state.entries[idx] = { ...state.entries[idx], ...updates };
  saveState();
  return true;
}

/**
 * Remove um lançamento pelo id.
 * @param {number} id
 */
function removeEntry(id) {
  state.entries = state.entries.filter(e => e.id !== id);
  saveState();
}
