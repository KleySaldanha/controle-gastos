/**
 * finance.js — Cálculos financeiros
 * =========================================================
 * Funções puras que derivam valores do estado.
 * Nenhuma função aqui acessa ou modifica o DOM.
 *
 * Depende de: config.js (CATEGORIES), state.js (getEntries, getSalary)
 * =========================================================
 */

'use strict';

/* ============================================================
   TOTALIZADORES POR CATEGORIA
   ============================================================ */

/**
 * Soma os valores de uma categoria num mês/ano.
 * @param {string} catId
 * @param {number} year
 * @param {number} month — use -1 para todos os meses
 * @returns {number}
 */
function catTotal(catId, year, month) {
  return getEntries(year, month)
    .filter(e => e.catId === catId)
    .reduce((acc, e) => acc + e.value, 0);
}

/**
 * Soma apenas as categorias marcadas com isExpense: true.
 * Investimentos e Reservas (isExpense: false) são excluídos.
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
function totalGastos(year, month) {
  return CATEGORIES
    .filter(cat => cat.isExpense)
    .reduce((acc, cat) => acc + catTotal(cat.id, year, month), 0);
}

/**
 * Soma todas as categorias independente de isExpense.
 * Representa o total alocado: gastos + investimentos + reservas.
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
function totalAlocado(year, month) {
  return CATEGORIES.reduce((acc, cat) => acc + catTotal(cat.id, year, month), 0);
}

/* ============================================================
   LÍQUIDO
   ============================================================ */

/**
 * Calcula o líquido do mês: salário − total de gastos (isExpense).
 * Positivo = sobra de caixa; Negativo = déficit.
 * @param {number} year
 * @param {number} month
 * @returns {number}
 */
function getLiquid(year, month) {
  return getSalary(year, month) - totalGastos(year, month);
}

/* ============================================================
   EVOLUÇÃO DE INVESTIMENTOS
   ============================================================ */

/**
 * Calcula o acumulado mensal de investimentos ao longo do ano.
 * @param {number} year
 * @returns {number[]} array de 12 posições com o acumulado até cada mês
 */
function getInvestAccum(year) {
  const monthly = MONTHS.map((_, m) => catTotal('invest', year, m));
  return monthly.map((_, i) => monthly.slice(0, i + 1).reduce((a, b) => a + b, 0));
}

/**
 * Calcula o percentual de crescimento mês a mês do acumulado.
 * @param {number[]} accum — array retornado por getInvestAccum
 * @returns {(number|null)[]} null quando não há base de comparação
 */
function getInvestGrowthPct(accum) {
  return accum.map((v, i) => {
    if (i === 0 || accum[i - 1] === 0) return null;
    return +((v - accum[i - 1]) / accum[i - 1] * 100).toFixed(2);
  });
}

/* ============================================================
   UTILITÁRIOS MATEMÁTICOS
   ============================================================ */

/**
 * Calcula percentual, evitando divisão por zero.
 * @param {number} value
 * @param {number} total
 * @returns {number} 0 se total for 0
 */
function pct(value, total) {
  return total ? (value / total) * 100 : 0;
}

/* ============================================================
   FORMATAÇÃO
   ============================================================ */

/**
 * Formata um número como moeda brasileira (R$ 1.234,56).
 * Sempre usa valor absoluto — o sinal negativo deve ser
 * tratado pela camada de renderização.
 * @param {number} v
 * @returns {string}
 */
function fmt(v) {
  return 'R$ ' + Math.abs(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
