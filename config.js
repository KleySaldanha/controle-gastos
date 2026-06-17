/**
 * config.js — Dados estáticos e constantes da aplicação
 * =========================================================
 * Este arquivo é o único lugar onde categorias e subcategorias
 * são definidas. Para personalizar o app basta editar aqui:
 *
 *   • Adicionar categoria  → novo objeto em CATEGORIES
 *   • Remover subcategoria → remover do array subcats
 *   • Mudar cor            → alterar color / bg (variáveis CSS)
 *   • Incluir nos gastos   → isExpense: true
 *   • Excluir dos gastos   → isExpense: false
 *
 * Chave de persistência: alterar STORAGE_KEY apaga dados salvos.
 * =========================================================
 */

'use strict';

/**
 * @typedef  {Object} Category
 * @property {string}   id        — identificador único (usado como chave)
 * @property {string}   name      — nome exibido na interface
 * @property {string}   color     — variável CSS ou hex para textos/bordas
 * @property {string}   bg        — variável CSS ou hex para fundos/badges
 * @property {boolean}  isExpense — true = entra no total de gastos
 * @property {string[]} subcats   — lista de subcategorias
 */

/** @type {Category[]} */
const CATEGORIES = [
  {
    id: 'invest',
    name: 'Investimentos',
    color: 'var(--invest)',
    bg:    'var(--invest-bg)',
    /**
     * isExpense: false — Investimentos NÃO entram no cálculo de gastos.
     * São alocações de patrimônio e aparecem separados no dashboard.
     */
    isExpense: false,
    subcats: [
      'Porquinho Nubank',
      'XP Investimentos',
      'Clear Corretora',
      'Mercado Bitcoin',
      'Pagbank',
      'Caixinhas/Poupança',
    ],
  },
  {
    id: 'fixed',
    name: 'Gastos Fixos/Essências',
    color: 'var(--fixed)',
    bg:    'var(--fixed-bg)',
    isExpense: true, // compõe o total de gastos
    subcats: [
      'Energia',
      'Internet Móvel',
      'Internet Fibra',
      'Saúde',
      'Plano de Saúde Pietra',
      'IPVA',
      'Gastos Carro',
      'MEI',
      'Impostos',
      'Leite/Alimentação Pietra',
      'Cartão Passagem',
      'Carro',
    ],
  },
  {
    id: 'variable',
    name: 'Gastos Variáveis',
    color: 'var(--variable)',
    bg:    'var(--variable-bg)',
    isExpense: true, // compõe o total de gastos
    subcats: [
      'Taxa CC',
      'Cartão Itaú',
      'Lazer',
      'Férias',
      'Gastos Pietra',
      'Juquinha',
      'Seguro de vida',
      'Pessoal',
      'Lavagem Carro',
    ],
  },
  {
    id: 'reserve',
    name: 'Reserva Financeira/Objetivos',
    color: 'var(--reserve)',
    bg:    'var(--reserve-bg)',
    /**
     * isExpense: false — Reservas são objetivos futuros,
     * não devem compor o total de gastos do mês.
     */
    isExpense: false,
    subcats: [
      'Imóvel',
      'Carro',
      'Poupança Pietra',
      'Moto',
      'Itens de Casa',
      'Estudos',
      'Emergencia',
      'Aposentadoria',
      'Investimentos',
      'Emp. Contas Invest',
    ],
  },
];

/** Nomes dos meses em português (índice 0 = Janeiro) */
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março',    'Abril',
  'Maio',    'Junho',     'Julho',    'Agosto',
  'Setembro','Outubro',   'Novembro', 'Dezembro',
];

/**
 * Chave do localStorage onde os dados são persistidos.
 * Alterar esta string apaga todos os dados salvos anteriormente.
 */
const STORAGE_KEY = 'cgastos_v1';

/**
 * Cores fixas para os gráficos Chart.js (na mesma ordem de CATEGORIES).
 * Mantidas aqui e não em CSS pois Chart.js não lê variáveis CSS.
 */
const CHART_COLORS = ['#1D9E75', '#534AB7', '#D85A30', '#185FA5'];
