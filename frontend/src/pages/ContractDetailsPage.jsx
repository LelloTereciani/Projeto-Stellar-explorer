import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Alert,
    Grid,
    Chip,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import {
    Memory as ContractIcon,
    ArrowBack as BackIcon,
    Home as HomeIcon,
    OpenInNew as OpenInNewIcon,
    Storage as StorageIcon,
    Event as EventIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { ClickableTransaction } from '../components/ClickableLinks';

const isValidContractId = (contractId) => {
    return Boolean(contractId && /^C[A-Z2-7]{55}$/i.test(contractId));
};

const formatBytes = (value) => {
    if (!value && value !== 0) return 'N/A';
    return `${value} bytes`;
};

const formatDateTime = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleString('pt-BR');
};

const buildSummaryFromExpert = (data, network) => {
    if (!data || !data.contract) return null;
    return {
        contractId: data.contract,
        network,
        status: 'active',
        executableType: 'wasm',
        wasmHash: data.wasm || null,
        codeHash: data.wasm || null,
        codeSize: null,
        createdLedger: null,
        createdAt: data.created ? new Date(data.created * 1000).toISOString() : null,
        creator: data.creator || null,
        lastModifiedLedger: null,
        latestLedger: null,
        oldestLedger: null,
        ledgerRetentionWindow: null,
        storageCount: data.storage_entries ?? null,
        storage: [],
        admin: null,
        owner: null,
        source: 'stellar-expert'
    };
};

const stringifyValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'string') return value;
    try {
        return JSON.stringify(value, null, 2);
    } catch {
        return String(value);
    }
};

function ContractDetailsPage() {
    const { contractId } = useParams();
    const { isTestnet, networkName, getBackendUrl } = useAppContext();

    const network = isTestnet ? 'testnet' : 'mainnet';
    const backendUrl = getBackendUrl().replace(/\/$/, '');

    const explorerUrl = isTestnet
        ? `https://stellar.expert/explorer/testnet/contract/${contractId}`
        : `https://stellar.expert/explorer/public/contract/${contractId}`;

    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [eventsData, setEventsData] = useState({ events: [], invocations: [], cursor: null, warning: null });
    const [eventsLoading, setEventsLoading] = useState(true);
    const [eventsError, setEventsError] = useState('');

    const valid = isValidContractId(contractId);

    const sourceLabel = (source) => {
        if (!source) return null;
        if (source === 'stellar-expert') return 'StellarExpert';
        if (source === 'soroban-rpc+stellar-expert') return 'Soroban RPC + StellarExpert';
        return 'Soroban RPC';
    };

    const buildInvocations = (events) => {
        const seen = new Set();
        const invocations = [];
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
        return invocations;
    };

    const mergeEvents = (prevEvents, nextEvents) => {
        const ids = new Set(prevEvents.map((event) => event.id));
        const merged = [...prevEvents];
        for (const event of nextEvents) {
            if (!ids.has(event.id)) {
                merged.push(event);
            }
        }
        return merged;
    };

    const fetchSummary = async () => {
        if (!valid) return;
        try {
            setLoading(true);
            setError('');
            const { data } = await axios.get(`${backendUrl}/api/contracts/${contractId}`, {
                params: { network }
            });
            setSummary(data);
        } catch (err) {
            let handled = false;
            try {
                const expertBase = network === 'testnet'
                    ? 'https://api.stellar.expert/explorer/testnet'
                    : 'https://api.stellar.expert/explorer/public';
                const { data } = await axios.get(`${expertBase}/contract/${contractId}`);
                const expertSummary = buildSummaryFromExpert(data, network);
                if (expertSummary) {
                    setSummary(expertSummary);
                    handled = true;
                }
            } catch (expertError) {
                handled = false;
            }

            if (!handled) {
                if (err.response?.status === 404) {
                    setError('Contrato não encontrado nesta rede.');
                } else {
                    setError('Erro ao carregar detalhes do contrato.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async (cursor = null) => {
        if (!valid) return;
        try {
            setEventsLoading(true);
            setEventsError('');
            const { data } = await axios.get(`${backendUrl}/api/contracts/${contractId}/events`, {
                params: {
                    network,
                    limit: 20,
                    cursor: cursor || undefined
                }
            });

            setEventsData((prev) => {
                const mergedEvents = cursor ? mergeEvents(prev.events, data.events || []) : (data.events || []);
                return {
                    ...data,
                    warning: data.warning || null,
                    events: mergedEvents,
                    invocations: buildInvocations(mergedEvents)
                };
            });
        } catch (err) {
            setEventsError('Eventos indisponíveis no momento. Tente novamente.');
        } finally {
            setEventsLoading(false);
        }
    };

    useEffect(() => {
        setSummary(null);
        setEventsData({ events: [], invocations: [], cursor: null });
        if (valid) {
            fetchSummary();
            fetchEvents();
        }
    }, [contractId, network]);

    if (!valid) {
        return (
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    ID de contrato inválido. O formato correto começa com "C" e tem 56 caracteres.
                </Alert>
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
                        <ContractIcon sx={{ mr: 2, fontSize: 40 }} />
                        Contrato Soroban ({networkName})
                    </Typography>
                </Box>

                <Box sx={{ width: '100%', maxWidth: '1000px' }}>
                    <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
                        ID do Contrato
                    </Typography>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontFamily: 'monospace',
                                    wordBreak: 'break-all',
                                    bgcolor: 'background.paper',
                                    p: 2,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    textAlign: 'center'
                                }}
                            >
                                {contractId}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CircularProgress size={32} />
                        <Typography>Carregando detalhes do contrato...</Typography>
                    </Box>
                )}

                {error && (
                    <Box sx={{ width: '100%', maxWidth: '800px' }}>
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {error}
                        </Alert>
                    </Box>
                )}

                        {summary && (
                            <>
                                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                                    <Grid container spacing={3}>
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Status
                                            </Typography>
                                            <Chip
                                                label={summary.status === 'active' ? 'Ativo' : 'Não encontrado'}
                                                color={summary.status === 'active' ? 'success' : 'default'}
                                                sx={{ mt: 1 }}
                                            />
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Última modificação (ledger)
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {summary.lastModifiedLedger || 'N/A'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Ledger de criação
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {summary.createdLedger || 'Indisponível'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Criado em: {formatDateTime(summary.createdAt)}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Último ledger na RPC
                                            </Typography>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                {summary.latestLedger || 'N/A'}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                    </Grid>
                                    {summary.source && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <Chip
                                                label={`Fonte: ${sourceLabel(summary.source)}`}
                                                size="small"
                                                color="info"
                                            />
                                        </Box>
                                    )}
                                    {summary.warning && (
                                        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                                            {summary.warning}
                                        </Alert>
                                    )}
                                    <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                                        Ledger de criação completo e todo o storage persistente dependem de indexador.
                                        Esta visão usa somente Soroban RPC e está limitada à janela de retenção da rede.
                                    </Alert>
                                </Box>

                                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Métricas do Contrato
                                            </Typography>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Invocações
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {summary.invocations ?? 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Sub-invocações
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {summary.subinvocations ?? 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Eventos (indexados)
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {summary.eventsCount ?? 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Erros
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {summary.errorsCount ?? 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Storage entries (indexado)
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {summary.storageEntries ?? 'N/A'}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} sm={6} md={3}>
                                                    <Typography variant="subtitle2" color="text.secondary">
                                                        Validação
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                        {summary.validationStatus || 'N/A'}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                </Box>

                                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                        <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Código do Contrato
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                WASM hash
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                {summary.wasmHash || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Tamanho
                                            </Typography>
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {formatBytes(summary.codeSize)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={3}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Tipo
                                            </Typography>
                                            <Typography sx={{ fontWeight: 'bold' }}>
                                                {summary.executableType === 'wasm' ? 'WASM' : 'Stellar Asset'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 2 }}>
                                        <Typography variant="subtitle2" color="text.secondary">
                                            Code hash
                                        </Typography>
                                        <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                            {summary.codeHash || 'N/A'}
                                        </Typography>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Box>

                        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom>
                                        Administração
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Admin
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                {stringifyValue(summary.admin)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Owner
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                {stringifyValue(summary.owner)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle2" color="text.secondary">
                                                Criador
                                            </Typography>
                                            <Typography sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                {stringifyValue(summary.creator)}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Box>

                        <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                                <CardContent>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <StorageIcon /> Storage (Instância)
                                    </Typography>
                                    {summary.storageCount === 0 && (
                                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                                            Nenhum item de storage de instância encontrado. Nem todo contrato expõe dados nessa camada.
                                        </Alert>
                                    )}
                                    {summary.storageCount > 0 && summary.storage.length === 0 && (
                                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                                            Este contrato possui entradas de storage, mas a RPC não retornou o conteúdo completo.
                                        </Alert>
                                    )}
                                    {summary.storageCount > 0 && (
                                        <TableContainer component={Paper} sx={{ mt: 2 }}>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell><strong>Chave</strong></TableCell>
                                                        <TableCell><strong>Valor</strong></TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {summary.storage.map((entry, index) => (
                                                        <TableRow key={`${entry.key}-${index}`}>
                                                            <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                                                                {stringifyValue(entry.key)}
                                                            </TableCell>
                                                            <TableCell sx={{ fontFamily: 'monospace', wordBreak: 'break-all', whiteSpace: 'pre-wrap' }}>
                                                                {stringifyValue(entry.value)}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    )}
                                    <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
                                        A RPC Soroban não lista todo o storage persistente. Esse painel mostra apenas dados de instância.
                                    </Alert>
                                </CardContent>
                            </Card>
                        </Box>
                    </>
                )}

                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <EventIcon /> Eventos Recentes
                            </Typography>

                            {eventsLoading && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <CircularProgress size={24} />
                                    <Typography>Carregando eventos...</Typography>
                                </Box>
                            )}

                            {eventsError && (
                                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                    {eventsError}
                                </Alert>
                            )}

                            {!eventsError && eventsData.warning && (
                                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                                    {eventsData.warning}
                                </Alert>
                            )}

                            {!eventsLoading && !eventsError && eventsData.events.length === 0 && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Nenhum evento encontrado na janela de retenção da RPC.
                                </Alert>
                            )}

                            {eventsData.events.length > 0 && (
                                <>
                                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell><strong>Ledger</strong></TableCell>
                                                    <TableCell><strong>Tx</strong></TableCell>
                                                    <TableCell><strong>Topics</strong></TableCell>
                                                    <TableCell><strong>Value</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {eventsData.events.map((event) => (
                                                    <TableRow key={event.id}>
                                                        <TableCell>{event.ledger}</TableCell>
                                                        <TableCell>
                                                            <ClickableTransaction transactionId={event.txHash} />
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                                            {stringifyValue(event.topicJson)}
                                                        </TableCell>
                                                        <TableCell sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                                            {stringifyValue(event.valueJson)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {eventsData.cursor && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => fetchEvents(eventsData.cursor)}
                                                disabled={eventsLoading}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Carregar mais
                                            </Button>
                                        </Box>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <HistoryIcon /> Invocações Recentes
                            </Typography>
                            {eventsData.invocations.length === 0 && (
                                <Alert severity="info" sx={{ borderRadius: 2 }}>
                                    Nenhuma invocação encontrada no período recente da RPC.
                                </Alert>
                            )}
                            {eventsData.invocations.length > 0 && (
                                <TableContainer component={Paper} sx={{ mt: 2 }}>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell><strong>Tx</strong></TableCell>
                                                <TableCell><strong>Ledger</strong></TableCell>
                                                <TableCell><strong>Status</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {eventsData.invocations.map((invocation) => (
                                                <TableRow key={invocation.txHash}>
                                                    <TableCell>
                                                        <ClickableTransaction transactionId={invocation.txHash} />
                                                    </TableCell>
                                                    <TableCell>{invocation.ledger}</TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={invocation.success ? 'Sucesso' : 'Falha'}
                                                            color={invocation.success ? 'success' : 'default'}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Box>

                <Box sx={{ width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'center' }}>
                    <Button
                        component="a"
                        href={explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        variant="contained"
                        startIcon={<OpenInNewIcon />}
                        sx={{ borderRadius: 2 }}
                    >
                        Abrir no StellarExpert
                    </Button>
                </Box>
            </Box>
        </Container>
    );
}

export default ContractDetailsPage;
