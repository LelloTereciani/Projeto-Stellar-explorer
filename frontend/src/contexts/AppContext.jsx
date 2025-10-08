import React, { createContext, useContext, useState } from 'react';
import { createTheme } from '@mui/material/styles';

const AppContext = createContext();

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppContext deve ser usado dentro de AppProvider');
    }
    return context;
};

// Tema padrão como fallback
const defaultTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

export const AppProvider = ({ children }) => {
    // 🔄 ALTERAÇÃO: Padrões alterados para Mainnet (false) e Day Mode (false)
    const [isTestnet, setIsTestnet] = useState(false); // ← Era true, agora é false (Mainnet)
    const [isDarkMode, setIsDarkMode] = useState(false); // ← Mantém false (Day Mode)

    // Criar tema do Material-UI com fallback
    let theme;
    try {
        theme = createTheme({
            palette: {
                mode: isDarkMode ? 'dark' : 'light',
                primary: {
                    main: isTestnet ? '#ff9800' : '#1976d2', // Mainnet = azul, Testnet = laranja
                },
                secondary: {
                    main: '#dc004e',
                },
                background: {
                    default: isDarkMode ? '#121212' : '#fafafa',
                    paper: isDarkMode ? '#1e1e1e' : '#ffffff',
                },
            },
            typography: {
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
            },
            components: {
                MuiButton: {
                    styleOverrides: {
                        root: {
                            textTransform: 'none',
                        },
                    },
                },
                MuiCard: {
                    styleOverrides: {
                        root: {
                            borderRadius: 12,
                        },
                    },
                },
            },
        });
    } catch (error) {
        console.error('Erro ao criar tema:', error);
        theme = defaultTheme;
    }

    // URLs das APIs
    const getApiUrl = () => {
        return isTestnet 
            ? 'https://horizon-testnet.stellar.org'
            : 'https://horizon.stellar.org'; // ← Agora será o padrão
    };

    // Nome da rede
    const networkName = isTestnet ? 'Testnet' : 'Mainnet'; // ← Agora mostra "Mainnet" por padrão
    
    // Cor da rede para chips
    const networkColor = isTestnet ? 'warning' : 'primary'; // ← Agora usa "primary" (azul) por padrão

    // Função para alternar entre redes
    const toggleNetwork = () => {
        setIsTestnet(!isTestnet);
    };

    // Função para alternar tema
    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
    };

    const value = {
        isTestnet,
        isDarkMode,
        theme,
        getApiUrl,
        networkName,
        networkColor,
        toggleNetwork,
        toggleTheme,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};