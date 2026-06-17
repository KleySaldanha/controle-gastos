import { MONTHS, STORAGE_KEY } from './config.js';

/** @typedef {Object} Entry
 * @property {number} id
 * @property {number} year
 * @property {number} month
 * @property {string} catId
 * @property {string} subcat
 * @property {string} desc
 * @property {number} value
 */

export let state = {
  year:    new Date().getFullYear(),
  month:   new Date().getMonth(),
  salary:  {},
  entries: [],
};

export function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('[state] Não foi possível salvar:', e);
  }
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...state, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('[state] Não foi possível carregar:', e);
  }
}

export function getEntries(year, month) {
  if (month === -1) return state.entries.filter(e => e.year === year);
  return state.entries.filter(e => e.year === year && e.month === month);
}

export function getSalary(year, month) {
  if (month === -1) {
    if (!state.salary[year]) return 0;
    return Object.values(state.salary[year]).reduce((a, b) => a + b, 0);
  }
  return (state.salary[year] && state.salary[year][month]) || 0;
}

export function setYear(year) {
  state.year = year;
  saveState();
}

export function setMonth(month) {
  state.month = month;
  saveState();
}

export function setSalary(year, month, value) {
  if (!state.salary[year]) state.salary[year] = {};
  if (month === -1) {
    MONTHS.forEach((_, m) => { state.salary[year][m] = value; });
  } else {
    state.salary[year][month] = value;
  }
  saveState();
}

export function addEntry(data) {
  const entry = { id: Date.now() + Math.random(), ...data };
  state.entries.push(entry);
  saveState();
  return entry;
}

export function updateEntry(id, updates) {
  const idx = state.entries.findIndex(e => e.id === id);
  if (idx === -1) return false;
  state.entries[idx] = { ...state.entries[idx], ...updates };
  saveState();
  return true;
}

export function removeEntry(id) {
  state.entries = state.entries.filter(e => e.id !== id);
  saveState();
}
