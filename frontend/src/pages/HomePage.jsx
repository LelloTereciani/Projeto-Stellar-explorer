import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    Grid,
    CircularProgress, 
    Alert, 
    Chip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TextField,
    Button,
    InputAdornment,
    Container
} from '@mui/material';
import { 
    AccountBalance as AccountBalanceIcon,
    Receipt as ReceiptIcon,
    TrendingUp as TrendingUpIcon,
    Speed as SpeedIcon,
    AccessTime as AccessTimeIcon,
    Search as SearchIcon,
    Clear as ClearIcon,
    Warning as WarningIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { ClickableLedger, ClickableTransaction } from '../components/ClickableLinks';

// Função para formatar tempo relativo
const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    return `${Math.floor(diffInSeconds / 86400)}d atrás`;
};

function HomePage() {
    const { getApiUrl, isTestnet, networkName, networkColor } = useAppContext();
    
    const [ledgers, setLedgers] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Estados para busca
    const [searchQuery, setSearchQuery] = useState('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchResult, setSearchResult] = useState(null);
    const [searchError, setSearchError] = useState('');

    // Função para buscar dados da API
    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const apiUrl = getApiUrl();
            console.log(`🌐 Buscando dados da ${networkName}: ${apiUrl}`);

            // Buscar ledgers e transações em paralelo
            const [ledgersResponse, transactionsResponse] = await Promise.all([
                axios.get(`${apiUrl}/ledgers?order=desc&limit=10`),
                axios.get(`${apiUrl}/transactions?order=desc&limit=10`)
            ]);

            const ledgersData = ledgersResponse.data._embedded?.records || [];
            const transactionsData = transactionsResponse.data._embedded?.records || [];

            setLedgers(ledgersData);
            setTransactions(transactionsData);
            
            console.log(`✅ Dados carregados da ${networkName}`);
        } catch (err) {
            console.error(`❌ Erro ao buscar dados da ${networkName}:`, err);
            setError(`Erro ao carregar dados da ${networkName}. Tente novamente.`);
        } finally {
            setLoading(false);
        }
    };

    // 🔧 FUNÇÃO DE BUSCA CORRIGIDA COM AVISOS
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchError('Digite algo para buscar');
            return;
        }

        try {
            setSearchLoading(true);
            setSearchError('');
            setSearchResult(null);
            
            const apiUrl = getApiUrl();
            const query = searchQuery.trim();
            
            console.log(`🔍 Buscando: ${query}`);

            // Determinar tipo de busca baseado no formato
            let searchUrl = '';
            let searchType = '';

            // 🔢 NÚMEROS - Buscar ledger
            if (/^[0-9]+$/.test(query)) {
                searchUrl = `${apiUrl}/ledgers/${query}`;
                searchType = 'ledger';
            } 
            // 🏦 ENDEREÇOS STELLAR - Começam com G
            else if (query.length === 56 && query.startsWith('G')) {
                searchUrl = `${apiUrl}/accounts/${query}`;
                searchType = 'account';
            } 
            // 🔤 HASHES DE 64 CARACTERES
            else if (query.length === 64 && /^[a-fA-F0-9]+$/.test(query)) {
                // ⚠️ AVISO ESPECÍFICO PARA HASH DE LEDGER
                setSearchError('⚠️ Hash de ledger detectado! Para buscar ledgers, use o NÚMERO (ex: 12345), não o hash. Hashes de 64 caracteres são apenas para transações.');
                return;
            }
            // 📝 OUTROS FORMATOS INVÁLIDOS
            else {
                setSearchError('❌ Formato inválido! Use: número do ledger (ex: 12345), endereço da conta (começa com G) ou hash de transação (64 caracteres).');
                return;
            }

            const response = await axios.get(searchUrl);
            
            setSearchResult({
                type: searchType,
                data: response.data,
                query: query
            });

            console.log(`✅ Resultado encontrado:`, response.data);

        } catch (err) {
            console.error('❌ Erro na busca:', err);
            if (err.response?.status === 404) {
                setSearchError('❌ Não encontrado. Verifique se o valor está correto e tente novamente.');
            } else {
                setSearchError('❌ Erro ao buscar. Verifique sua conexão e tente novamente.');
            }
        } finally {
            setSearchLoading(false);
        }
    };

    // Função para limpar busca
    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResult(null);
        setSearchError('');
    };

    // Função para detectar Enter
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    // Recarregar dados quando a rede mudar
    useEffect(() => {
        fetchData();
        handleClearSearch(); // Limpar busca ao trocar de rede
    }, [isTestnet]);

    // Auto-refresh a cada 30 segundos
    useEffect(() => {
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [isTestnet]);

    if (loading) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center'
                }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Carregando dados da {networkName}...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: 4
            }}>
                {/* Alerta da Rede Ativa */}
                <Box sx={{ width: '100%', maxWidth: '800px' }}>
                    <Alert 
                        severity={isTestnet ? "warning" : "info"} 
                        icon={<AccountBalanceIcon />}
                        sx={{ 
                            borderRadius: 2,
                            boxShadow: 2
                        }}
                    >
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            🌐 Conectado à rede: <strong>{networkName}</strong>
                        </Typography>
                        <Typography variant="body2">
                            {isTestnet 
                                ? "⚠️ Dados de teste - Não use para transações reais" 
                                : "✅ Rede principal - Dados em tempo real"
                            }
                        </Typography>
                    </Alert>
                </Box>

                {/* Erro */}
                {error && (
                    <Box sx={{ width: '100%', maxWidth: '800px' }}>
                        <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 2 }}>
                            {error}
                        </Alert>
                    </Box>
                )}

                {/* Caixa de Busca */}
                <Box sx={{ width: '100%', maxWidth: '900px' }}>
                    <Card sx={{ 
                        borderRadius: 3,
                        boxShadow: 3,
                        background: 'linear-gradient(135deg, rgba(25,118,210,0.05) 0%, rgba(156,39,176,0.05) 100%)'
                    }}>
                        <CardContent sx={{ p: 4 }}>
                            <Typography 
                                variant="h5" 
                                gutterBottom 
                                sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 'bold',
                                    mb: 3
                                }}
                            >
                                <SearchIcon sx={{ mr: 1, fontSize: 30 }} />
                                🔍 Buscar na Rede Stellar
                            </Typography>
                            
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 2, 
                                alignItems: 'flex-start',
                                flexDirection: { xs: 'column', sm: 'row' }
                            }}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    placeholder="Digite: número do ledger (ex: 12345), endereço da conta (G...) ou hash da transação"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    disabled={searchLoading}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ 
                                        '& .MuiOutlinedInput-root': {
                                            fontFamily: 'monospace',
                                            fontSize: '0.9rem',
                                            borderRadius: 2
                                        }
                                    }}
                                />
                                
                                <Box sx={{ 
                                    display: 'flex', 
                                    gap: 1,
                                    flexDirection: { xs: 'row', sm: 'row' },
                                    width: { xs: '100%', sm: 'auto' }
                                }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearch}
                                        disabled={searchLoading || !searchQuery.trim()}
                                        startIcon={searchLoading ? <CircularProgress size={20} /> : <SearchIcon />}
                                        sx={{ 
                                            minWidth: '120px', 
                                            height: '56px',
                                            borderRadius: 2,
                                            flex: { xs: 1, sm: 'none' }
                                        }}
                                    >
                                        {searchLoading ? 'Buscando...' : 'Buscar'}
                                    </Button>
                                    
                                    <Button
                                        variant="outlined"
                                        onClick={handleClearSearch}
                                        disabled={searchLoading}
                                        startIcon={<ClearIcon />}
                                        sx={{ 
                                            minWidth: '100px', 
                                            height: '56px',
                                            borderRadius: 2,
                                            flex: { xs: 1, sm: 'none' }
                                        }}
                                    >
                                        Limpar
                                    </Button>
                                </Box>
                            </Box>

                            {/* Erro de Busca */}
                            {searchError && (
                                <Alert 
                                    severity="error" 
                                    sx={{ mt: 3, borderRadius: 2 }}
                                    icon={<WarningIcon />}
                                >
                                    {searchError}
                                </Alert>
                            )}

                            {/* Resultado da Busca */}
                            {searchResult && (
                                <Alert severity="success" sx={{ mt: 3, borderRadius: 2 }}>
                                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                        ✅ {searchResult.type === 'ledger' ? 'Ledger' : 
                                             searchResult.type === 'transaction' ? 'Transação' : 'Conta'} encontrado!
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', my: 1 }}>
                                        {searchResult.query}
                                    </Typography>
                                    <Button 
                                        component={Link}
                                        to={`/${searchResult.type}/${searchResult.query}`}
                                        variant="contained"
                                        size="small"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Ver Detalhes
                                    </Button>
                                </Alert>
                            )}

                            {/* 🆕 DICAS DE BUSCA ATUALIZADAS */}
                            <Box sx={{ 
                                mt: 3, 
                                p: 3, 
                                bgcolor: 'background.paper', 
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: 'divider'
                            }}>
                                <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <InfoIcon sx={{ mr: 1 }} />
                                    💡 Guia de Busca
                                </Typography>
                                
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.light', borderRadius: 1, color: 'white' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                🔢 LEDGER
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                Use números: 12345, 50000000
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.light', borderRadius: 1, color: 'white' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                🏦 CONTA
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                Começa com G: GAHK7EEG...
                                            </Typography>
                                        </Box>
                                    </Grid>
                                    
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 1, color: 'white' }}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                📝 TRANSAÇÃO
                                            </Typography>
                                            <Typography variant="caption" display="block">
                                                Hash 64 chars: a1b2c3d4...
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                                
                                <Alert severity="warning" sx={{ mt: 2, borderRadius: 1 }}>
                                    <Typography variant="body2">
                                        ⚠️ <strong>Importante:</strong> Para buscar ledgers, use o <strong>número da sequência</strong>, não o hash! 
                                        Hashes de ledger não são pesquisáveis na API Stellar.
                                    </Typography>
                                </Alert>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                {/* Cards de Estatísticas */}
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Grid container spacing={3} justifyContent="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                textAlign: 'center', 
                                bgcolor: 'primary.dark',
                                borderRadius: 3,
                                boxShadow: 3,
                                height: '100%',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <AccountBalanceIcon sx={{ fontSize: 50, color: 'primary.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Último Ledger
                                    </Typography>
                                    <Typography variant="h4" color="primary.light" sx={{ fontWeight: 'bold' }}>
                                        {ledgers[0]?.sequence || 'Carregando...'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                textAlign: 'center', 
                                bgcolor: 'success.dark',
                                borderRadius: 3,
                                boxShadow: 3,
                                height: '100%',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <ReceiptIcon sx={{ fontSize: 50, color: 'success.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Transações
                                    </Typography>
                                    <Typography variant="h4" color="success.light" sx={{ fontWeight: 'bold' }}>
                                        {ledgers[0]?.successful_transaction_count || 
                                         ledgers[0]?.transaction_count || 
                                         '0'}
                                    </Typography>
                                    <Typography variant="caption" color="success.light" sx={{ display: 'block', mt: 1 }}>
                                        no último ledger
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                textAlign: 'center', 
                                bgcolor: 'warning.dark',
                                borderRadius: 3,
                                boxShadow: 3,
                                height: '100%',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <TrendingUpIcon sx={{ fontSize: 50, color: 'warning.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Operações
                                    </Typography>
                                    <Typography variant="h4" color="warning.light" sx={{ fontWeight: 'bold' }}>
                                        {ledgers[0]?.operation_count || '0'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                textAlign: 'center', 
                                bgcolor: 'info.dark',
                                borderRadius: 3,
                                boxShadow: 3,
                                height: '100%',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 6
                                }
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <SpeedIcon sx={{ fontSize: 50, color: 'info.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Taxa Base
                                    </Typography>
                                    <Typography variant="h4" color="info.light" sx={{ fontWeight: 'bold' }}>
                                        {ledgers[0]?.base_fee_in_stroops || '100'}
                                    </Typography>
                                    <Typography variant="caption" color="info.light" sx={{ display: 'block', mt: 1 }}>
                                        stroops
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Tabelas */}
                <Box sx={{ width: '100%', maxWidth: '1400px' }}>
                    <Grid container spacing={4} justifyContent="center">
                        {/* Ledgers Recentes */}
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ 
                                borderRadius: 3,
                                boxShadow: 3,
                                height: '100%'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            fontWeight: 'bold',
                                            mb: 3
                                        }}
                                    >
                                        <AccountBalanceIcon sx={{ mr: 1 }} />
                                        📊 Ledgers Recentes ({networkName})
                                    </Typography>
                                    <TableContainer 
                                        component={Paper} 
                                        variant="outlined"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'primary.main' }}>
                                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        Ledger
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        Transações
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        Tempo
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {ledgers.slice(0, 8).map((ledger) => (
                                                    <TableRow 
                                                        key={ledger.sequence} 
                                                        hover
                                                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                                    >
                                                        <TableCell>
                                                            <ClickableLedger 
                                                                ledgerNumber={ledger.sequence}
                                                                asChip={true}
                                                                showIcon={true}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={ledger.successful_transaction_count || ledger.transaction_count || 0} 
                                                                color="success" 
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 'bold',
                                                                    '& .MuiChip-label': { color: 'white' }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                                {formatTimeAgo(ledger.closed_at)}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Transações Recentes */}
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ 
                                borderRadius: 3,
                                boxShadow: 3,
                                height: '100%'
                            }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography 
                                        variant="h6" 
                                        gutterBottom 
                                        sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            fontWeight: 'bold',
                                            mb: 3
                                        }}
                                    >
                                        <ReceiptIcon sx={{ mr: 1 }} />
                                        ⚡ Transações Recentes ({networkName})
                                    </Typography>
                                    <TableContainer 
                                        component={Paper} 
                                        variant="outlined"
                                        sx={{ borderRadius: 2 }}
                                    >
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: 'success.main' }}>
                                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        Hash
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        Operações
                                                    </TableCell>
                                                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>
                                                        Tempo
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {transactions.slice(0, 8).map((tx) => (
                                                    <TableRow 
                                                        key={tx.id} 
                                                        hover
                                                        sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                                    >
                                                        <TableCell>
                                                            <ClickableTransaction 
                                                                transactionId={tx.id}
                                                                showIcon={false}
                                                                truncate={true}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip 
                                                                label={tx.operation_count} 
                                                                color="info" 
                                                                size="small"
                                                                sx={{ 
                                                                    fontWeight: 'bold',
                                                                    '& .MuiChip-label': { color: 'white' }
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <AccessTimeIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                                {formatTimeAgo(tx.created_at)}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </Container>
    );
}

export default HomePage;