/**
 * charts.js — Renderização dos gráficos (Chart.js)
 * =========================================================
 * Gerencia os 5 gráficos da aba "Gráficos":
 *   1. Pizza       — distribuição mensal por categoria
 *   2. Linha       — evolução anual por categoria
 *   3. Barras      — gastos vs salário (mensal)
 *   4. Barras      — líquido mensal (sobra / déficit)
 *   5. Linha dupla — evolução acumulada dos investimentos + %
 *
 * Padrão: cada gráfico é destruído antes de ser recriado,
 * evitando conflito de instâncias no mesmo <canvas>.
 *
 * Depende de: config.js, state.js, finance.js, Chart.js (CDN)
 * =========================================================
 */

'use strict';

/* ── Referências das instâncias Chart.js ── */
let chartPie    = null;
let chartLine   = null;
let chartBar    = null;
let chartLiquid = null;
let chartInvest = null;

/* ============================================================
   PONTO DE ENTRADA
   ============================================================ */

/**
 * Destrói todos os gráficos existentes e os recria com os
 * dados do mês/ano atualmente selecionado.
 * Chamado ao abrir a aba "Gráficos" ou após mudança de período.
 */
function renderCharts() {
  destroyAllCharts();

  const { year, month } = state;
  const sal = getSalary(year, month);

  renderPieChart(year, month, sal);
  renderLineChart(year);
  renderBarChart(year);
  renderLiquidChart(year);
  renderInvestChart(year);
}

/* ============================================================
   HELPERS INTERNOS
   ============================================================ */

/** Destrói todas as instâncias de gráfico para liberar canvas */
function destroyAllCharts() {
  [chartPie, chartLine, chartBar, chartLiquid, chartInvest].forEach(c => {
    if (c) c.destroy();
  });
}

/**
 * Opções comuns reutilizadas por todos os gráficos.
 * @returns {Object}
 */
function commonOptions() {
  return { responsive: true, maintainAspectRatio: false };
}

/**
 * Callback de tick para eixo Y em reais.
 * @param {number} v
 * @returns {string}
 */
function tickBRL(v) {
  return 'R$' + v.toLocaleString('pt-BR');
}

/* ============================================================
   GRÁFICO 1 — PIZZA: distribuição mensal por categoria
   ============================================================ */

/**
 * @param {number} year
 * @param {number} month
 * @param {number} sal — usado no tooltip para calcular %
 */
function renderPieChart(year, month, sal) {
  const pieData = CATEGORIES.map(c => catTotal(c.id, year, month));

  /* Legenda manual abaixo do título */
  document.getElementById('pie-legend').innerHTML = CATEGORIES.map((c, i) => `
    <span class="chart-legend-item">
      <span class="chart-legend-dot" style="background:${CHART_COLORS[i]}"></span>
      ${c.name.split('/')[0].trim()}: ${fmt(pieData[i])}
    </span>`).join('');

  chartPie = new Chart(document.getElementById('chart-pie'), {
    type: 'doughnut',
    data: {
      labels: CATEGORIES.map(c => c.name),
      datasets: [{
        data: pieData,
        backgroundColor: CHART_COLORS,
        borderWidth: 2,
        borderColor: '#fff',
      }],
    },
    options: {
      ...commonOptions(),
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            /* Exibe valor + percentual em relação ao salário */
            label: ctx => ` ${fmt(ctx.raw)} (${sal ? pct(ctx.raw, sal).toFixed(1) + '%' : '—'})`,
          },
        },
      },
    },
  });
}

/* ============================================================
   GRÁFICO 2 — LINHA: evolução anual por categoria
   ============================================================ */

/**
 * @param {number} year
 */
function renderLineChart(year) {
  document.getElementById('line-legend').innerHTML = CATEGORIES.map((c, i) => `
    <span class="chart-legend-item">
      <span class="chart-legend-dot" style="background:${CHART_COLORS[i]}"></span>
      ${c.name.split('/')[0].trim()}
    </span>`).join('');

  chartLine = new Chart(document.getElementById('chart-line'), {
    type: 'line',
    data: {
      labels: MONTHS.map(m => m.slice(0, 3)),
      datasets: CATEGORIES.map((cat, i) => ({
        label: cat.name,
        data: MONTHS.map((_, m) => catTotal(cat.id, year, m)),
        borderColor:     CHART_COLORS[i],
        backgroundColor: CHART_COLORS[i] + '22',
        pointRadius: 3,
        tension: 0.3,
        fill: false,
      })),
    },
    options: {
      ...commonOptions(),
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: tickBRL } },
        x: { ticks: { autoSkip: false } },
      },
    },
  });
}

/* ============================================================
   GRÁFICO 3 — BARRAS: gastos vs salário (mensal)
   ============================================================ */

/**
 * Compara salário, gastos (isExpense) e total alocado mês a mês.
 * @param {number} year
 */
function renderBarChart(year) {
  chartBar = new Chart(document.getElementById('chart-bar'), {
    type: 'bar',
    data: {
      labels: MONTHS.map(m => m.slice(0, 3)),
      datasets: [
        {
          label: 'Salário',
          data: MONTHS.map((_, m) => getSalary(year, m)),
          backgroundColor: '#1D9E7555',
          borderColor:     '#1D9E75',
          borderWidth: 1,
        },
        {
          /* Gastos = apenas categorias com isExpense: true */
          label: 'Gastos (Fixos + Variáveis)',
          data: MONTHS.map((_, m) => totalGastos(year, m)),
          backgroundColor: '#D85A3055',
          borderColor:     '#D85A30',
          borderWidth: 1,
        },
        {
          /* Alocado = gastos + investimentos + reservas */
          label: 'Total alocado',
          data: MONTHS.map((_, m) => totalAlocado(year, m)),
          backgroundColor: '#88888822',
          borderColor:     '#888888',
          borderWidth: 1,
          borderDash: [4, 3],
        },
      ],
    },
    options: {
      ...commonOptions(),
      plugins: { legend: { labels: { boxWidth: 12, font: { size: 11 } } } },
      scales: {
        y: { ticks: { callback: tickBRL } },
        x: { ticks: { autoSkip: false } },
      },
    },
  });
}

/* ============================================================
   GRÁFICO 4 — BARRAS: líquido mensal (sobra / déficit)
   ============================================================ */

/**
 * Barras verdes para sobra, vermelhas para déficit.
 * @param {number} year
 */
function renderLiquidChart(year) {
  const liqData = MONTHS.map((_, m) => getLiquid(year, m));

  chartLiquid = new Chart(document.getElementById('chart-liquid'), {
    type: 'bar',
    data: {
      labels: MONTHS.map(m => m.slice(0, 3)),
      datasets: [{
        label: 'Líquido',
        data: liqData,
        backgroundColor: liqData.map(v => v >= 0 ? '#63992255' : '#E24B4A55'),
        borderColor:     liqData.map(v => v >= 0 ? '#639922'   : '#E24B4A'),
        borderWidth: 1,
      }],
    },
    options: {
      ...commonOptions(),
      plugins: { legend: { display: false } },
      scales: {
        y: { ticks: { callback: v => (v < 0 ? '-' : '') + 'R$' + Math.abs(v).toLocaleString('pt-BR') } },
        x: { ticks: { autoSkip: false } },
      },
    },
  });
}

/* ============================================================
   GRÁFICO 5 — LINHA DUPLA: evolução acumulada dos investimentos
   Eixo esquerdo: valor acumulado em R$
   Eixo direito:  variação percentual mês a mês
   ============================================================ */

/**
 * @param {number} year
 */
function renderInvestChart(year) {
  const accum     = getInvestAccum(year);
  const growthPct = getInvestGrowthPct(accum);

  /* Cálculo de média de crescimento para a legenda */
  const totalAccum = accum[accum.length - 1];
  const validG     = growthPct.filter(v => v !== null);
  const avgGrowth  = validG.length
    ? (validG.reduce((a, b) => a + b, 0) / validG.length).toFixed(1)
    : '—';

  document.getElementById('invest-legend').innerHTML = `
    <span class="chart-legend-item">
      <span class="chart-legend-dot" style="background:#1D9E75"></span>
      Total acumulado: <strong style="color:var(--invest)">&nbsp;${fmt(totalAccum)}</strong>
    </span>
    <span class="chart-legend-item">
      <span class="chart-legend-dot" style="background:#185FA5"></span>
      Crescimento médio mensal: <strong style="color:var(--reserve)">&nbsp;${avgGrowth}%</strong>
    </span>`;

  chartInvest = new Chart(document.getElementById('chart-invest'), {
    type: 'line',
    data: {
      labels: MONTHS.map(m => m.slice(0, 3)),
      datasets: [
        {
          label: 'Acumulado (R$)',
          data: accum,
          borderColor:     '#1D9E75',
          backgroundColor: '#1D9E7522',
          pointRadius: 4,
          tension: 0.3,
          fill: true,
          yAxisID: 'yLeft',
        },
        {
          label: 'Crescimento % (mês a mês)',
          data: growthPct,
          borderColor:     '#185FA5',
          backgroundColor: '#185FA500',
          pointRadius: 4,
          tension: 0.3,
          fill: false,
          yAxisID: 'yRight',
          borderDash: [5, 3],
        },
      ],
    },
    options: {
      ...commonOptions(),
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { labels: { boxWidth: 12, font: { size: 11 } } },
        tooltip: {
          callbacks: {
            label: ctx => ctx.datasetIndex === 0
              ? ` Acumulado: ${fmt(ctx.raw)}`
              : ctx.raw !== null ? ` Crescimento: ${ctx.raw}%` : ' —',
          },
        },
      },
      scales: {
        yLeft: {
          type: 'linear', position: 'left',
          ticks: { callback: tickBRL },
        },
        yRight: {
          type: 'linear', position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { callback: v => v !== null ? v + '%' : '' },
        },
        x: { ticks: { autoSkip: false } },
      },
    },
  });
}
