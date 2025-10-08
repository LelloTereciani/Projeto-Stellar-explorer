import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
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
    Button
} from '@mui/material';
import {
    AccountBalance as LedgerIcon,
    Receipt as TransactionIcon,
    TrendingUp as OperationIcon,
    ArrowBack as BackIcon,
    Home as HomeIcon,
    Visibility as VisibilityIcon,
    AccessTime as TimeIcon
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { ClickableTransaction, ClickableAccount, LedgerHashDisplay } from '../components/ClickableLinks';

function LedgerDetailsPage() {
    const { ledgerId } = useParams();
    const { getApiUrl, isTestnet, networkName } = useAppContext();
    
    const [ledger, setLedger] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const formatTimeAgo = (dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
        return `${Math.floor(diffInSeconds / 86400)}d atrás`;
    };

    const fetchLedgerData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const apiUrl = getApiUrl();
            console.log(`🔍 Buscando ledger: ${ledgerId}`);

            const [ledgerResponse, transactionsResponse] = await Promise.all([
                axios.get(`${apiUrl}/ledgers/${ledgerId}`),
                axios.get(`${apiUrl}/ledgers/${ledgerId}/transactions?order=desc&limit=50`)
            ]);

            setLedger(ledgerResponse.data);
            setTransactions(transactionsResponse.data._embedded?.records || []);
            
            console.log('✅ Dados do ledger carregados:', ledgerResponse.data);

        } catch (err) {
            console.error('❌ Erro ao buscar ledger:', err);
            if (err.response?.status === 404) {
                setError('Ledger não encontrado. Verifique o número.');
            } else {
                setError('Erro ao carregar dados do ledger. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (ledgerId) {
            fetchLedgerData();
        }
    }, [ledgerId, isTestnet]);

    if (loading) {
        return (
            <Container maxWidth="xl">
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    minHeight: '60vh'
                }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Carregando dados do ledger...
                    </Typography>
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: 3
                }}>
                    <Box sx={{ width: '100%', maxWidth: '800px' }}>
                        <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 2 }}>
                            {error}
                        </Alert>
                    </Box>
                    
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            component={Link}
                            to="/"
                            startIcon={<HomeIcon />}
                            variant="contained"
                            sx={{ borderRadius: 2 }}
                        >
                            Voltar ao Início
                        </Button>
                    </Box>
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
                {/* Cabeçalho com Navegação */}
                <Box sx={{ width: '100%', maxWidth: '1400px' }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                        <Button
                            component={Link}
                            to="/"
                            startIcon={<HomeIcon />}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            Início
                        </Button>
                        <Button
                            onClick={() => window.history.back()}
                            startIcon={<BackIcon />}
                            variant="outlined"
                            sx={{ borderRadius: 2 }}
                        >
                            Voltar
                        </Button>
                    </Box>
                    
                    <Typography 
                        variant="h4" 
                        gutterBottom 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <LedgerIcon sx={{ mr: 2, fontSize: 40 }} />
                        Ledger #{ledger?.sequence} ({networkName})
                    </Typography>
                </Box>

                {/* Hash do Ledger - SEM LINK */}
                <Box sx={{ width: '100%', maxWidth: '1000px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <LedgerIcon sx={{ mr: 1 }} />
                                Hash do Ledger
                            </Typography>
                            <LedgerHashDisplay 
                                hash={ledger?.hash}
                            />
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
                                    <TransactionIcon sx={{ fontSize: 50, color: 'primary.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Transações
                                    </Typography>
                                    <Typography variant="h4" color="primary.light" sx={{ fontWeight: 'bold' }}>
                                        {ledger?.successful_transaction_count || 0}
                                    </Typography>
                                    <Typography variant="caption" color="primary.light">
                                        Bem-sucedidas
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
                                    <OperationIcon sx={{ fontSize: 50, color: 'success.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Operações
                                    </Typography>
                                    <Typography variant="h4" color="success.light" sx={{ fontWeight: 'bold' }}>
                                        {ledger?.operation_count || 0}
                                    </Typography>
                                    <Typography variant="caption" color="success.light">
                                        Total
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
                                    <TimeIcon sx={{ fontSize: 50, color: 'warning.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Fechado em
                                    </Typography>
                                    <Typography variant="h6" color="warning.light" sx={{ fontWeight: 'bold' }}>
                                        {ledger?.closed_at ? formatTime(ledger.closed_at) : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" color="warning.light">
                                        {ledger?.closed_at ? formatTimeAgo(ledger.closed_at) : ''}
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
                                    <LedgerIcon sx={{ fontSize: 50, color: 'info.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Taxa Base
                                    </Typography>
                                    <Typography variant="h4" color="info.light" sx={{ fontWeight: 'bold' }}>
                                        {ledger?.base_fee_in_stroops || '100'}
                                    </Typography>
                                    <Typography variant="caption" color="info.light">
                                        stroops
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Detalhes Técnicos */}
                <Box sx={{ width: '100%', maxWidth: '1000px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <LedgerIcon sx={{ mr: 1 }} />
                                🔧 Detalhes Técnicos
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Hash Anterior:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 2, wordBreak: 'break-all' }}>
                                        {ledger?.prev_hash}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Versão do Protocolo:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {ledger?.protocol_version}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Total de Moedas:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {ledger?.total_coins ? `${(parseFloat(ledger.total_coins) / 10000000).toLocaleString('pt-BR')} XLM` : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Pool de Taxas:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {ledger?.fee_pool ? `${(parseFloat(ledger.fee_pool) / 10000000).toLocaleString('pt-BR')} XLM` : 'N/A'}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>

                {/* Transações do Ledger - COM LINKS CLICÁVEIS */}
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <TransactionIcon sx={{ mr: 1 }} />
                                📋 Transações do Ledger ({transactions.length})
                            </Typography>
                            {transactions.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hash</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Conta Origem</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Operações</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Taxa</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {transactions.map((tx) => (
                                                <TableRow key={tx.id} hover>
                                                    <TableCell>
                                                        <ClickableTransaction 
                                                            transactionId={tx.id}
                                                            variant="body2"
                                                            truncate={true}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <ClickableAccount 
                                                            accountId={tx.source_account}
                                                            variant="body2"
                                                            truncate={true}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={tx.operation_count}
                                                            color="info"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={`${tx.fee_charged || 0} stroops`}
                                                            color="warning"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            component={Link}
                                                            to={`/transaction/${tx.id}`}
                                                            size="small"
                                                            startIcon={<VisibilityIcon />}
                                                            variant="outlined"
                                                            sx={{ borderRadius: 2 }}
                                                        >
                                                            Ver
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Nenhuma transação encontrada neste ledger.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default LedgerDetailsPage;