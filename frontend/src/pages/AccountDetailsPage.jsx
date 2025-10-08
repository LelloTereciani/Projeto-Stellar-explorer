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
    AccountCircle as AccountIcon,
    AccountBalance as BalanceIcon,
    Security as SecurityIcon,
    Receipt as TransactionIcon,
    ArrowBack as BackIcon,
    Home as HomeIcon,
    Visibility as VisibilityIcon,
    Star as StarIcon
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { ClickableHash, ClickableLedger, ClickableTransaction, ClickableAccount } from '../components/ClickableLinks';

function AccountDetailsPage() {
    const { accountId } = useParams();
    const { getApiUrl, isTestnet, networkName } = useAppContext();
    
    const [account, setAccount] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Função para formatar valores XLM
    const formatXLM = (stroops) => {
        return (parseFloat(stroops) / 10000000).toFixed(7);
    };

    // Função para formatar tempo
    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    // Buscar dados da conta
    const fetchAccountData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const apiUrl = getApiUrl();
            console.log(`🔍 Buscando conta: ${accountId}`);

            // Buscar dados da conta e transações em paralelo
            const [accountResponse, transactionsResponse] = await Promise.all([
                axios.get(`${apiUrl}/accounts/${accountId}`),
                axios.get(`${apiUrl}/accounts/${accountId}/transactions?order=desc&limit=20`)
            ]);

            setAccount(accountResponse.data);
            setTransactions(transactionsResponse.data._embedded?.records || []);
            
            console.log('✅ Dados da conta carregados:', accountResponse.data);

        } catch (err) {
            console.error('❌ Erro ao buscar conta:', err);
            if (err.response?.status === 404) {
                setError('Conta não encontrada. Verifique o endereço.');
            } else {
                setError('Erro ao carregar dados da conta. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (accountId) {
            fetchAccountData();
        }
    }, [accountId, isTestnet]);

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
                        Carregando dados da conta...
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
                        <AccountIcon sx={{ mr: 2, fontSize: 40 }} />
                        Detalhes da Conta ({networkName})
                    </Typography>
                </Box>

                {/* Endereço da Conta - CLICÁVEL */}
                <Box sx={{ width: '100%', maxWidth: '1000px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <AccountIcon sx={{ mr: 1 }} />
                                Endereço da Conta (clique para navegar)
                            </Typography>
                            <ClickableHash 
                                hash={accountId}
                                type="account"
                            />
                        </CardContent>
                    </Card>
                </Box>

                {/* Cards de Estatísticas */}
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Grid container spacing={3} justifyContent="center">
                        {/* Saldo XLM */}
                        <Grid item xs={12} sm={6} md={4}>
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
                                    <BalanceIcon sx={{ fontSize: 50, color: 'primary.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Saldo XLM
                                    </Typography>
                                    <Typography variant="h4" color="primary.light" sx={{ fontWeight: 'bold' }}>
                                        {account?.balances?.find(b => b.asset_type === 'native')?.balance || '0'}
                                    </Typography>
                                    <Typography variant="caption" color="primary.light">
                                        Lumens
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Sequência */}
                        <Grid item xs={12} sm={6} md={4}>
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
                                    <SecurityIcon sx={{ fontSize: 50, color: 'success.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Sequência
                                    </Typography>
                                    <Typography variant="h4" color="success.light" sx={{ fontWeight: 'bold' }}>
                                        {account?.sequence || '0'}
                                    </Typography>
                                    <Typography variant="caption" color="success.light">
                                        Número da transação
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Subentradas */}
                        <Grid item xs={12} sm={6} md={4}>
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
                                    <StarIcon sx={{ fontSize: 50, color: 'warning.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Subentradas
                                    </Typography>
                                    <Typography variant="h4" color="warning.light" sx={{ fontWeight: 'bold' }}>
                                        {account?.subentry_count || '0'}
                                    </Typography>
                                    <Typography variant="caption" color="warning.light">
                                        Trustlines, ofertas, etc.
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Saldos de Assets */}
                {account?.balances && account.balances.length > 0 && (
                    <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                    <BalanceIcon sx={{ mr: 1 }} />
                                    💰 Saldos de Assets
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Asset</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Saldo</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Limite</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Emissor</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {account.balances.map((balance, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>
                                                        <Chip 
                                                            label={balance.asset_type === 'native' ? 'XLM' : balance.asset_code}
                                                            color={balance.asset_type === 'native' ? 'primary' : 'secondary'}
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                                                        {parseFloat(balance.balance).toLocaleString('pt-BR')}
                                                    </TableCell>
                                                    <TableCell sx={{ fontFamily: 'monospace' }}>
                                                        {balance.limit || 'Ilimitado'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {/* EMISSOR CLICÁVEL */}
                                                        <ClickableAccount 
                                                            accountId={balance.asset_issuer}
                                                            variant="body2"
                                                            truncate={true}
                                                            sx={{ fontSize: '0.8rem' }}
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Signatários - COM CHAVES CLICÁVEIS */}
                {account?.signers && account.signers.length > 0 && (
                    <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                    <SecurityIcon sx={{ mr: 1 }} />
                                    🔐 Signatários da Conta
                                </Typography>
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'success.main' }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Chave Pública</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Peso</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {account.signers.map((signer, index) => (
                                                <TableRow key={index} hover>
                                                    <TableCell>
                                                        {/* CHAVE PÚBLICA CLICÁVEL */}
                                                        <ClickableAccount 
                                                            accountId={signer.key}
                                                            variant="body2"
                                                            truncate={false}
                                                            sx={{ fontSize: '0.9rem' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={signer.weight}
                                                            color="info"
                                                            size="small"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={signer.type}
                                                            color="secondary"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardContent>
                        </Card>
                    </Box>
                )}

                {/* Transações Recentes - COM LINKS CLICÁVEIS */}
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <TransactionIcon sx={{ mr: 1 }} />
                                📋 Transações Recentes
                            </Typography>
                            {transactions.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'warning.main' }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Hash</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ledger</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Operações</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Data</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ações</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {transactions.slice(0, 10).map((tx) => (
                                                <TableRow key={tx.id} hover>
                                                    <TableCell>
                                                        {/* HASH DA TRANSAÇÃO CLICÁVEL */}
                                                        <ClickableTransaction 
                                                            transactionId={tx.id}
                                                            variant="body2"
                                                            truncate={true}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {/* LEDGER CLICÁVEL */}
                                                        <ClickableLedger 
                                                            ledgerNumber={tx.ledger}
                                                            asChip={true}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={tx.operation_count}
                                                            color="info"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.9rem' }}>
                                                        {formatTime(tx.created_at)}
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
                                    Nenhuma transação encontrada para esta conta.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default AccountDetailsPage;