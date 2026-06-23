# 💰 Controle de Gastos

Aplicação web para gestão financeira pessoal com autenticação de usuários. Permite registrar lançamentos por categoria, acompanhar o orçamento mensal e visualizar gráficos de evolução ao longo do ano.

🔗 **[Acesse o app](https://kleysaldanha.github.io/controle-gastos/)**

---

## Funcionalidades

**Dashboard**
- Barra de distribuição do salário por categoria
- Cards de resumo em destaque: Salário líquido, Total gastos, Líquido e % Gastos
- Cards secundários por categoria: Gastos Fixos, Gastos Variáveis, Reserva Financeira, Objetivos e Investimentos
- Cards de categorias com percentual sobre o total de gastos e subcategorias detalhadas

**Lançamentos**
- Registro por categoria e subcategoria com descrição e valor
- FAB com acesso rápido a novo lançamento ou definição de salário

**Visão anual**
- Tabela comparativa mês a mês por categoria e subcategoria

**Gráficos**
- Distribuição mensal por categoria (pizza)
- Evolução anual por categoria (linha)
- Gastos vs salário mês a mês (barras)
- Líquido mensal — sobra ou déficit (barras)
- Evolução acumulada dos investimentos com percentual de crescimento (linha dupla)

**Autenticação e usuários**
- Login e cadastro com e-mail e senha via Firebase Authentication
- Perfis de acesso: Administrador e Usuário
- Dados financeiros isolados por usuário no Firestore
- Página de perfil: alterar nome e senha
- Painel administrativo: listar usuários, alterar perfil de acesso, ativar/desativar contas e enviar redefinição de senha

**Categorias**
- Gerenciamento completo de categorias e subcategorias por usuário
- Criar, editar (nome, cor, tipo) e excluir categorias
- Adicionar, renomear e excluir subcategorias
- Renomear subcategoria atualiza automaticamente todos os lançamentos vinculados
- Categorias isoladas por usuário e persistidas no Firestore

## Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 / CSS3 | Interface e estilização |
| JavaScript (ES Modules) | Lógica da aplicação |
| [Firebase Authentication](https://firebase.google.com/products/auth) | Autenticação de usuários |
| [Cloud Firestore](https://firebase.google.com/products/firestore) | Banco de dados por usuário |
| [ApexCharts](https://apexcharts.com/) | Gráficos |
| [Vite 5](https://vitejs.dev/) | Bundler e servidor de desenvolvimento |
| GitHub Actions | CI/CD para deploy automático |
| GitHub Pages | Hospedagem |

## Estrutura do projeto

```
controle-gastos/
├── css/
│   └── styles.css        # Design tokens e componentes
├── js/
│   ├── firebase.js       # Inicialização do Firebase
│   ├── auth.js           # Autenticação e gerenciamento de usuários
│   ├── config.js         # Categorias, meses e constantes
│   ├── state.js          # Estado global e persistência (Firestore)
│   ├── finance.js        # Cálculos financeiros (funções puras)
│   ├── render.js         # Dashboard e tabela anual
│   ├── charts.js         # Gráficos ApexCharts
│   ├── modals.js         # Modais de lançamento, salário e subcategoria
│   ├── app.js            # Entry point e navegação
│   ├── login.js          # Lógica da tela de login
│   ├── register.js       # Lógica da tela de cadastro
│   ├── profile.js        # Lógica da página de perfil
│   ├── admin.js          # Lógica do painel administrativo
│   └── categories.js     # Lógica do gerenciamento de categorias
├── index.html            # App principal
├── login.html            # Tela de login
├── register.html         # Tela de cadastro
├── profile.html          # Página de perfil do usuário
├── admin.html            # Painel administrativo
├── categories.html       # Gerenciamento de categorias
├── firestore.rules       # Regras de segurança do Firestore
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

## Configuração do Firebase

Para rodar em outro ambiente, crie um projeto no [Firebase Console](https://console.firebase.google.com) e:

1. Ative **Authentication** com o provedor e-mail/senha
2. Ative o **Firestore Database**
3. Publique as regras do arquivo `firestore.rules` em **Firestore → Regras**
4. Substitua as credenciais em `js/firebase.js` pelas do seu projeto
