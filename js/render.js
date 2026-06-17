import { CATEGORIES, MONTHS } from './config.js';
import { state, getEntries, getSalary } from './state.js';
import { catTotal, totalGastos, getLiquid, pct, fmt } from './finance.js';

export function render() {
  const { year, month } = state;
  const sal    = getSalary(year, month);
  const total  = totalGastos(year, month);
  const liquid = getLiquid(year, month);
  const isAllMonths = month === -1;

  renderSalaryBar(sal, liquid, isAllMonths, year, month);
  renderMetrics(sal, total, liquid, isAllMonths, year, month);
  renderCategories(year, month, sal);
}

function renderSalaryBar(sal, liquid, isAllMonths, year, month) {
  document.getElementById('salary-label').textContent =
    isAllMonths ? `Salário anual: ${fmt(sal)}` : `Salário líquido: ${fmt(sal)}`;

  const liqEl = document.getElementById('liquid-label');
  liqEl.textContent  = `Líquido: ${liquid < 0 ? '-' : ''}${fmt(liquid)}`;
  liqEl.style.color  = liquid >= 0 ? 'var(--success)' : 'var(--danger)';

  CATEGORIES.forEach(cat => {
    const w = sal ? Math.min(pct(catTotal(cat.id, year, month), sal), 100) : 0;
    document.getElementById('bar-' + cat.id).style.width = w.toFixed(1) + '%';
  });
}

function renderMetrics(sal, total, liquid, isAllMonths, year, month) {
  const totalInvest  = catTotal('invest',   year, month);
  const totalReserve = catTotal('reserve',  year, month);

  const metrics = [
    { label: 'Salário líquido',    value: sal,    cls: '',  dot: '#888' },
    { label: 'Total gastos',       value: total,  cls: '',  dot: '#D85A30', tip: 'Apenas Fixos + Variáveis' },
    { label: 'Líquido',            value: liquid, cls: liquid >= 0 ? 'positive' : 'negative', dot: liquid >= 0 ? '#639922' : '#E24B4A' },
    { label: 'Investimentos',      value: totalInvest,  cls: '', dot: 'var(--invest)',   tip: 'Não entra nos gastos' },
    { label: 'Gastos fixos',       value: catTotal('fixed',    year, month), cls: '', dot: 'var(--fixed)' },
    { label: 'Gastos variáveis',   value: catTotal('variable', year, month), cls: '', dot: 'var(--variable)' },
    { label: 'Reservas/Objetivos', value: totalReserve, cls: '', dot: 'var(--reserve)',  tip: 'Não entra nos gastos' },
    { label: isAllMonths ? '% gasto / salário anual' : '% gasto / salário', value: pct(total, sal), cls: '', dot: '#888', isPct: true,
      tip: isAllMonths ? 'Fixos + Variáveis ÷ Salário anual' : 'Fixos + Variáveis ÷ Salário' },
  ];

  document.getElementById('metrics-grid').innerHTML = metrics.map(m => `
    <div class="metric-card" ${m.tip ? `title="${m.tip}"` : ''}>
      <div class="metric-label">
        <span class="metric-dot" style="background:${m.dot}"></span>
        ${m.label}${m.tip ? ' ℹ️' : ''}
      </div>
      <div class="metric-value ${m.cls}">
        ${m.isPct
          ? m.value.toFixed(1) + '%'
          : (m.value < 0 ? '-' : '') + fmt(m.value)}
      </div>
    </div>`).join('');
}

export function renderCategories(year, month, sal) {
  document.getElementById('categories-grid').innerHTML =
    CATEGORIES.map(cat => renderCategoryCard(cat, year, month, sal)).join('');
}

function renderCategoryCard(cat, year, month, sal) {
  const catTot = catTotal(cat.id, year, month);
  const pctSal = pct(catTot, sal);
  const entries = getEntries(year, month).filter(e => e.catId === cat.id);

  const bySub = {};
  cat.subcats.forEach(s => bySub[s] = 0);
  entries.forEach(e => { bySub[e.subcat] = (bySub[e.subcat] || 0) + e.value; });

  const rows    = cat.subcats.map(s => ({ name: s, value: bySub[s] || 0 }));
  const hasData = rows.some(r => r.value > 0);
  const shown   = hasData ? rows.filter(r => r.value > 0) : rows.slice(0, 4);

  return `
  <div class="cat-card">
    <div class="cat-header">
      <div class="cat-title">
        <span class="cat-badge" style="background:${cat.bg};color:${cat.color}">
          ${pctSal.toFixed(1)}%
        </span>
        ${cat.name}
      </div>
      <div class="cat-total" style="color:${cat.color}">${fmt(catTot)}</div>
    </div>
    <div class="cat-progress">
      <div class="cat-progress-fill"
           style="background:${cat.color}; width:${Math.min(pctSal, 100).toFixed(1)}%">
      </div>
    </div>
    <div class="cat-items">
      ${shown.map(row => `
        <div class="cat-item" onclick="openEditSubcat('${cat.id}','${row.name}')">
          <span class="cat-item-name">${row.name}</span>
          <div class="cat-item-bar">
            <div class="cat-item-bar-fill"
                 style="background:${cat.color}; width:${pct(row.value, catTot).toFixed(1)}%">
            </div>
          </div>
          <span class="cat-item-value"
                style="color:${row.value > 0 ? cat.color : 'var(--text-3)'}">
            ${row.value > 0 ? fmt(row.value) : '—'}
          </span>
        </div>`).join('')}
    </div>
    <button class="cat-add" onclick="openAddModal('${cat.id}')">
      + adicionar lançamento
    </button>
  </div>`;
}

export function renderAnnual() {
  const y = state.year;

  document.getElementById('annual-thead').innerHTML = `<tr>
    <th style="text-align:left">Categoria</th>
    ${MONTHS.map(m => `<th>${m.slice(0, 3)}</th>`).join('')}
    <th>Total</th>
  </tr>`;

  let rows = '';

  const salRow   = MONTHS.map((_, m) => getSalary(y, m));
  const salTotal = salRow.reduce((a, b) => a + b, 0);
  rows += `<tr class="cat-row">
    <td>Salário líquido</td>
    ${salRow.map(v => `<td>${fmt(v)}</td>`).join('')}
    <td>${fmt(salTotal)}</td>
  </tr>`;

  CATEGORIES.forEach(cat => {
    const catMonths = MONTHS.map((_, m) => catTotal(cat.id, y, m));
    const catAnual  = catMonths.reduce((a, b) => a + b, 0);

    rows += `<tr class="cat-row" style="border-top:1.5px solid var(--border)">
      <td style="color:${cat.color}">${cat.name}</td>
      ${catMonths.map(v => `<td style="color:${cat.color}">${v > 0 ? fmt(v) : '—'}</td>`).join('')}
      <td style="color:${cat.color}">${fmt(catAnual)}</td>
    </tr>`;

    cat.subcats.forEach(sub => {
      const subMonths = MONTHS.map((_, m) =>
        getEntries(y, m)
          .filter(e => e.catId === cat.id && e.subcat === sub)
          .reduce((a, e) => a + e.value, 0)
      );
      const subTotal = subMonths.reduce((a, b) => a + b, 0);
      if (subTotal === 0) return;

      rows += `<tr>
        <td style="padding-left:20px; color:var(--text-2)">${sub}</td>
        ${subMonths.map(v => `<td>${v > 0 ? fmt(v) : '—'}</td>`).join('')}
        <td>${fmt(subTotal)}</td>
      </tr>`;
    });
  });

  const totMonths = MONTHS.map((_, m) => totalGastos(y, m));
  const totAnual  = totMonths.reduce((a, b) => a + b, 0);
  rows += `<tr class="cat-row" style="border-top:2px solid var(--border)">
    <td>Total gastos (Fixos + Variáveis)</td>
    ${totMonths.map(v => `<td>${fmt(v)}</td>`).join('')}
    <td>${fmt(totAnual)}</td>
  </tr>`;

  const liqMonths = MONTHS.map((_, m) => getLiquid(y, m));
  const liqAnual  = liqMonths.reduce((a, b) => a + b, 0);
  rows += `<tr>
    <td><strong>Líquido</strong></td>
    ${liqMonths.map(v =>
      `<td class="${v >= 0 ? 'positive' : 'negative'}">${v < 0 ? '-' : ''}${fmt(v)}</td>`
    ).join('')}
    <td class="${liqAnual >= 0 ? 'positive' : 'negative'}">
      ${liqAnual < 0 ? '-' : ''}${fmt(liqAnual)}
    </td>
  </tr>`;

  document.getElementById('annual-tbody').innerHTML = rows;
}
