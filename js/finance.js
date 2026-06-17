import { CATEGORIES, MONTHS } from './config.js';
import { getEntries, getSalary } from './state.js';

export function catTotal(catId, year, month) {
  return getEntries(year, month)
    .filter(e => e.catId === catId)
    .reduce((acc, e) => acc + e.value, 0);
}

export function totalGastos(year, month) {
  return CATEGORIES
    .filter(cat => cat.isExpense)
    .reduce((acc, cat) => acc + catTotal(cat.id, year, month), 0);
}

export function totalAlocado(year, month) {
  return CATEGORIES.reduce((acc, cat) => acc + catTotal(cat.id, year, month), 0);
}

export function getLiquid(year, month) {
  return getSalary(year, month) - totalGastos(year, month);
}

export function getInvestAccum(year) {
  const monthly = MONTHS.map((_, m) => catTotal('invest', year, m));
  return monthly.map((_, i) => monthly.slice(0, i + 1).reduce((a, b) => a + b, 0));
}

export function getInvestGrowthPct(accum) {
  return accum.map((v, i) => {
    if (i === 0 || accum[i - 1] === 0) return null;
    return +((v - accum[i - 1]) / accum[i - 1] * 100).toFixed(2);
  });
}

export function pct(value, total) {
  return total ? (value / total) * 100 : 0;
}

export function fmt(v) {
  return 'R$ ' + Math.abs(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
