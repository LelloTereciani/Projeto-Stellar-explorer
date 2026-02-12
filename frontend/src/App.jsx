import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { AppProvider, useAppContext } from './contexts/AppContext';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import HomePage from './pages/HomePage.jsx';
import LedgerDetailsPage from './pages/LedgerDetailsPage.jsx';
import TransactionDetailsPage from './pages/TransactionDetailsPage.jsx';
import AccountDetailsPage from './pages/AccountDetailsPage.jsx';
import ContractDetailsPage from './pages/ContractDetailsPage.jsx';
import ChartsPage from './pages/ChartsPage.jsx'; // ← NOVO IMPORT

function AppContent() {
    const { theme } = useAppContext();
    const envBase = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
    const baseName = import.meta.env.PROD ? '/explorer' : envBase;

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
