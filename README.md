# Stellar Explorer

**Classification:** Independent Project · Study Project · Production-oriented prototype

A full-stack Stellar blockchain explorer with a React/Vite frontend and a Node.js/Express API. It supports mainnet and Testnet queries, recent ledger data, accounts, transactions, Soroban contracts, storage, events, and network statistics.

## Scope and limitations

- This is an independent portfolio project and self-hosted prototype.
- Network data depends on Horizon and Soroban RPC retention, availability, and rate limits.
- A hosted demo, when available, is demonstration evidence only; no commercial users or production SLA are claimed.
- Keep backend environment files local and use [.env.example](.env.example) when available.

## Local development

```bash
git clone https://github.com/LelloTereciani/Projeto-Stellar-explorer.git
cd Projeto-Stellar-explorer

cd backend
npm install
npm start
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

The default frontend runs on port 5173 and the backend on port 3001. Configure `VITE_BACKEND_URL` and `VITE_BASE_PATH` when needed.

## Technology

React, MUI, React Router, Vite, Node.js, Express, Stellar SDK, Axios, and Docker Compose.

## License

MIT. See [License.txt](License.txt).

## Author

Lello Tereciani
