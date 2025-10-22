import { useAppContext } from '../contexts/AppContext';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useMemo } from 'react';

export const useStellarApi = () => {
  const { getApiUrl, isTestnet } = useAppContext();
  
  // Criar servidor Stellar com memoização para evitar recriar a cada render
  const server = useMemo(() => {
    const apiUrl = getApiUrl();
    return new StellarSdk.Horizon.Server(apiUrl);
  }, [getApiUrl]);

  const fetchTransaction = async (hash) => {
    try {
      const transaction = await server.transactions()
        .transaction(hash)
        .call();
      
      // Retornar no mesmo formato que axios (response.data)
      return { data: transaction };
    } catch (error) {
      console.error('Erro ao buscar transação:', error);
      throw error;
    }
  };

  const fetchAccount = async (address) => {
    try {
      const account = await server.loadAccount(address);
      
      // Retornar no mesmo formato que axios
      return { data: account };
    } catch (error) {
      console.error('Erro ao buscar conta:', error);
      throw error;
    }
  };

  const fetchLedger = async (sequence) => {
    try {
      const ledger = await server.ledgers()
        .ledger(sequence)
        .call();
      
      // Retornar no mesmo formato que axios
      return { data: ledger };
    } catch (error) {
      console.error('Erro ao buscar ledger:', error);
      throw error;
    }
  };

  // Funções adicionais úteis que você pode usar
  const fetchRecentLedgers = async (limit = 10) => {
    try {
      const response = await server.ledgers()
        .order('desc')
        .limit(limit)
        .call();
      
      return { data: { records: response.records } };
    } catch (error) {
      console.error('Erro ao buscar ledgers recentes:', error);
      throw error;
    }
  };

  const fetchRecentTransactions = async (limit = 10) => {
    try {
      const response = await server.transactions()
        .order('desc')
        .limit(limit)
        .call();
      
      return { data: { records: response.records } };
    } catch (error) {
      console.error('Erro ao buscar transações recentes:', error);
      throw error;
    }
  };

  const fetchAccountTransactions = async (accountId, limit = 10) => {
    try {
      const response = await server.transactions()
        .forAccount(accountId)
        .order('desc')
        .limit(limit)
        .call();
      
      return { data: { records: response.records } };
    } catch (error) {
      console.error('Erro ao buscar transações da conta:', error);
      throw error;
    }
  };

  return {
    fetchTransaction,
    fetchAccount,
    fetchLedger,
    fetchRecentLedgers,
    fetchRecentTransactions,
    fetchAccountTransactions,
    isTestnet,
    apiUrl: getApiUrl(),
    server // Expor o servidor caso precise fazer queries customizadas
  };
};