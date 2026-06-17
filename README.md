# 💰 Controle de Gastos

Aplicação web para gestão financeira pessoal. Permite registrar lançamentos por categoria, acompanhar o orçamento mensal e visualizar gráficos de evolução ao longo do ano.

🔗 **[Acesse o app](https://kleysaldanha.github.io/controle-gastos/)**

---

## Funcionalidades

- Dashboard com barra de distribuição do salário e cards de métricas
- Lançamentos por categoria e subcategoria
- Visão anual com tabela comparativa mês a mês
- 5 gráficos: distribuição mensal, evolução anual, gastos vs salário, líquido mensal e evolução acumulada de investimentos
- Dados persistidos no `localStorage` (sem necessidade de backend)

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 / CSS3 | Interface e estilização |
| JavaScript (ES Modules) | Lógica da aplicação |
| [Chart.js 4](https://www.chartjs.org/) | Gráficos |
| [Vite 5](https://vitejs.dev/) | Bundler e servidor de desenvolvimento |
| GitHub Actions | CI/CD para deploy automático |
| GitHub Pages | Hospedagem |

## Estrutura do projeto

```
controle-gastos/
├── css/
│   └── styles.css        # Design tokens e componentes
├── js/
│   ├── config.js         # Categorias, meses e constantes
│   ├── state.js          # Estado global e persistência (localStorage)
│   ├── finance.js        # Cálculos financeiros (funções puras)
│   ├── render.js         # Dashboard e tabela anual
│   ├── charts.js         # Gráficos Chart.js
│   ├── modals.js         # Modais de lançamento, salário e subcategoria
│   └── app.js            # Entry point e navegação
├── index.html
├── vite.config.js
└── package.json
```

## Desenvolvimento local

**Pré-requisito:** [Node.js](https://nodejs.org/) (versão 18+)

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build de produção
npm run build
```

## Deploy

O deploy é feito automaticamente via GitHub Actions a cada push na branch `main`. O build é gerado com `npm run build` e publicado no GitHub Pages.
