# Stellar Explorer 🚀

## Visao Geral ✨

Stellar Explorer e um explorador interativo da blockchain Stellar com suporte a Soroban.
Ele oferece uma interface web (frontend) e uma API (backend) para consultar dados
da rede Stellar em mainnet e testnet.

## Funcionalidades 🎯

- Estatisticas da rede (TPS, taxas, ledgers recentes e saude da rede)
- Graficos e analises na pagina `/charts` (transacoes, operacoes e volume)
- Busca unificada por conta, transacao, ledger e contrato Soroban
- Detalhes de contas, transacoes e ledgers
- Contratos Soroban: status, WASM hash, storage de instancia, eventos e invocacoes
- Alternancia entre mainnet e testnet
- UI responsiva e tema claro/escuro
- Fallback para dados basicos via StellarExpert quando Soroban RPC estiver indisponivel
- Consulta de transacoes tenta mainnet e, se necessario, testnet automaticamente
- API com CORS habilitado

Observacao: eventos e invocacoes de contratos dependem da janela de retencao da
Soroban RPC. Se nao houver eventos na janela, o resultado sera vazio. 🙂

## Demo 🔗

Rodando em producao:
- Home: `https://portifolio.cloud` (tambem em `https://www.portifolio.cloud`)
- Frontend: `https://portifolio.cloud/explorer` (tambem em `https://www.portifolio.cloud/explorer`)
- API: `https://portifolio.cloud/api` (tambem em `https://www.portifolio.cloud/api`)

## Tecnologias 🧰

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

## Instalacao 🛠️

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

## Configuracao ⚙️

### Backend (.env em `backend/.env`)
```env
PORT=3001
STELLAR_HORIZON_URL=https://horizon.stellar.org
SOROBAN_RPC_MAINNET_URL=https://stellar-soroban-public.nodies.app
SOROBAN_RPC_TESTNET_URL=https://stellar-soroban-testnet-public.nodies.app
PROJECTS_ROOT=/var/www/html
```

### Frontend (opcional) 🌐
- `VITE_BACKEND_URL`: URL do backend. Se nao for informado, usa a origem atual
do browser e, em ultimo caso, `http://localhost:3001`.
- Dica: para desenvolvimento local, use `VITE_BACKEND_URL=http://localhost:3001`. ✅
- `VITE_BASE_PATH`: base path para deploy em subdiretorio (ex.: `/explorer/`).
- Em localhost, normalmente use `/` (nao precisa de `/explorer/`). Em VPS com outros apps, use `VITE_BASE_PATH=/explorer/`. 🚀

## Execucao (desenvolvimento) 🧪

1) Backend
```bash
cd backend
npm start
```

2) Frontend
```bash
cd ../frontend
npm run dev
```

Acesse o frontend em `http://localhost:5173` (ou a porta exibida pelo Vite) e o
backend em `http://localhost:3001` (por padrao).

## Build para producao 📦

Exemplo de deploy em subdiretorio `/explorer/`:
```bash
cd frontend
VITE_BASE_PATH=/explorer/ npm run build
```
O build fica em `frontend/dist`.

Build local (sem subdiretorio):
```bash
cd frontend
npm run build
```

Build local apontando para backend local:
```bash
cd frontend
VITE_BACKEND_URL=http://localhost:3001 npm run build
```

Exemplo com backend em outro host:
```bash
cd frontend
VITE_BASE_PATH=/explorer/ VITE_BACKEND_URL=https://seu-dominio.com npm run build
```

## Deploy na VPS 🌍

Arquitetura recomendada:
- Edge proxy dedicado (Nginx em container) no projeto `RWAImob/infra/edge-proxy`.
- Frontend deste projeto publicado como estatico em `/var/www/html/explorer`.
- Backend deste projeto em container (`docker-compose.edge.yml`) na rede Docker `edge`.

Passo a passo:
1) Gere pacote de frontend (SPA em `/explorer` + pagina raiz):
```bash
cd frontend
npm run build:deploy
```
2) Publique o conteudo de `frontend/deploy/` no diretorio publico da VPS:
```bash
rsync -av --delete frontend/deploy/ root@SEU_IP:/var/www/html/
```
3) Configure `backend/.env` na VPS com:
```env
PROJECTS_ROOT=/var/www/html
```
4) Suba o backend na rede compartilhada `edge`:
```bash
bash scripts/deploy-backend-edge.sh
```
5) Garanta que o edge proxy esteja ativo no projeto RWAImob:
```bash
cd /root/RWAImob
bash infra/edge-proxy/scripts/deploy-edge.sh
```

Observacao:
- O roteamento de `/api`, `/explorer`, `/RWAImob` e `/__projects/` fica centralizado no edge proxy.
- Este repositório nao precisa mais publicar porta HTTP no host.

## Endpoints principais 🔌

- `GET /api/health`
- `GET /api/projects` (use `?all=1` para incluir diretorios sem `index.html`)
- `GET /api/network-stats`
- `GET /api/ledgers?limit=20`
- `GET /api/transactions?limit=20`
- `GET /api/operations?limit=20`
- `GET /api/search/:term`
- `GET /api/accounts/:id`
- `GET /api/transactions/:hash`
- `GET /api/ledgers/:sequence`
- `GET /api/contracts/:contractId?network=mainnet|testnet`
- `GET /api/contracts/:contractId/events?network=mainnet|testnet&limit=20&cursor=...&startLedger=...&endLedger=...`

## Exemplos rapidos (curl) 📡

Listar ledgers recentes:
```bash
curl "http://localhost:3001/api/ledgers?limit=5"
```

Buscar transacao:
```bash
curl "http://localhost:3001/api/transactions/SEU_HASH_AQUI"
```

Buscar conta:
```bash
curl "http://localhost:3001/api/accounts/SEU_ENDERECO_G..."
```

Contrato Soroban (mainnet/testnet):
```bash
curl "http://localhost:3001/api/contracts/SEU_CONTRATO_C...?network=mainnet"
curl "http://localhost:3001/api/contracts/SEU_CONTRATO_C...?network=testnet"
```

Eventos do contrato (com paginacao):
```bash
curl "http://localhost:3001/api/contracts/SEU_CONTRATO_C.../events?network=mainnet&limit=20"
```

## Troubleshooting 🧯

- `404` ao buscar transacao: verifique se o hash e valido (64 caracteres hex) e se a rede esta correta.
- `404` ao buscar conta: confirme se o endereco comeca com `G` e tem 56 caracteres.
- `Contrato nao encontrado`: pode estar fora da janela de retencao do Soroban RPC ou o ID esta incorreto.
- `CORS` no frontend: confira `VITE_BACKEND_URL` e se o backend esta rodando em `http://localhost:3001`.
- Sem eventos: ajuste `startLedger` ou tente novamente mais tarde, a janela do RPC pode ser curta.

## Licenca 📄

MIT
