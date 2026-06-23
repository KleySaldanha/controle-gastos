/** @typedef {Object} Category
 * @property {string}   id
 * @property {string}   name
 * @property {string}   color  hex
 * @property {string}   bg     hex (light tint)
 * @property {boolean}  isExpense
 * @property {string[]} subcats
 */

/** Gera um fundo claro a partir de uma cor hex */
export function computeBg(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const m = (c) => Math.round(c * 0.18 + 255 * 0.82).toString(16).padStart(2, '0');
  return `#${m(r)}${m(g)}${m(b)}`;
}

/** @type {Category[]} */
export const CATEGORIES = [
  {
    id: 'fixed',
    name: 'Gastos Fixos',
    color: '#534AB7',
    bg:    '#EEEDFE',
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
    color: '#D85A30',
    bg:    '#FAECE7',
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
    color: '#185FA5',
    bg:    '#E6F1FB',
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
    color: '#0891B2',
    bg:    '#E0F4F8',
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
    color: '#1D9E75',
    bg:    '#E1F5EE',
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
