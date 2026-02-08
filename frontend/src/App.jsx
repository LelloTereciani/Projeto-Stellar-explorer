import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import LedgerDetailsPage from './pages/LedgerDetailsPage';
import TransactionDetailsPage from './pages/TransactionDetailsPage';
import AccountDetailsPage from './pages/AccountDetailsPage';
import ContractDetailsPage from './pages/ContractDetailsPage';
import ChartsPage from './pages/ChartsPage'; // ← NOVO IMPORT

function AppContent() {
    const { theme } = useAppContext();
    const baseName = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router basename={baseName || '/'}>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        minHeight: '100vh'
                    }}
                >
                    <Header />
                    <Box component="main" sx={{ flex: 1 }}>
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/charts" element={<ChartsPage />} /> {/* ← NOVA ROTA */}
                            <Route path="/ledger/:ledgerId" element={<LedgerDetailsPage />} />
                            <Route path="/transaction/:transactionId" element={<TransactionDetailsPage />} />
                            <Route path="/account/:accountId" element={<AccountDetailsPage />} />
                            <Route path="/contract/:contractId" element={<ContractDetailsPage />} />
                        </Routes>
                    </Box>
                    <Footer />
                </Box>
            </Router>
        </ThemeProvider>
    );
}

function App() {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
}

export default App;
