import { CATEGORIES, MONTHS } from './config.js';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase.js';

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
  year:       new Date().getFullYear(),
  month:      -1,
  salary:     {},
  entries:    [],
  categories: null,   // null = usar padrão de config.js
};

/** Retorna as categorias ativas (customizadas ou padrão) */
export function getCategories() {
  return state.categories ?? CATEGORIES;
}

/** Substitui toda a lista de categorias e persiste */
export function setCategories(cats) {
  state.categories = cats;
  saveState();
}

/** Renomeia uma subcategoria e atualiza todos os lançamentos */
export function renameSubcat(catId, oldName, newName) {
  state.entries = state.entries.map(e =>
    e.catId === catId && e.subcat === oldName ? { ...e, subcat: newName } : e
  );
  state.categories = getCategories().map(c =>
    c.id === catId
      ? { ...c, subcats: c.subcats.map(s => (s === oldName ? newName : s)) }
      : c
  );
  saveState();
}

export async function loadState() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  try {
    const snap = await getDoc(doc(db, 'data', uid));
    if (snap.exists()) {
      const { entries, salary, categories } = snap.data();
      state = {
        ...state,
        entries:    entries    || [],
        salary:     salary     || {},
        categories: categories || null,
      };
    }
  } catch (e) {
    console.warn('[state] Erro ao carregar:', e);
  }
}

export function saveState() {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  const payload = { entries: state.entries, salary: state.salary };
  if (state.categories) payload.categories = state.categories;
  setDoc(doc(db, 'data', uid), payload)
    .catch(e => console.warn('[state] Erro ao salvar:', e));
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

export function setYear(year)   { state.year  = year; }
export function setMonth(month) { state.month = month; }

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
