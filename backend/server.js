require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');
const StellarSdk = require('@stellar/stellar-sdk');

const app = express();
const PORT = process.env.PORT || 3001;
const STELLAR_HORIZON_URL = process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org';
const SOROBAN_RPC_MAINNET_URL = process.env.SOROBAN_RPC_MAINNET_URL || 'https://stellar-soroban-public.nodies.app';
const SOROBAN_RPC_TESTNET_URL = process.env.SOROBAN_RPC_TESTNET_URL || 'https://stellar-soroban-testnet-public.nodies.app';
const PROJECTS_ROOT = process.env.PROJECTS_ROOT || '/var/www/portifolio.cloud';

app.use(cors());
app.use(express.json());

// Função auxiliar para converter stroops para XLM de forma segura
const stroopsToXLM = (stroops) => {
    if (!stroops || isNaN(stroops)) return 0;
    return parseFloat(stroops) / 10000000;
};

// Função auxiliar para formatar valores XLM
const formatXLM = (value) => {
    if (!value || isNaN(value)) return '0.0000000';
    return parseFloat(value).toFixed(7);
};

// Função auxiliar para validar hash de transação
const isValidTransactionHash = (hash) => {
    return hash && 
           typeof hash === 'string' && 
           hash.length === 64 && 
           /^[0-9a-fA-F]+$/.test(hash);
};

// Função auxiliar para validar ID de contrato Soroban (StrKey C...)
const isValidContractId = (contractId) => {
    return contractId &&
           typeof contractId === 'string' &&
           contractId.length === 56 &&
           /^C[A-Z2-7]+$/i.test(contractId);
};

const normalizeNetwork = (network) => {
    return String(network || '').toLowerCase() === 'testnet' ? 'testnet' : 'mainnet';
};

const getSorobanRpcUrl = (network) => {
    return network === 'testnet' ? SOROBAN_RPC_TESTNET_URL : SOROBAN_RPC_MAINNET_URL;
};

const getStellarExpertBaseUrl = (network) => {
    return network === 'testnet'
        ? 'https://api.stellar.expert/explorer/testnet'
        : 'https://api.stellar.expert/explorer/public';
};

const fetchStellarExpertContract = async (network, contractId) => {
    try {
        const baseUrl = getStellarExpertBaseUrl(network);
        const { data } = await axios.get(`${baseUrl}/contract/${contractId}`);
        return data;
    } catch (error) {
        if (error.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

const mapExpertContract = (data) => {
    if (!data) return null;
    return {
        createdAt: data.created ? new Date(data.created * 1000).toISOString() : null,
        creator: data.creator || null,
        invocations: data.invocations ?? null,
        subinvocations: data.subinvocation ?? null,
        eventsCount: data.events ?? null,
        errorsCount: data.errors ?? null,
        storageEntries: data.storage_entries ?? null,
        validationStatus: data.validation?.status || null,
        wasmHash: data.wasm || null
    };
};

const sorobanRpcCall = async (network, method, params) => {
    const url = getSorobanRpcUrl(network);
    const payload = {
        jsonrpc: '2.0',
        id: Date.now(),
        method,
        params
    };

    const { data } = await axios.post(url, payload);
    if (data.error) {
        const message = data.error?.message || 'Erro na chamada Soroban RPC';
        const error = new Error(message);
        error.details = data.error;
        throw error;
    }
    return data.result;
};

const normalizeScVal = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'bigint') return value.toString();
    if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
        return Buffer.from(value).toString('hex');
    }
    if (Array.isArray(value)) {
        return value.map(normalizeScVal);
    }
    if (value instanceof Map) {
        const obj = {};
        for (const [key, val] of value.entries()) {
            obj[String(normalizeScVal(key))] = normalizeScVal(val);
        }
        return obj;
    }
    if (typeof value === 'object') {
        if (value instanceof StellarSdk.Address) {
            return value.toString();
        }
        if (typeof value.toString === 'function' && value.toString !== Object.prototype.toString) {
            return value.toString();
        }
        try {
            return JSON.parse(JSON.stringify(value));
        } catch {
            return String(value);
        }
    }
    return value;
};

const scValToJson = (scVal) => {
    try {
        const native = StellarSdk.scValToNative(scVal);
        return normalizeScVal(native);
    } catch (error) {
        return null;
    }
};

const findStorageValue = (storageEntries, keys) => {
    const targets = keys.map((k) => k.toLowerCase());
    for (const entry of storageEntries) {
        const keyString = entry.key !== null && entry.key !== undefined ? String(entry.key) : '';
        const keyLower = keyString.toLowerCase();
        if (targets.includes(keyLower)) {
            return entry.value;
        }
    }
    return null;
};

const EXCLUDED_PROJECT_DIRS = new Set(['api', '__projects']);

// Rota para estatísticas gerais da rede (VERSÃO MELHORADA)
app.get('/api/network-stats', async (req, res) => {
    try {
        console.log('Buscando estatísticas da rede...');
        
        // Buscar dados dos últimos ledgers
        const ledgersResponse = await axios.get(`${STELLAR_HORIZON_URL}/ledgers?order=desc&limit=50`);
        const latestLedger = ledgersResponse.data._embedded.records[0];
        
        // Buscar transações recentes (últimas 24h se possível)
        const transactionsResponse = await axios.get(`${STELLAR_HORIZON_URL}/transactions?order=desc&limit=200`);
        const transactions = transactionsResponse.data._embedded.records;
        
        // Calcular TPS de forma mais robusta
        const ledgers = ledgersResponse.data._embedded.records;
        let tps = 0;
        let networkActivity = 'Baixa Atividade';
        
        if (ledgers.length >= 10) {
            const recentLedgers = ledgers.slice(0, 20); // Usar mais ledgers
            const totalTxInPeriod = recentLedgers.reduce((sum, ledger) => sum + (ledger.transaction_count || 0), 0);
            
            const startTime = new Date(recentLedgers[recentLedgers.length - 1].closed_at);
            const endTime = new Date(recentLedgers[0].closed_at);
            const timeSpanSeconds = (endTime - startTime) / 1000;
            
            if (timeSpanSeconds > 0) {
                tps = totalTxInPeriod / timeSpanSeconds;
                
                // Classificar atividade da rede
                if (tps > 5) networkActivity = 'Alta Atividade';
                else if (tps > 1) networkActivity = 'Atividade Moderada';
                else if (tps > 0.1) networkActivity = 'Atividade Baixa';
                else networkActivity = 'Rede em Standby';
            }
            
            console.log(`TPS calculado: ${tps} (${totalTxInPeriod} tx em ${timeSpanSeconds}s)`);
        }
        
        // Calcular taxa média e estatísticas de taxa
        let avgFee = 0;
        let minFee = 0;
        let maxFee = 0;
        let transactionsWithFees = 0;
        
        if (transactions.length > 0) {
            const validTransactions = transactions.filter(tx => 
                tx.fee_paid && 
                !isNaN(parseInt(tx.fee_paid)) && 
                parseInt(tx.fee_paid) > 0
            );
            
            if (validTransactions.length > 0) {
                const fees = validTransactions.map(tx => stroopsToXLM(tx.fee_paid));
                const totalFees = fees.reduce((sum, fee) => sum + fee, 0);
                
                avgFee = totalFees / validTransactions.length;
                minFee = Math.min(...fees);
                maxFee = Math.max(...fees);
                transactionsWithFees = validTransactions.length;
            }
            
            console.log(`Taxa média calculada: ${avgFee} XLM de ${transactionsWithFees} transações`);
        }
        
        // Calcular tempo médio entre ledgers
        let avgLedgerTime = 5;
        if (ledgers.length >= 5) {
            const timeDiffs = [];
            for (let i = 0; i < Math.min(ledgers.length - 1, 10); i++) {
                const time1 = new Date(ledgers[i].closed_at);
                const time2 = new Date(ledgers[i + 1].closed_at);
                const diff = (time1 - time2) / 1000;
                if (diff > 0) timeDiffs.push(diff);
            }
            
            if (timeDiffs.length > 0) {
                avgLedgerTime = timeDiffs.reduce((sum, diff) => sum + diff, 0) / timeDiffs.length;
            }
        }

        // Calcular estatísticas dos últimos ledgers
        const recentLedgerStats = ledgers.slice(0, 10);
        const totalRecentTx = recentLedgerStats.reduce((sum, ledger) => sum + (ledger.transaction_count || 0), 0);
        const totalRecentOps = recentLedgerStats.reduce((sum, ledger) => sum + (ledger.operation_count || 0), 0);

        const stats = {
            latestLedger: {
                sequence: latestLedger.sequence || 0,
                hash: latestLedger.hash || '',
                transactionCount: latestLedger.transaction_count || 0,
                operationCount: latestLedger.operation_count || 0,
                closedAt: latestLedger.closed_at || new Date().toISOString(),
                totalCoins: latestLedger.total_coins || '0',
                feePool: latestLedger.fee_pool || '0'
            },
            networkStats: {
                averageFee: formatXLM(avgFee),
                minFee: formatXLM(minFee),
                maxFee: formatXLM(maxFee),
                transactionsPerSecond: tps.toFixed(3),
                totalLumens: latestLedger.total_coins || '0',
                feePool: latestLedger.fee_pool || '0',
                baseFee: formatXLM(stroopsToXLM(latestLedger.base_fee_in_stroops || 100)),
                baseReserve: formatXLM(stroopsToXLM(latestLedger.base_reserve_in_stroops || 5000000)),
                averageLedgerTime: avgLedgerTime.toFixed(1),
                networkLiveness: networkActivity,
                transactionsAnalyzed: transactionsWithFees
            },
            recentTransactions: transactions.slice(0, 15).map(tx => ({
                id: tx.id || '',
                hash: tx.hash || '',
                ledger: tx.ledger_attr || 0,
                sourceAccount: tx.source_account || '',
                feePaid: formatXLM(stroopsToXLM(tx.fee_paid)),
                operationCount: tx.operation_count || 0,
                createdAt: tx.created_at || new Date().toISOString()
            })),
            additionalMetrics: {
                totalLedgers: latestLedger.sequence || 0,
                recentTransactionCount: totalRecentTx,
                recentOperationCount: totalRecentOps,
                averageOperationsPerTransaction: totalRecentTx > 0 ? 
                    (totalRecentOps / totalRecentTx).toFixed(1) : '0',
                ledgersAnalyzed: recentLedgerStats.length
            }
        };

        console.log('Estatísticas calculadas com sucesso');
        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error.message);
        res.status(500).json({ 
            message: 'Erro ao buscar estatísticas da rede.',
            error: error.message 
        });
    }
});

// Rota para ledgers recentes
app.get('/api/ledgers', async (req, res) => {
    try {
        const limit = req.query.limit || 20;
        console.log(`Buscando ${limit} ledgers recentes...`);
        
        const { data } = await axios.get(`${STELLAR_HORIZON_URL}/ledgers?order=desc&limit=${limit}`);
        
        // Processar e limpar dados dos ledgers
        const cleanLedgers = data._embedded.records.map(ledger => ({
            ...ledger,
            sequence: ledger.sequence || 0,
            hash: ledger.hash || '',
            transaction_count: ledger.transaction_count || 0,
            operation_count: ledger.operation_count || 0,
            closed_at: ledger.closed_at || new Date().toISOString()
        }));
        
        console.log(`${cleanLedgers.length} ledgers encontrados`);
        res.json(cleanLedgers);
    } catch (error) {
        console.error('Erro ao buscar ledgers:', error.message);
        res.status(500).json({ message: 'Erro ao buscar ledgers.' });
    }
});

// Rota para transações recentes
app.get('/api/transactions', async (req, res) => {
    try {
        const limit = req.query.limit || 20;
        console.log(`Buscando ${limit} transações recentes...`);
        
        const { data } = await axios.get(`${STELLAR_HORIZON_URL}/transactions?order=desc&limit=${limit}`);
        
        // Processar e limpar dados das transações
        const cleanTransactions = data._embedded.records.map(tx => ({
            ...tx,
            id: tx.id || '',
            hash: tx.hash || '',
            fee_paid: tx.fee_paid || 0,
            operation_count: tx.operation_count || 0,
            ledger_attr: tx.ledger_attr || 0,
            source_account: tx.source_account || '',
            created_at: tx.created_at || new Date().toISOString()
        }));
        
        console.log(`${cleanTransactions.length} transações encontradas`);
        res.json(cleanTransactions);
    } catch (error) {
        console.error('Erro ao buscar transações:', error.message);
        res.status(500).json({ message: 'Erro ao buscar transações.' });
    }
});

// Rota para operações recentes
app.get('/api/operations', async (req, res) => {
    try {
        const limit = req.query.limit || 20;
        console.log(`Buscando ${limit} operações recentes...`);
        
        const { data } = await axios.get(`${STELLAR_HORIZON_URL}/operations?order=desc&limit=${limit}`);
        
        console.log(`${data._embedded.records.length} operações encontradas`);
        res.json(data._embedded.records);
    } catch (error) {
        console.error('Erro ao buscar operações:', error.message);
        res.status(500).json({ message: 'Erro ao buscar operações.' });
    }
});

// Rota de busca inteligente
app.get('/api/search/:term', async (req, res) => {
    const { term } = req.params;
    
    console.log(`Analisando termo de busca: ${term}`);

    try {
        // É um ID de conta? (Começa com 'G', 56 caracteres)
        if (term.startsWith('G') && term.length === 56) {
            console.log('Identificado como ID de conta');
            return res.json({ type: 'account', id: term });
        }

        // É um ID de contrato Soroban? (Começa com 'C', 56 caracteres)
        if (isValidContractId(term)) {
            console.log('Identificado como ID de contrato');
            return res.json({ type: 'contract', id: term });
        }
        
        // É um hash de transação? (64 caracteres hexadecimais)
        if (term.length === 64 && /^[0-9a-fA-F]+$/.test(term)) {
            console.log('Identificado como hash de transação');
            return res.json({ type: 'transaction', hash: term });
        }
        
        // É um número de ledger? (Apenas dígitos)
        if (/^\d+$/.test(term)) {
            console.log('Identificado como número de ledger');
            return res.json({ type: 'ledger', sequence: term });
        }

        console.log('Formato não reconhecido');
        return res.status(404).json({ 
            message: 'Formato de busca inválido ou não reconhecido.',
            suggestions: [
                'ID de conta: deve começar com "G" e ter 56 caracteres',
                'ID de contrato: deve começar com "C" e ter 56 caracteres (Soroban)',
                'Hash de transação: deve ter 64 caracteres hexadecimais',
                'Número de ledger: deve conter apenas dígitos'
            ]
        });
    } catch (error) {
        console.error('Erro na análise de busca:', error.message);
        res.status(500).json({ message: 'Erro interno ao analisar busca.' });
    }
});

// 🧩 Soroban - Detalhes do Contrato
app.get('/api/contracts/:contractId', async (req, res) => {
    const { contractId } = req.params;
    const network = normalizeNetwork(req.query.network);

    if (!isValidContractId(contractId)) {
        return res.status(400).json({ 
            message: 'ID de contrato inválido. Deve começar com "C" e ter 56 caracteres base32.' 
        });
    }

    try {
        const contract = new StellarSdk.Contract(contractId);
        const contractInstanceKey = contract.getFootprint().toXDR('base64');

        let health;
        let instanceResult;
        try {
            [health, instanceResult] = await Promise.all([
                sorobanRpcCall(network, 'getHealth'),
                sorobanRpcCall(network, 'getLedgerEntries', { keys: [contractInstanceKey] })
            ]);
        } catch (rpcError) {
            const expertContract = await fetchStellarExpertContract(network, contractId);
            if (expertContract) {
                const expert = mapExpertContract(expertContract);
                return res.json({
                    contractId,
                    network,
                    status: 'active',
                    executableType: 'wasm',
                    wasmHash: expert?.wasmHash || null,
                    codeHash: expert?.wasmHash || null,
                    codeSize: null,
                    createdLedger: null,
                    createdAt: expert?.createdAt || null,
                    creator: expert?.creator || null,
                    lastModifiedLedger: null,
                    latestLedger: null,
                    oldestLedger: null,
                    ledgerRetentionWindow: null,
                    storageCount: expert?.storageEntries ?? null,
                    storageEntries: expert?.storageEntries ?? null,
                    invocations: expert?.invocations ?? null,
                    subinvocations: expert?.subinvocations ?? null,
                    eventsCount: expert?.eventsCount ?? null,
                    errorsCount: expert?.errorsCount ?? null,
                    validationStatus: expert?.validationStatus ?? null,
                    storage: [],
                    admin: null,
                    owner: null,
                    source: 'stellar-expert',
                    warning: 'Soroban RPC indisponível. Dados básicos do StellarExpert.'
                });
            }
            throw rpcError;
        }

        let instanceEntry = instanceResult.entries && instanceResult.entries[0];

        if (!instanceEntry) {
            const expertContract = await fetchStellarExpertContract(network, contractId);
            if (!expertContract) {
                return res.status(404).json({
                    contractId,
                    network,
                    status: 'not_found'
                });
            }

            const expert = mapExpertContract(expertContract);
            return res.json({
                contractId,
                network,
                status: 'active',
                executableType: 'wasm',
                wasmHash: expert?.wasmHash || null,
                codeHash: expert?.wasmHash || null,
                codeSize: null,
                createdLedger: null,
                createdAt: expert?.createdAt || null,
                creator: expert?.creator || null,
                lastModifiedLedger: null,
                latestLedger: health.latestLedger || null,
                oldestLedger: health.oldestLedger || null,
                ledgerRetentionWindow: health.ledgerRetentionWindow || null,
                storageCount: expert?.storageEntries ?? null,
                storageEntries: expert?.storageEntries ?? null,
                invocations: expert?.invocations ?? null,
                subinvocations: expert?.subinvocations ?? null,
                eventsCount: expert?.eventsCount ?? null,
                errorsCount: expert?.errorsCount ?? null,
                validationStatus: expert?.validationStatus ?? null,
                storage: [],
                admin: null,
                owner: null,
                source: 'stellar-expert'
            });
        }
        const instanceData = StellarSdk.xdr.LedgerEntryData.fromXDR(instanceEntry.xdr, 'base64');
        const contractData = instanceData.contractData();
        const instance = contractData.val().instance();
        const executable = instance.executable();

        const executableType = executable.switch().name;
        let wasmHash = null;
        let codeSize = null;
        let codeHash = null;

        if (executableType === 'contractExecutableWasm') {
            const wasmHashBuffer = executable.wasmHash();
            wasmHash = Buffer.from(wasmHashBuffer).toString('hex');

            try {
                const codeKey = StellarSdk.xdr.LedgerKey.contractCode(
                    new StellarSdk.xdr.LedgerKeyContractCode({ hash: wasmHashBuffer })
                );
                const codeKeyXdr = codeKey.toXDR('base64');
                const codeResult = await sorobanRpcCall(network, 'getLedgerEntries', { keys: [codeKeyXdr] });
                if (codeResult.entries && codeResult.entries.length > 0) {
                    const codeEntryData = StellarSdk.xdr.LedgerEntryData.fromXDR(codeResult.entries[0].xdr, 'base64');
                    const codeEntry = codeEntryData.contractCode();
                    const code = codeEntry.code();
                    codeSize = code.length;
                    codeHash = Buffer.from(codeEntry.hash()).toString('hex');
                }
            } catch (error) {
                console.warn('⚠️ Não foi possível obter o código do contrato:', error.message);
            }
        }

        const storageRaw = instance.storage() || [];
        const storage = storageRaw.map((entry) => ({
            key: scValToJson(entry.key()),
            value: scValToJson(entry.val())
        }));

        const admin = findStorageValue(storage, ['admin', 'administrator']);
        const owner = findStorageValue(storage, ['owner']);

        let createdAt = null;
        let creator = null;
        let invocations = null;
        let subinvocations = null;
        let eventsCount = null;
        let errorsCount = null;
        let storageEntries = null;
        let validationStatus = null;
        let source = 'soroban-rpc';
        try {
            const expertContract = await fetchStellarExpertContract(network, contractId);
            if (expertContract) {
                const expert = mapExpertContract(expertContract);
                createdAt = expert?.createdAt || null;
                creator = expert?.creator || null;
                invocations = expert?.invocations ?? null;
                subinvocations = expert?.subinvocations ?? null;
                eventsCount = expert?.eventsCount ?? null;
                errorsCount = expert?.errorsCount ?? null;
                storageEntries = expert?.storageEntries ?? null;
                validationStatus = expert?.validationStatus ?? null;
                source = 'soroban-rpc+stellar-expert';
            }
        } catch (error) {
            console.warn('⚠️ Não foi possível obter dados do StellarExpert:', error.message);
        }

        return res.json({
            contractId,
            network,
            status: 'active',
            executableType: executableType === 'contractExecutableWasm' ? 'wasm' : 'stellar_asset',
            wasmHash,
            codeHash,
            codeSize,
            createdLedger: null,
            createdAt,
            creator,
            lastModifiedLedger: instanceEntry.lastModifiedLedgerSeq || null,
            latestLedger: health.latestLedger || null,
            oldestLedger: health.oldestLedger || null,
            ledgerRetentionWindow: health.ledgerRetentionWindow || null,
            storageCount: storage.length,
            storageEntries,
            invocations,
            subinvocations,
            eventsCount,
            errorsCount,
            validationStatus,
            storage,
            admin,
            owner,
            source
        });
    } catch (error) {
        console.error('Erro ao buscar contrato Soroban:', error.message);
        return res.status(500).json({ message: 'Erro ao buscar contrato Soroban.' });
    }
});

// 🧩 Soroban - Eventos e Invocações Recentes
app.get('/api/contracts/:contractId/events', async (req, res) => {
    const { contractId } = req.params;
    const network = normalizeNetwork(req.query.network);
    const limit = Math.min(parseInt(req.query.limit || '20', 10) || 20, 200);
    const cursor = req.query.cursor || null;
    const startLedger = req.query.startLedger ? parseInt(req.query.startLedger, 10) : null;
    const endLedger = req.query.endLedger ? parseInt(req.query.endLedger, 10) : null;

    if (!isValidContractId(contractId)) {
        return res.status(400).json({ 
            message: 'ID de contrato inválido. Deve começar com "C" e ter 56 caracteres base32.' 
        });
    }

    try {
        let health;
        try {
            health = await sorobanRpcCall(network, 'getHealth');
        } catch (error) {
            return res.json({
                events: [],
                cursor: null,
                invocations: [],
                warning: 'Soroban RPC indisponível no momento.'
            });
        }

        const latestLedger = health.latestLedger || 0;
        const retentionWindow = health.ledgerRetentionWindow || 2000;
        const defaultWindow = retentionWindow;
        const oldestLedger = health.oldestLedger || Math.max(latestLedger - retentionWindow + 1, 1);
        let computedStartLedger = startLedger || Math.max(latestLedger - defaultWindow + 1, oldestLedger);

        if (startLedger) {
            if (startLedger < oldestLedger) computedStartLedger = oldestLedger;
            if (startLedger > latestLedger) computedStartLedger = latestLedger;
        }

        const params = {
            filters: [{ type: 'contract', contractIds: [contractId] }],
            pagination: { limit },
            xdrFormat: 'json'
        };

        if (cursor) {
            params.pagination.cursor = cursor;
        } else {
            params.startLedger = computedStartLedger;
            if (endLedger) {
                params.endLedger = endLedger;
            }
        }

        let result;
        try {
            result = await sorobanRpcCall(network, 'getEvents', params);
        } catch (error) {
            return res.json({
                events: [],
                cursor: null,
                invocations: [],
                warning: 'Eventos indisponíveis no momento.'
            });
        }
        const events = result.events || [];

        const invocations = [];
        const seen = new Set();
        for (const event of events) {
            if (event.txHash && !seen.has(event.txHash)) {
                seen.add(event.txHash);
                invocations.push({
                    txHash: event.txHash,
                    ledger: event.ledger,
                    ledgerClosedAt: event.ledgerClosedAt,
                    success: event.inSuccessfulContractCall
                });
            }
        }

        return res.json({
            ...result,
            invocations
        });
    } catch (error) {
        console.error('Erro ao buscar eventos Soroban:', error.message);
        return res.status(500).json({ message: 'Erro ao buscar eventos do contrato.' });
    }
});

// Rota para detalhes de transação (VERSÃO CORRIGIDA E COMPLETA)
app.get('/api/transactions/:hash', async (req, res) => {
    try {
        const { hash } = req.params;
        
        console.log(`Buscando transação: ${hash}`);
        
        // Validar formato do hash
        if (!isValidTransactionHash(hash)) {
            console.log('Hash inválido fornecido');
            return res.status(400).json({ 
                message: 'Hash inválido. Deve ter 64 caracteres hexadecimais.',
                provided: hash,
                expected: 'String de 64 caracteres hexadecimais'
            });
        }
        
        // Tentar buscar da API principal
        let transactionData;
        let source = 'mainnet';
        
        try {
            console.log('Tentando buscar na mainnet...');
            const response = await axios.get(`${STELLAR_HORIZON_URL}/transactions/${hash}`);
            transactionData = response.data;
            console.log('✅ Transação encontrada na mainnet');
        } catch (mainnetError) {
            console.log('❌ Erro na mainnet:', mainnetError.response?.status || mainnetError.message);
            
            // Se falhar na mainnet, tentar testnet
            try {
                console.log('Tentando buscar na testnet...');
                const testnetResponse = await axios.get(`https://horizon-testnet.stellar.org/transactions/${hash}`);
                transactionData = testnetResponse.data;
                source = 'testnet';
                console.log('✅ Transação encontrada na testnet');
            } catch (testnetError) {
                console.log('❌ Erro na testnet:', testnetError.response?.status || testnetError.message);
                throw mainnetError; // Usar erro da mainnet
            }
        }
        
        // Processar e limpar os dados da transação
        const cleanTransaction = {
            ...transactionData,
            // Campos essenciais com fallbacks
            id: transactionData.id || transactionData.hash || '',
            hash: transactionData.hash || transactionData.id || '',
            fee_paid: transactionData.fee_paid || 0,
            max_fee: transactionData.max_fee || 0,
            operation_count: transactionData.operation_count || 0,
            ledger_attr: transactionData.ledger_attr || transactionData.ledger || 0,
            source_account: transactionData.source_account || '',
            source_account_sequence: transactionData.source_account_sequence || '',
            fee_account: transactionData.fee_account || transactionData.source_account || '',
            created_at: transactionData.created_at || new Date().toISOString(),
            successful: transactionData.successful !== false,
            
            // Campos opcionais
            memo: transactionData.memo || null,
            memo_type: transactionData.memo_type || null,
            time_bounds: transactionData.time_bounds || null,
            
            // Metadados
            _source: source,
            _processed_at: new Date().toISOString()
        };
        
        console.log(`✅ Transação ${hash} processada com sucesso (fonte: ${source})`);
        res.json(cleanTransaction);
        
    } catch (error) {
        console.error(`❌ Erro final ao buscar transação ${req.params.hash}:`, error.message);
        
        if (error.response?.status === 404) {
            res.status(404).json({ 
                message: `Transação não encontrada.`,
                hash: req.params.hash,
                suggestions: [
                    'Verifique se o hash está correto',
                    'A transação pode ser muito antiga',
                    'Tente buscar na página inicial por transações recentes'
                ]
            });
        } else if (error.response?.status >= 500) {
            res.status(500).json({ 
                message: 'Erro interno da API Stellar. Tente novamente em alguns instantes.',
                hash: req.params.hash
            });
        } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
            res.status(503).json({ 
                message: 'Serviço temporariamente indisponível. Tente novamente.',
                hash: req.params.hash
            });
        } else {
            res.status(error.response?.status || 500).json({ 
                message: `Erro ao buscar transação: ${error.message}`,
                hash: req.params.hash
            });
        }
    }
});

// Rota para detalhes da conta
app.get('/api/accounts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log(`Buscando conta: ${id}`);
        
        // Validar formato do ID da conta
        if (!id || !id.startsWith('G') || id.length !== 56) {
            return res.status(400).json({ 
                message: 'ID de conta inválido. Deve começar com "G" e ter 56 caracteres.',
                provided: id
            });
        }
        
        const { data } = await axios.get(`${STELLAR_HORIZON_URL}/accounts/${id}`);
        
        console.log(`✅ Conta ${id} encontrada`);
        res.json(data);
    } catch (error) {
        console.error(`❌ Erro ao buscar conta ${req.params.id}:`, error.message);
        
        if (error.response?.status === 404) {
            res.status(404).json({ 
                message: `Conta não encontrada.`,
                account_id: req.params.id
            });
        } else {
            res.status(error.response?.status || 500).json({ 
                message: `Erro ao buscar conta: ${error.message}`,
                account_id: req.params.id
            });
        }
    }
});

// Rota para detalhes do ledger (bloco) - VERSÃO CORRIGIDA
app.get('/api/ledgers/:sequence', async (req, res) => {
    try {
        const { sequence } = req.params;
        
        console.log(`Buscando ledger: ${sequence}`);
        
        // Validar se a sequência é um número válido
        if (!sequence || isNaN(sequence) || parseInt(sequence) <= 0) {
            return res.status(400).json({ 
                message: 'Número de ledger inválido. Deve ser um número positivo.',
                provided: sequence
            });
        }
        
        const { data } = await axios.get(`${STELLAR_HORIZON_URL}/ledgers/${sequence}`);
        
        // Processar e limpar os dados do ledger
        const cleanLedger = {
            ...data,
            sequence: data.sequence || 0,
            hash: data.hash || '',
            prev_hash: data.prev_hash || '',
            transaction_count: data.transaction_count || 0,
            operation_count: data.operation_count || 0,
            closed_at: data.closed_at || new Date().toISOString(),
            total_coins: data.total_coins || '0',
            fee_pool: data.fee_pool || '0',
            base_fee_in_stroops: data.base_fee_in_stroops || 100,
            base_reserve_in_stroops: data.base_reserve_in_stroops || 5000000
        };
        
        console.log(`✅ Ledger ${sequence} encontrado com sucesso`);
        res.json(cleanLedger);
        
    } catch (error) {
        console.error(`❌ Erro ao buscar ledger ${req.params.sequence}:`, error.message);
        
        if (error.response?.status === 404) {
            res.status(404).json({ 
                message: `Ledger ${req.params.sequence} não encontrado.`,
                sequence: req.params.sequence,
                suggestions: [
                    'Verifique se o número está correto',
                    'Ledgers muito antigos podem não estar disponíveis',
                    'Tente um número de ledger mais recente'
                ]
            });
        } else if (error.response?.status >= 500) {
            res.status(500).json({ 
                message: 'Erro interno da API Stellar. Tente novamente em alguns instantes.',
                sequence: req.params.sequence
            });
        } else {
            res.status(error.response?.status || 500).json({ 
                message: `Erro ao buscar ledger: ${error.message}`,
                sequence: req.params.sequence
            });
        }
    }
});

// Rota de health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        stellar_horizon: STELLAR_HORIZON_URL
    });
});

// Lista pastas de projetos no root público da VPS
app.get('/api/projects', async (req, res) => {
    try {
        const root = PROJECTS_ROOT;
        const includeWithoutIndex = String(req.query.all || '') === '1';
        const entries = await fs.readdir(root, { withFileTypes: true });
        const projects = [];

        for (const entry of entries) {
            if (!entry.isDirectory()) continue;

            const name = entry.name;
            if (!name || name.startsWith('.') || EXCLUDED_PROJECT_DIRS.has(name)) continue;

            const indexPath = path.join(root, name, 'index.html');
            let hasIndex = false;
            try {
                await fs.access(indexPath);
                hasIndex = true;
            } catch {
                hasIndex = false;
            }

            if (!hasIndex && !includeWithoutIndex) continue;

            projects.push({
                name,
                path: `/${name}`,
                type: 'directory',
                hasIndex
            });
        }

        projects.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        res.json({
            root,
            total: projects.length,
            projects
        });
    } catch (error) {
        console.error('❌ Erro ao listar projetos:', error.message);
        res.status(500).json({
            message: 'Erro ao listar diretorios de projetos',
            details: error.message
        });
    }
});

// Middleware de tratamento de erros global
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({
        message: 'Erro interno do servidor',
        timestamp: new Date().toISOString()
    });
});

// ✅ MIDDLEWARE PARA ROTAS NÃO ENCONTRADAS (CORRIGIDO)
app.use((req, res) => {
    res.status(404).json({
        message: 'Rota não encontrada',
        path: req.originalUrl,
        method: req.method
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
    console.log(`📡 Conectado à Stellar Horizon: ${STELLAR_HORIZON_URL}`);
    console.log(`🕐 Iniciado em: ${new Date().toLocaleString()}`);
    console.log(`\n📋 Rotas disponíveis:`);
    console.log(`   GET /api/health - Status do servidor`);
    console.log(`   GET /api/projects - Lista diretorios publicados`);
    console.log(`   GET /api/network-stats - Estatísticas da rede`);
    console.log(`   GET /api/ledgers - Ledgers recentes`);
    console.log(`   GET /api/transactions - Transações recentes`);
    console.log(`   GET /api/operations - Operações recentes`);
    console.log(`   GET /api/search/:term - Busca inteligente`);
    console.log(`   GET /api/contracts/:contractId - Detalhes do contrato Soroban`);
    console.log(`   GET /api/contracts/:contractId/events - Eventos e invocações`);
    console.log(`   GET /api/transactions/:hash - Detalhes da transação`);
    console.log(`   GET /api/accounts/:id - Detalhes da conta`);
    console.log(`   GET /api/ledgers/:sequence - Detalhes do ledger`);
});
