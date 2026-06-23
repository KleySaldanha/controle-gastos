/** @typedef {Object} Category
 * @property {string}   id
 * @property {string}   name
 * @property {string}   color
 * @property {string}   bg
 * @property {boolean}  isExpense
 * @property {string[]} subcats
 */

/** @type {Category[]} */
export const CATEGORIES = [
  {
    id: 'fixed',
    name: 'Gastos Fixos',
    color: 'var(--fixed)',
    bg:    'var(--fixed-bg)',
    isExpense: true,
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
    isExpense: true,
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
    name: 'Reserva Financeira',
    color: 'var(--reserve)',
    bg:    'var(--reserve-bg)',
    isExpense: true,
    subcats: [
      'Emergência',
      'Aposentadoria',
      'Investimentos',
    ],
  },
  {
    id: 'goals',
    name: 'Objetivos',
    color: 'var(--goals)',
    bg:    'var(--goals-bg)',
    isExpense: true,
    subcats: [
      'Imóvel',
      'Carro',
      'Poupança Pietra',
      'Moto',
      'Itens de Casa',
      'Estudos',
      'Emp. Contas Invest',
    ],
  },
  {
    id: 'invest',
    name: 'Investimentos',
    color: 'var(--invest)',
    bg:    'var(--invest-bg)',
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
];

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março',    'Abril',
  'Maio',    'Junho',     'Julho',    'Agosto',
  'Setembro','Outubro',   'Novembro', 'Dezembro',
];

export const STORAGE_KEY = 'cgastos_v1';

// Ordem: fixed, variable, reserve, goals, invest
export const CHART_COLORS = ['#534AB7', '#D85A30', '#185FA5', '#0891B2', '#1D9E75'];
