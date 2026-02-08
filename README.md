# Stellar Explorer

## Visao Geral

Stellar Explorer e um explorador interativo da blockchain Stellar com suporte a Soroban.
Ele oferece uma interface web (frontend) e uma API (backend) para consultar dados
da rede Stellar em mainnet e testnet.

## Funcionalidades

- Estatisticas da rede (TPS, taxas, ledgers recentes)
- Busca unificada por conta, transacao, ledger e contrato Soroban
- Detalhes de contas, transacoes e ledgers
- Contratos Soroban: status, WASM hash, storage de instancia, eventos e invocacoes
- Alternancia entre mainnet e testnet
- UI responsiva e tema claro/escuro

Observacao: eventos e invocacoes de contratos dependem da janela de retencao da
Soroban RPC. Se nao houver eventos na janela, o resultado sera vazio.

## Tecnologias

**Frontend**
- React 18
- MUI (Material UI)
- React Router
- Recharts
- Axios
- Vite

**Backend**
- Node.js
- Express
- Axios
- CORS
- Dotenv
- Stellar SDK

## Instalacao

1) Clone o repositorio
```bash
git clone https://github.com/LelloTereciani/Projeto-Stellar-explorer.git
cd Projeto-Stellar-explorer
```

2) Backend
```bash
cd backend
npm install
```

3) Frontend
```bash
cd ../frontend
npm install
```

## Configuracao

### Backend (.env em `backend/.env`)
```env
PORT=3001
STELLAR_HORIZON_URL=https://horizon.stellar.org
SOROBAN_RPC_MAINNET_URL=https://stellar-soroban-public.nodies.app
SOROBAN_RPC_TESTNET_URL=https://stellar-soroban-testnet-public.nodies.app
```

### Frontend (opcional)
- `VITE_BACKEND_URL`: URL do backend (padrao: usa a origem atual do browser).
- `VITE_BASE_PATH`: base path para deploy em subdiretorio (ex.: `/explorer/`).

## Execucao (desenvolvimento)

1) Backend
```bash
cd backend
npm start
```

2) Frontend
```bash
cd frontend
npm run dev
```

Acesse: `http://localhost:3000`

## Build para producao

Exemplo de deploy em subdiretorio `/explorer/`:
```bash
cd frontend
VITE_BASE_PATH=/explorer/ npm run build
```
O build fica em `frontend/dist`.

## Endpoints principais

- `GET /api/health`
- `GET /api/network-stats`
- `GET /api/ledgers?limit=20`
- `GET /api/transactions?limit=20`
- `GET /api/operations?limit=20`
- `GET /api/search/:term`
- `GET /api/accounts/:id`
- `GET /api/transactions/:hash`
- `GET /api/ledgers/:sequence`
- `GET /api/contracts/:contractId?network=mainnet|testnet`
- `GET /api/contracts/:contractId/events?network=mainnet|testnet&limit=20`

## Licenca

MIT
