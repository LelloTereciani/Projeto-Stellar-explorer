import { useAppContext } from '../contexts/AppContext';
import axios from 'axios';

export const useStellarApi = () => {
  const { getApiUrl, isTestnet } = useAppContext();

  const fetchTransaction = async (hash) => {
    const apiUrl = getApiUrl();
    return axios.get(`${apiUrl}/transactions/${hash}`);
  };

  const fetchAccount = async (address) => {
    const apiUrl = getApiUrl();
    return axios.get(`${apiUrl}/accounts/${address}`);
  };

  const fetchLedger = async (sequence) => {
    const apiUrl = getApiUrl();
    return axios.get(`${apiUrl}/ledgers/${sequence}`);
  };

  return {
    fetchTransaction,
    fetchAccount,
    fetchLedger,
    isTestnet,
    apiUrl: getApiUrl()
  };
};