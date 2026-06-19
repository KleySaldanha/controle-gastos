import ApexCharts from 'apexcharts';
import { CATEGORIES, MONTHS, CHART_COLORS } from './config.js';
import { state, getSalary } from './state.js';
import { catTotal, totalGastos, totalAlocado, getLiquid, getInvestAccum, getInvestGrowthPct, pct, fmt } from './finance.js';

let chartPie    = null;
let chartLine   = null;
let chartBar    = null;
let chartLiquid = null;
let chartInvest = null;

export function renderCharts() {
  [chartPie, chartLine, chartBar, chartLiquid, chartInvest].forEach(c => c?.destroy());
  chartPie = chartLine = chartBar = chartLiquid = chartInvest = null;

  const { year, month } = state;
  const sal = getSalary(year, month);

  chartPie    = renderPieChart(year, month, sal);
  chartLine   = renderLineChart(year);
  chartBar    = renderBarChart(year);
  chartLiquid = renderLiquidChart(year);
  chartInvest = renderInvestChart(year);
}

function css(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim();
}

function brlShort(val) {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (abs >= 1000) return sign + 'R$' + (abs / 1000).toFixed(1).replace('.', ',') + 'k';
  return sign + 'R$' + abs.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function commonChart(height = 280) {
  return {
    height,
    background: 'transparent',
    toolbar: { show: false },
    zoom:    { enabled: false },
    fontFamily: 'inherit',
    animations: { enabled: true, speed: 350, animateGradually: { enabled: false } },
  };
}

function renderPieChart(year, month, sal) {
  const series = CATEGORIES.map(c => catTotal(c.id, year, month));
  const total  = series.reduce((a, b) => a + b, 0);

  const chart = new ApexCharts(document.getElementById('chart-pie'), {
    chart: { ...commonChart(300), type: 'donut' },
    series,
    labels: CATEGORIES.map(c => c.name.split('/')[0].trim()),
    colors: CHART_COLORS,
    theme:  { mode: 'dark' },
    stroke: { width: 2, colors: ['transparent'] },
    plotOptions: {
      pie: {
        donut: {
          size: '58%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              color: css('--text-2') || '#94a3b8',
              formatter: () => fmt(total),
            },
            value: {
              color: css('--text') || '#e2e8f0',
              formatter: v => fmt(Number(v)),
            },
          },
        },
      },
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: val => `${fmt(val)}${sal ? '  (' + pct(val, sal).toFixed(1) + '% sal.)' : ''}`,
      },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: { colors: css('--text') || '#e2e8f0' },
      formatter: (name, opts) => `${name}: ${fmt(opts.w.globals.series[opts.seriesIndex])}`,
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    dataLabels: { enabled: false },
  });
  chart.render();
  return chart;
}

function renderLineChart(year) {
  const months = MONTHS.map(m => m.slice(0, 3));

  const chart = new ApexCharts(document.getElementById('chart-line'), {
    chart: { ...commonChart(280), type: 'line' },
    theme: { mode: 'dark' },
    series: CATEGORIES.map((cat, i) => ({
      name: cat.name.split('/')[0].trim(),
      data: MONTHS.map((_, m) => catTotal(cat.id, year, m)),
      color: CHART_COLORS[i],
    })),
    xaxis: {
      categories: months,
      labels:     { style: { colors: css('--text-2') || '#888' }, rotate: 0 },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: {
      labels: {
        style:     { colors: css('--text-2') || '#888' },
        formatter: brlShort,
      },
    },
    grid:   { borderColor: css('--border') || '#2a2a3e', strokeDashArray: 4 },
    stroke: { width: 2, curve: 'smooth' },
    markers: { size: 3 },
    tooltip: {
      theme: 'dark',
      y: { formatter: val => fmt(val) },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels:   { colors: css('--text') || '#e2e8f0' },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    dataLabels: { enabled: false },
  });
  chart.render();
  return chart;
}

function renderBarChart(year) {
  const months = MONTHS.map(m => m.slice(0, 3));

  const chart = new ApexCharts(document.getElementById('chart-bar'), {
    chart: { ...commonChart(280), type: 'bar' },
    theme: { mode: 'dark' },
    series: [
      {
        name: 'Salário',
        data: MONTHS.map((_, m) => getSalary(year, m)),
        color: '#1D9E75',
      },
      {
        name: 'Total gastos',
        data: MONTHS.map((_, m) => totalGastos(year, m)),
        color: '#D85A30',
      },
      {
        name: 'Total alocado',
        data: MONTHS.map((_, m) => totalAlocado(year, m)),
        color: '#888888',
      },
    ],
    xaxis: {
      categories: months,
      labels:     { style: { colors: css('--text-2') || '#888' } },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: {
      labels: {
        style:     { colors: css('--text-2') || '#888' },
        formatter: brlShort,
      },
    },
    grid:   { borderColor: css('--border') || '#2a2a3e', strokeDashArray: 4 },
    stroke: { show: true, width: 1, colors: ['transparent'] },
    plotOptions: {
      bar: { columnWidth: '70%', borderRadius: 2 },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: val => fmt(val) },
    },
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels:   { colors: css('--text') || '#e2e8f0' },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    dataLabels: { enabled: false },
    fill: {
      opacity: [0.85, 0.85, 0.4],
    },
  });
  chart.render();
  return chart;
}

function renderLiquidChart(year) {
  const liqData = MONTHS.map((_, m) => getLiquid(year, m));
  const months  = MONTHS.map(m => m.slice(0, 3));

  const chart = new ApexCharts(document.getElementById('chart-liquid'), {
    chart: { ...commonChart(280), type: 'bar' },
    theme: { mode: 'dark' },
    series: [{ name: 'Líquido', data: liqData }],
    colors: [({ value }) => (value >= 0 ? '#639922' : '#E24B4A')],
    xaxis: {
      categories: months,
      labels:     { style: { colors: css('--text-2') || '#888' } },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: {
      labels: {
        style:     { colors: css('--text-2') || '#888' },
        formatter: v => (v < 0 ? '-' : '') + brlShort(Math.abs(v)),
      },
    },
    grid:   { borderColor: css('--border') || '#2a2a3e', strokeDashArray: 4 },
    stroke: { show: false },
    plotOptions: {
      bar: { columnWidth: '65%', borderRadius: 2 },
    },
    tooltip: {
      theme: 'dark',
      y: { formatter: val => (val < 0 ? '-' : '') + fmt(Math.abs(val)) },
    },
    legend:     { show: false },
    dataLabels: { enabled: false },
    fill:       { opacity: 0.85 },
  });
  chart.render();
  return chart;
}

function renderInvestChart(year) {
  const accum     = getInvestAccum(year);
  const growthPct = getInvestGrowthPct(accum);
  const months    = MONTHS.map(m => m.slice(0, 3));

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

  const chart = new ApexCharts(document.getElementById('chart-invest'), {
    chart: { ...commonChart(300), type: 'line' },
    theme: { mode: 'dark' },
    series: [
      {
        name: 'Acumulado (R$)',
        data: accum,
        color: '#1D9E75',
      },
      {
        name: 'Crescimento % (mês)',
        data: growthPct,
        color: '#185FA5',
      },
    ],
    xaxis: {
      categories: months,
      labels:     { style: { colors: css('--text-2') || '#888' } },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: [
      {
        seriesName: 'Acumulado (R$)',
        labels: {
          style:     { colors: css('--text-2') || '#888' },
          formatter: brlShort,
        },
      },
      {
        seriesName: 'Crescimento % (mês)',
        opposite: true,
        labels: {
          style:     { colors: css('--text-2') || '#888' },
          formatter: v => v !== null ? v + '%' : '',
        },
      },
    ],
    grid:    { borderColor: css('--border') || '#2a2a3e', strokeDashArray: 4 },
    stroke:  { width: [2, 2], curve: 'smooth', dashArray: [0, 5] },
    markers: { size: 4 },
    fill: {
      type: ['gradient', 'solid'],
      gradient: {
        type: 'vertical',
        shadeIntensity: 0.3,
        opacityFrom: 0.5,
        opacityTo:   0.05,
      },
    },
    tooltip: {
      theme: 'dark',
      shared: true,
      intersect: false,
      y: [
        { formatter: val => fmt(val) },
        { formatter: val => val !== null ? val + '%' : '—' },
      ],
    },
    legend: { show: false },
    dataLabels: { enabled: false },
  });
  chart.render();
  return chart;
}
