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
    Receipt as TransactionIcon,
    AccountBalance as LedgerIcon,
    Person as AccountIcon,
    Settings as OperationIcon,
    ArrowBack as BackIcon,
    Home as HomeIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { ClickableHash, ClickableLedger, ClickableAccount } from '../components/ClickableLinks';

function TransactionDetailsPage() {
    const { transactionId } = useParams();
    const { getApiUrl, isTestnet, networkName } = useAppContext();
    
    const [transaction, setTransaction] = useState(null);
    const [operations, setOperations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const formatTime = (dateString) => {
        return new Date(dateString).toLocaleString('pt-BR');
    };

    const formatOperationType = (type) => {
        const types = {
            'payment': 'Pagamento',
            'create_account': 'Criar Conta',
            'path_payment_strict_receive': 'Pagamento com Caminho',
            'manage_sell_offer': 'Gerenciar Oferta de Venda',
            'manage_buy_offer': 'Gerenciar Oferta de Compra',
            'set_options': 'Definir Opções',
            'change_trust': 'Alterar Confiança',
            'allow_trust': 'Permitir Confiança',
            'account_merge': 'Fusão de Conta',
            'inflation': 'Inflação',
            'manage_data': 'Gerenciar Dados',
            'bump_sequence': 'Aumentar Sequência'
        };
        return types[type] || type;
    };

    const fetchTransactionData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const apiUrl = getApiUrl();
            console.log(`🔍 Buscando transação: ${transactionId}`);

            const [transactionResponse, operationsResponse] = await Promise.all([
                axios.get(`${apiUrl}/transactions/${transactionId}`),
                axios.get(`${apiUrl}/transactions/${transactionId}/operations`)
            ]);

            setTransaction(transactionResponse.data);
            setOperations(operationsResponse.data._embedded?.records || []);
            
            console.log('✅ Dados da transação carregados:', transactionResponse.data);

        } catch (err) {
            console.error('❌ Erro ao buscar transação:', err);
            if (err.response?.status === 404) {
                setError('Transação não encontrada. Verifique o hash.');
            } else {
                setError('Erro ao carregar dados da transação. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (transactionId) {
            fetchTransactionData();
        }
    }, [transactionId, isTestnet]);

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
                        Carregando dados da transação...
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
                        <TransactionIcon sx={{ mr: 2, fontSize: 40 }} />
                        Detalhes da Transação ({networkName})
                    </Typography>
                </Box>

                {/* Hash da Transação - CLICÁVEL */}
                <Box sx={{ width: '100%', maxWidth: '1000px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TransactionIcon sx={{ mr: 1 }} />
                                Hash da Transação (clique para navegar)
                            </Typography>
                            <ClickableHash 
                                hash={transactionId}
                                type="transaction"
                            />
                        </CardContent>
                    </Card>
                </Box>

                {/* Cards de Estatísticas */}
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Grid container spacing={3} justifyContent="center">
                        {/* Status */}
                        <Grid item xs={12} sm={6} md={3}>
                            <Card sx={{ 
                                textAlign: 'center', 
                                bgcolor: transaction?.successful ? 'success.dark' : 'error.dark',
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
                                    {transaction?.successful ? 
                                        <SuccessIcon sx={{ fontSize: 50, color: 'success.light', mb: 2 }} /> :
                                        <ErrorIcon sx={{ fontSize: 50, color: 'error.light', mb: 2 }} />
                                    }
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Status
                                    </Typography>
                                    <Typography variant="h5" color={transaction?.successful ? 'success.light' : 'error.light'} sx={{ fontWeight: 'bold' }}>
                                        {transaction?.successful ? 'Sucesso' : 'Falhou'}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Ledger - CLICÁVEL */}
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
                                    <LedgerIcon sx={{ fontSize: 50, color: 'primary.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Ledger
                                    </Typography>
                                    <ClickableLedger 
                                        ledgerNumber={transaction?.ledger}
                                        variant="h4"
                                        sx={{ 
                                            color: 'primary.light',
                                            fontWeight: 'bold',
                                            '&:hover': { color: 'white' }
                                        }}
                                    />
                                    <Button
                                        component={Link}
                                        to={`/ledger/${transaction?.ledger}`}
                                        size="small"
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 1, borderRadius: 2 }}
                                    >
                                        Ver Ledger
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Operações */}
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
                                    <OperationIcon sx={{ fontSize: 50, color: 'info.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Operações
                                    </Typography>
                                    <Typography variant="h4" color="info.light" sx={{ fontWeight: 'bold' }}>
                                        {transaction?.operation_count || 0}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Taxa */}
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
                                    <TransactionIcon sx={{ fontSize: 50, color: 'warning.light', mb: 2 }} />
                                    <Typography variant="h6" color="white" sx={{ mb: 1 }}>
                                        Taxa Paga
                                    </Typography>
                                    <Typography variant="h4" color="warning.light" sx={{ fontWeight: 'bold' }}>
                                        {transaction?.fee_charged || 0}
                                    </Typography>
                                    <Typography variant="caption" color="warning.light">
                                        stroops
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Detalhes da Transação - COM CONTA CLICÁVEL */}
                <Box sx={{ width: '100%', maxWidth: '1000px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <AccountIcon sx={{ mr: 1 }} />
                                👤 Detalhes da Transação
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Conta Origem (clique para ver detalhes):</strong>
                                    </Typography>
                                    <Box sx={{ mt: 1 }}>
                                        <ClickableAccount 
                                            accountId={transaction?.source_account}
                                            variant="body1"
                                            truncate={false}
                                            showIcon={true}
                                            sx={{ 
                                                wordBreak: 'break-all',
                                                fontSize: '0.9rem'
                                            }}
                                        />
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Sequência:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {transaction?.source_account_sequence}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Criado em:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {transaction?.created_at ? formatTime(transaction.created_at) : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Max Taxa:</strong>
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        {transaction?.max_fee} stroops
                                    </Typography>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Box>

                {/* Operações - COM CONTAS CLICÁVEIS */}
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                <OperationIcon sx={{ mr: 1 }} />
                                ⚙️ Operações ({operations.length})
                            </Typography>
                            {operations.length > 0 ? (
                                <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow sx={{ bgcolor: 'info.main' }}>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>ID</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tipo</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Conta Origem</TableCell>
                                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Detalhes</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {operations.map((operation, index) => (
                                                <TableRow key={operation.id} hover>
                                                    <TableCell>
                                                        <Chip 
                                                            label={`#${index + 1}`}
                                                            color="primary"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip 
                                                            label={formatOperationType(operation.type)}
                                                            color="secondary"
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <ClickableAccount 
                                                            accountId={operation.source_account}
                                                            variant="body2"
                                                            truncate={true}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ fontSize: '0.9rem' }}>
                                                        {operation.type === 'payment' && (
                                                            <Box>
                                                                <Typography variant="caption" display="block">
                                                                    <strong>Para:</strong> 
                                                                </Typography>
                                                                <ClickableAccount 
                                                                    accountId={operation.to}
                                                                    variant="caption"
                                                                    truncate={true}
                                                                />
                                                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                                    <strong>Valor:</strong> {operation.amount} {operation.asset_type === 'native' ? 'XLM' : operation.asset_code}
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {operation.type === 'create_account' && (
                                                            <Box>
                                                                <Typography variant="caption" display="block">
                                                                    <strong>Nova Conta:</strong>
                                                                </Typography>
                                                                <ClickableAccount 
                                                                    accountId={operation.account}
                                                                    variant="caption"
                                                                    truncate={true}
                                                                />
                                                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                                                    <strong>Saldo Inicial:</strong> {operation.starting_balance} XLM
                                                                </Typography>
                                                            </Box>
                                                        )}
                                                        {!['payment', 'create_account'].includes(operation.type) && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                Ver detalhes completos na API
                                                            </Typography>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            ) : (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Nenhuma operação encontrada para esta transação.
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Container>
    );
}

export default TransactionDetailsPage;