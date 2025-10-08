# �� Stellar Explorer - Um Navegador Interativo da Blockchain Stellar 🛰️

## 🌟 Visão Geral

Bem-vindo ao *Stellar Explorer*! Este projeto é um **poderoso e intuitivo explorador da blockchain Stellar**, projetado para oferecer uma visão clara e detalhada das atividades da rede. Atuando como uma ponte vital 🌉, ele conecta uma interface de usuário rica (frontend) com os dados robustos da rede Stellar Horizon (backend).

O objetivo principal é democratizar o acesso às informações da blockchain Stellar, desde estatísticas gerais da rede até os mínimos detalhes de transações e contas individuais, tudo isso com suporte tanto para a **Mainnet** quanto para a **Testnet**! ✨

## ✨ Funcionalidades Principais

Prepare-se para explorar a Stellar como nunca antes! O *Stellar Explorer* oferece:

-   **🔍 Exploração em Tempo Real**: Visualize os últimos ledgers, transações e operações da rede Stellar em um piscar de olhos.
-   **📊 Gráficos Interativos**: Mergulhe fundo na análise de dados com **5 tipos diferentes de gráficos** que visualizam transações por ledger, operações ao longo do tempo, volume acumulado e muito mais!
-   **🌐 Suporte Multi-Rede**: Alterne *facilmente* entre a **Mainnet** (rede principal) e a **Testnet** (rede de testes) para suas consultas.
-   **💡 Busca Inteligente e Unificada**: Encontre rapidamente qualquer informação usando um único endpoint (`/api/search/:term`). O sistema detecta automaticamente se você está buscando por uma conta, transação ou ledger!
-   **📄 Detalhes Aprofundados**: Acesse informações detalhadas sobre transações, contas e ledgers específicos através de roteamento dedicado.
-   **📱 Interface Responsiva & Mobile-First**: Desfrute de um design moderno e adaptativo, otimizado para uma experiência perfeita em *qualquer dispositivo*.
-   **🌗 Modo Escuro/Claro**: Personalize sua experiência de visualização com o tema de sua preferência.
-   **⚡ Atualizações Automáticas**: Mantenha-se sempre atualizado com dados que são *refrescados automaticamente a cada 30 segundos*.
-   **🚨 Tratamento de Erros Robusto**: Mensagens de erro *claras e informativas* para facilitar a depuração e garantir uma experiência de usuário tranquila.
-   **❤️‍🩹 Health Check**: Um endpoint simples para verificar a disponibilidade e o status do serviço do backend.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias-chave, combinando o melhor do ecossistema JavaScript para uma aplicação robusta e moderna:

### Frontend
-   **React 18** ⚛️: Biblioteca JavaScript para construir interfaces de usuário dinâmicas.
-   **Material-UI (MUI)** 🎨: Componentes React de alta qualidade com um design system elegante.
-   **React Router** 🗺️: Gerenciamento eficiente de rotas para navegação na aplicação.
-   **Recharts** ��: Uma biblioteca de gráficos intuitiva para visualização de dados.
-   **Axios** 🌐: Cliente HTTP baseado em Promises para fazer requisições à API.
-   **Vite** ⚡: Ferramenta de build de nova geração que oferece um desenvolvimento *extremamente rápido*.

### Backend
-   **Node.js** 🟢: Plataforma de runtime JavaScript, a base para o nosso servidor.
-   **Express.js** 🚀: Um framework web *minimalista e rápido* para criar a API RESTful.
-   **Axios** 🌍: Usado para fazer requisições à API Horizon da Stellar.
-   **CORS** 🛡️: Middleware para habilitar o Cross-Origin Resource Sharing de forma segura.
-   **Dotenv** 🔑: Carrega variáveis de ambiente de um arquivo `.env`, mantendo as configurações sensíveis *seguras e separadas*.
-   **Stellar SDK** ⭐: O SDK oficial para uma interação *eficiente* com a rede Stellar.

## 🚀 Primeiros Passos

Siga estas instruções para configurar e executar o *Stellar Explorer* localmente em sua máquina. Prepare-se para decolar! ��‍🚀

### Pré-requisitos
Certifique-se de ter o [**Node.js**](https://nodejs.org/en/) (versão 18+ recomendada) e o `npm` (gerenciador de pacotes do Node.js) ou `yarn` instalados. Você também precisará do [**Git**](https://git-scm.com/) para clonar o repositório.

### Instalação

1.  **Clone o repositório** para a sua máquina:
    ```bash
    git clone https://github.com/seu-usuario/stellar-explorer.git
    cd stellar-explorer
    ```

2.  **Instale as dependências do Backend**:
    Navegue até o diretório `backend` e instale as dependências.
    ```bash
    cd backend
    npm install # ou yarn install
    ```

3.  **Instale as dependências do Frontend**:
    Volte para o diretório raiz do projeto e, em seguida, navegue até o diretório `frontend` para instalar suas dependências.
    ```bash
    cd ../frontend
    npm install # ou yarn install
    ```

### Configuração

#### Backend
Crie um arquivo `.env` na raiz do diretório `backend` (ao lado de `server.js`) com as seguintes variáveis de ambiente:

```env
PORT=3001
STELLAR_HORIZON_URL=https://horizon.stellar.org
```

-   `PORT`: A porta em que o servidor Express será executado. (Padrão: `3001`)
-   `STELLAR_HORIZON_URL`: A URL do servidor Horizon da Stellar.
    -   Para a **Mainnet**: `https://horizon.stellar.org` (padrão)
    -   Para a **Testnet**: `https://horizon-testnet.stellar.org`

#### Frontend
O frontend está configurado para se conectar ao backend local. Por padrão, ele pode esperar que o backend esteja na porta `5000` (conforme o documento). **Atenção**: O `server.js` do backend inicia na porta `3001` por padrão. Se necessário, ajuste a URL base no arquivo de configuração do frontend para `http://localhost:3001` ou conforme a porta que você configurou para o backend.

### Execução

Para iniciar o projeto completo, você precisará executar o backend e o frontend em terminais separados.

1.  **Inicie o Backend**:
    Abra um terminal, navegue até o diretório `backend` e execute:
    ```bash
    cd backend
    npm start # ou node server.js
    ```
    Você verá uma mensagem como:
    ```
    🚀 Servidor backend rodando na porta 3001
    �� Conectado à Stellar Horizon: https://horizon.stellar.org
    🕐 Iniciado em: ...
    ```

2.  **Inicie o Frontend** (em *outro* terminal):
    Abra um novo terminal, navegue até o diretório `frontend` e execute:
    ```bash
    cd frontend
    npm start # ou npm run dev
    ```
    O Vite iniciará o servidor de desenvolvimento do frontend.

3.  **Acesse a Aplicação**:
    Abra seu navegador e acesse: `http://localhost:3000`
    Pronto! �� Você agora está explorando a rede Stellar!

## 📂 Estrutura do Projeto

O projeto `Stellar-Explorer` é modular, separando claramente o backend do frontend, o que facilita o desenvolvimento e a manutenção:

```
📁 Stellar-Explorer/
├── 📁 backend/
│   ├── 📁 node_modules/           # 📦 Dependências do backend
│   ├── 📄 .env                    # 🔑 Variáveis de ambiente (configuração local)
│   ├── 📄 package-lock.json       # 🔒 Lock de dependências do backend
│   ├── 📄 package.json            # 📄 Metadados e scripts do backend
│   └── 📄 server.js               # 🚀 Servidor principal da API REST
└── 📁 frontend/
    ├── 📁 node_modules/           # 📦 Dependências do frontend
    ├── 📁 public/                 # ��️ Assets estáticos (favicon, etc.)
    │   └── 📄 favicon.ico
    ├── 📁 src/                    # ⚛️ Código fonte do React
    │   ├── 📁 components/         # 🧩 Componentes reutilizáveis (Header, SearchBar)
    │   │   ├── 📄 ClickableLinks.jsx
    │   │   ├── 📄 Footer.jsx
    │   │   ├── 📄 Header.jsx
    │   │   ├── 📄 NetworkStatsCard.jsx
    │   │   ├── 📄 RecentActivity.jsx
    │   │   └── 📄 SearchBar.jsx
    │   ├── �� contexts/           # 🤝 Context API para estado global (AppContext)
    │   │   └── 📄 AppContext.jsx
    │   ├── 📁 hooks/              # 🎣 Hooks personalizados (useStellarApi)
    │   │   └── �� useStellarApi.js
    │   ├── 📁 pages/              # 📄 Páginas principais da aplicação (Home, AccountDetails, Charts)
    │   │   ├── 📄 AccountDetailsPage.jsx
    │   │   ├── 📄 ChartsPage.jsx
    │   │   ├── 📄 HomePage.jsx
    │   │   ├── 📄 LedgerDetailsPage.jsx
    │   │   └── �� TransactionDetailsPage.jsx
    │   ├── �� App.css             # 💅 Estilos globais da aplicação
    │   ├── 📄 App.jsx             # 🏠 Componente principal da aplicação
    │   ├── 📄 index.css           # �� Estilos CSS globais
    │   └── 📄 main.jsx            # 🚀 Ponto de entrada do React (renderização)
    ├── 📄 .gitignore              # 🚫 Arquivos ignorados pelo Git
    ├── 📄 eslint.config.js        # 🧹 Configuração do ESLint para qualidade de código
    ├── �� index.html              # 🌐 Ponto de entrada HTML do frontend
    ├── 📄 package.json            # 📄 Metadados e scripts do frontend
    ├── 📄 package-lock.json       # 🔒 Lock de dependências do frontend
    ├── 📄 README.md               # 📄 Este arquivo!
    └── 📄 vite.config.js          # ⚙️ Configuração do Vite
```

## 📡 Endpoints da API (Backend)

O backend oferece uma API RESTful para interação com os dados da rede Stellar:

### 🌐 Geral e Estatísticas

-   **`GET /api/health`**: Verifica a saúde e o status do servidor.
    -   *Exemplo:* `http://localhost:3001/api/health`
-   **`GET /api/network-stats`**: Fornece estatísticas abrangentes da rede Stellar (TPS, taxas, últimos ledgers, etc.).
    -   *Exemplo:* `http://localhost:3001/api/network-stats`

### 📜 Dados Recentes

-   **`GET /api/ledgers`**: Retorna uma lista dos ledgers mais recentes.
    -   *Parâmetros de Query:* `limit` (opcional, padrão 20)
    -   *Exemplo:* `http://localhost:3001/api/ledgers?limit=5`
-   **`GET /api/transactions`**: Retorna uma lista das transações mais recentes.
    -   *Parâmetros de Query:* `limit` (opcional, padrão 20)
    -   *Exemplo:* `http://localhost:3001/api/transactions?limit=10`
-   **`GET /api/operations`**: Retorna uma lista das operações mais recentes.
    -   *Parâmetros de Query:* `limit` (opcional, padrão 20)
    -   *Exemplo:* `http://localhost:3001/api/operations?limit=10`

### 🔍 Busca Inteligente

-   **`GET /api/search/:term`**: Identifica o tipo de `term` (conta, transação, ledger) e sugere o tipo.
    -   *Exemplo (Conta):* `http://localhost:3001/api/search/GDJ7A277SR6Z4E6T3437D3T4D4T4D4G4T4G4T4G4T4G4T4G4T4G4T4G4T4G4T4G4T4`
    -   *Exemplo (Transação):* `http://localhost:3001/api/search/a640161474a584988718617d5a57a1262d0d73f1d8c19954a9918731b6e4e164`
    -   *Exemplo (Ledger):* `http://localhost:3001/api/search/53610214`

### 📄 Detalhes Específicos

-   **`GET /api/accounts/:id`**: Retorna os detalhes de uma conta Stellar específica.
    -   *Exemplo:* `http://localhost:3001/api/accounts/GDJ7A277SR6Z4E6T3437D3T4D4T4D4G4T4G4T4G4T4G4T4G4T4G4T4G4T4G4T4G4T4`
-   **`GET /api/transactions/:hash`**: Retorna os detalhes de uma transação específica pelo seu hash. Inclui fallback para Testnet.
    -   *Exemplo:* `http://localhost:3001/api/transactions/a640161474a584988718617d5a57a1262d0d73f1d8c19954a9918731b6e4e164`
-   **`GET /api/ledgers/:sequence`**: Retorna os detalhes de um ledger específico pela sua sequência.
    -   *Exemplo:* `http://localhost:3001/api/ledgers/53610214`

## 🚨 Tratamento de Erros (Backend)

O backend foi projetado com um tratamento de erros *robusto* para garantir feedback claro e auxiliar na depuração:

-   **`400 Bad Request`**: Requisições com parâmetros inválidos (e.g., hash mal formatado).
-   **`404 Not Found`**: Recurso não encontrado na rede Stellar ou rota da API inexistente.
-   **`500 Internal Server Error`**: Erros inesperados no servidor ou problemas internos.
-   **`503 Service Unavailable`**: Falha de conexão com a API Horizon (problema externo temporário).

Cada erro é acompanhado de uma mensagem descritiva para auxiliar na resolução de problemas.

## 📝 Roadmap & Próximas Funcionalidades

O *Stellar Explorer* está sempre evoluindo! Aqui estão algumas das ideias para o futuro:

### Próximas Funcionalidades
-   **Busca por Hash** 🔎: Pesquisar transações e operações específicas de forma mais direta.
-   **Histórico Detalhado** 📚: Visualização aprofundada do histórico de transações de contas.
-   **Alertas Personalizados** 🔔: Notificações para eventos específicos na blockchain.
-   **Export de Dados** ��: Possibilidade de download de dados em formatos CSV/JSON.
-   **API Rate Limiting** 🚦: Implementação de controle de taxa de requisições no backend.
-   **Cache Redis** 🧠: Sistema de cache para melhorar significativamente a performance.
-   **Testes Automatizados** ✅: Cobertura completa de testes para garantir a estabilidade.
-   **Docker Support** 🐳: Containerização da aplicação para fácil implantação.

### Melhorias Planejadas
-   **PWA Support** 📱: Transformar em um Progressive Web App para uma experiência nativa.
-   **Internacionalização** 🗣️: Suporte a múltiplos idiomas.
-   **Gráficos Avançados** ��: Mais tipos de visualizações e opções de customização.
-   **Filtros Avançados** ⚙️: Filtros mais específicos para os dados apresentados.
-   **Modo Offline** 🔌: Funcionalidade básica para acesso a dados em modo offline.

## 🤝 Contribuição

Contribuições são *muito bem-vindas*! Se você deseja ajudar a tornar o *Stellar Explorer* ainda melhor, siga estes passos:

1.  **Fork o projeto** 🍴.
2.  Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`).
3.  Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`).
4.  Push para a branch (`git push origin feature/AmazingFeature`).
5.  Abra um **Pull Request** para revisão.

### Diretrizes de Contribuição
-   Mantenha o código *limpo e bem documentado*.
-   Adicione testes para novas funcionalidades (quando aplicável).
-   Siga as convenções de código existentes.
-   Atualize a documentação quando necessário.

## �� Reportando Bugs

Encontrou um problema? Ajude-nos a corrigi-lo abrindo uma [**issue**](https://github.com/seu-usuario/stellar-explorer/issues) e incluindo:

-   Descrição *detalhada* do problema.
-   Passos para reproduzir o erro.
-   Screenshots (se aplicável).
-   Informações do ambiente (OS, navegador, versão do Node.js).

## �� Licença

Este projeto está licenciado sob a **Licença MIT** - veja o arquivo `LICENSE` na raiz do repositório para mais detalhes.

## 👨‍�� Autor

Este projeto foi cuidadosamente desenvolvido por **Wesley Rodrigues Tereciani** ��‍♂️👨‍💻.

-   **GitHub**: [@seu-usuario](https://github.com/seu-usuario)
-   **LinkedIn**: [Seu LinkedIn](https://www.linkedin.com/in/seu-linkedin/)

## 🙏 Agradecimentos

Um agradecimento especial a:

-   **Stellar Development Foundation** pela excelente documentação e APIs.
-   **Material-UI** pelos componentes React de alta qualidade.
-   **Recharts** pela biblioteca de gráficos intuitiva.
-   A toda a **Comunidade Open Source** pelas ferramentas e inspiração contínua!

---

⭐ Se este projeto foi útil para você, considere dar uma estrela no GitHub!

🚀 Happy coding!