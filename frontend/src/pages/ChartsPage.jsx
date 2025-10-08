import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area,
    ScatterChart,
    Scatter
} from 'recharts';
import {
    Home as HomeIcon,
    Refresh as RefreshIcon,
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';

// Cores para os gráficos
const COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f', '#0288d1'];

function ChartsPage() {
    const { getApiUrl, isTestnet, networkName } = useAppContext();
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('24h');
    
    // Estados para dados dos gráficos
    const [transactionData, setTransactionData] = useState([]);
    const [operationData, setOperationData] = useState([]);
    const [volumeData, setVolumeData] = useState([]);
    const [scatterData, setScatterData] = useState([]);
    const [topLedgers, setTopLedgers] = useState([]);

    // Formatadores para tooltips
    const formatNumber = (value) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toString();
    };

    // Buscar dados para os gráficos
    const fetchChartsData = async () => {
        try {
            setLoading(true);
            setError('');
            
            const apiUrl = getApiUrl();
            console.log(`📊 Buscando dados para gráficos da ${networkName}`);

            // Determinar limite baseado no período
            const limit = timeRange === '1h' ? 12 : timeRange === '6h' ? 36 : timeRange === '24h' ? 100 : 200;

            // Buscar dados dos últimos ledgers
            const ledgersResponse = await axios.get(`${apiUrl}/ledgers?order=desc&limit=${limit}`);
            const ledgers = ledgersResponse.data._embedded?.records || [];

            if (ledgers.length === 0) {
                setError('Nenhum dado encontrado para o período selecionado.');
                return;
            }

            // Processar dados para os gráficos
            processChartsData(ledgers);
            
            console.log(`✅ Dados dos gráficos carregados da ${networkName}`, { ledgers: ledgers.length });
        } catch (err) {
            console.error(`❌ Erro ao buscar dados dos gráficos da ${networkName}:`, err);
            setError(`Erro ao carregar dados dos gráficos da ${networkName}. Tente novamente.`);
        } finally {
            setLoading(false);
        }
    };

    // Processar dados para os gráficos
    const processChartsData = (ledgers) => {
        const reversedLedgers = [...ledgers].reverse(); // Ordem cronológica

        // 1. Gráfico de Barras - Transações por Ledger (últimos 20)
        const transactionChart = reversedLedgers.slice(-20).map((ledger, index) => ({
            ledger: ledger.sequence,
            ledgerLabel: `#${ledger.sequence}`,
            transacoes: ledger.successful_transaction_count || 0,
            operacoes: ledger.operation_count || 0,
            index: index
        }));

        // 2. Gráfico de Linha - Operações ao Longo do Tempo (últimos 30)
        const operationChart = reversedLedgers.slice(-30).map((ledger, index) => ({
            ledger: ledger.sequence,
            ledgerLabel: `#${ledger.sequence}`,
            operacoes: ledger.operation_count || 0,
            transacoes: ledger.successful_transaction_count || 0,
            index: index
        }));

        // 3. Gráfico de Área - Volume Acumulado de Transações (últimos 25)
        let accumulated = 0;
        const volumeChart = reversedLedgers.slice(-25).map((ledger, index) => {
            accumulated += (ledger.successful_transaction_count || 0);
            return {
                ledger: ledger.sequence,
                ledgerLabel: `#${ledger.sequence}`,
                volume: accumulated,
                incremento: ledger.successful_transaction_count || 0,
                index: index
            };
        });

        // 4. Gráfico de Scatter - Transações vs Operações (últimos 50)
        const scatterChart = reversedLedgers.slice(-50)
            .filter(ledger => (ledger.successful_transaction_count || 0) > 0 || (ledger.operation_count || 0) > 0)
            .map((ledger) => ({
                x: ledger.successful_transaction_count || 0,
                y: ledger.operation_count || 0,
                ledger: ledger.sequence,
                ledgerLabel: `Ledger #${ledger.sequence}`,
                transacoes: ledger.successful_transaction_count || 0,
                operacoes: ledger.operation_count || 0
            }));

        // 5. Top 10 Ledgers por Operações
        const topLedgersChart = [...ledgers]
            .filter(ledger => {
                const opCount = ledger.operation_count || 0;
                const txCount = ledger.successful_transaction_count || 0;
                return opCount > 0 || txCount > 0;
            })
            .sort((a, b) => {
                const aOps = a.operation_count || 0;
                const bOps = b.operation_count || 0;
                if (bOps !== aOps) return bOps - aOps;
                
                const aTxs = a.successful_transaction_count || 0;
                const bTxs = b.successful_transaction_count || 0;
                return bTxs - aTxs;
            })
            .slice(0, 10)
            .map((ledger, index) => ({
                ledger: `#${ledger.sequence}`,
                ledgerNum: ledger.sequence,
                operacoes: ledger.operation_count || 0,
                transacoes: ledger.successful_transaction_count || 0,
                rank: index + 1
            }));

        console.log('📊 Top 10 Ledgers processados:', {
            total: topLedgersChart.length,
            primeiro: topLedgersChart[0],
            hasData: topLedgersChart.some(l => l.operacoes > 0),
            dadosCompletos: topLedgersChart.slice(0, 3)
        });

        // Atualizar estados
        setTransactionData(transactionChart);
        setOperationData(operationChart);
        setVolumeData(volumeChart);
        setScatterData(scatterChart);
        setTopLedgers(topLedgersChart);
    };

    // Custom Tooltip Components
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{`Ledger: ${label}`}</p>
                    {payload.map((entry, index) => (
                        <p key={index} style={{ margin: '2px 0', color: entry.color }}>
                            {`${entry.name}: ${formatNumber(entry.value)}`}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    // Custom Scatter Tooltip
    const ScatterTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '10px',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
                }}>
                    <p style={{ margin: 0, fontWeight: 'bold' }}>{data.ledgerLabel}</p>
                    <p style={{ margin: '2px 0', color: COLORS[0] }}>
                        {`Transações: ${formatNumber(data.transacoes)}`}
                    </p>
                    <p style={{ margin: '2px 0', color: COLORS[1] }}>
                        {`Operações: ${formatNumber(data.operacoes)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    // Carregar dados quando componente monta ou período muda
    useEffect(() => {
        fetchChartsData();
    }, [isTestnet, timeRange]);

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
                        Carregando dados dos gráficos...
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
                {/* Cabeçalho */}
                <Box sx={{ width: '100%', maxWidth: '1400px' }}>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                component={Link}
                                to="/"
                                startIcon={<HomeIcon />}
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            >
                                Voltar ao Início
                            </Button>
                            <Button
                                onClick={fetchChartsData}
                                startIcon={<RefreshIcon />}
                                variant="outlined"
                                disabled={loading}
                                sx={{ borderRadius: 2 }}
                            >
                                Atualizar
                            </Button>
                        </Box>

                        {/* Seletor de Período */}
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                            <InputLabel>Período</InputLabel>
                            <Select
                                value={timeRange}
                                label="Período"
                                onChange={(e) => setTimeRange(e.target.value)}
                                sx={{ borderRadius: 2 }}
                            >
                                <MenuItem value="1h">1 Hora</MenuItem>
                                <MenuItem value="6h">6 Horas</MenuItem>
                                <MenuItem value="24h">24 Horas</MenuItem>
                                <MenuItem value="48h">48 Horas</MenuItem>
                            </Select>
                        </FormControl>
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
                        <TrendingUpIcon sx={{ mr: 2, fontSize: 40 }} />
                        📊 Análise de Dados - {networkName}
                    </Typography>

                    {/* Chips informativos */}
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={`Rede: ${networkName}`} color="primary" />
                        <Chip label={`Período: ${timeRange}`} color="secondary" />
                        <Chip label="5 Gráficos Interativos" color="success" />
                    </Box>
                </Box>

                {/* Erro */}
                {error && (
                    <Box sx={{ width: '100%', maxWidth: '800px' }}>
                        <Alert severity="error" sx={{ borderRadius: 2, boxShadow: 2 }}>
                            {error}
                        </Alert>
                    </Box>
                )}

                {/* Grid de Gráficos */}
                <Box sx={{ width: '100%', maxWidth: '1400px' }}>
                    <Grid container spacing={4}>
                        {/* Gráfico 1 - Barras: Transações por Ledger */}
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '450px' }}>
                                <CardContent sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        📊 Transações por Ledger (Últimos 20)
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <BarChart data={transactionData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="ledger" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                fontSize={10}
                                            />
                                            <YAxis label={{ value: 'Quantidade', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Bar dataKey="transacoes" fill={COLORS[0]} name="Transações Bem-sucedidas" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Gráfico 2 - Linha: Operações ao Longo do Tempo */}
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '450px' }}>
                                <CardContent sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        📈 Operações ao Longo do Tempo (Últimos 30)
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <LineChart data={operationData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="ledger" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                fontSize={10}
                                            />
                                            <YAxis label={{ value: 'Operações', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="operacoes" 
                                                stroke={COLORS[1]} 
                                                strokeWidth={3}
                                                name="Operações por Ledger"
                                                dot={{ r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Gráfico 3 - Área: Volume Acumulado */}
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '450px' }}>
                                <CardContent sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        📊 Volume Acumulado de Transações (Últimos 25)
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={volumeData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="ledger" 
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                fontSize={10}
                                            />
                                            <YAxis label={{ value: 'Total Acumulado', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Legend />
                                            <Area 
                                                type="monotone" 
                                                dataKey="volume" 
                                                stroke={COLORS[2]} 
                                                fill={COLORS[2]}
                                                fillOpacity={0.6}
                                                name="Volume Acumulado"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Gráfico 4 - Scatter: Transações vs Operações */}
                        <Grid item xs={12} lg={6}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '450px' }}>
                                <CardContent sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        🔍 Correlação: Transações vs Operações
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <ScatterChart 
                                            data={scatterData}
                                            margin={{ top: 20, right: 20, bottom: 60, left: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis 
                                                dataKey="x" 
                                                name="Transações"
                                                type="number"
                                                label={{ 
                                                    value: 'Transações', 
                                                    position: 'insideBottom', 
                                                    offset: -40,
                                                    style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
                                                }}
                                            />
                                            <YAxis 
                                                dataKey="y" 
                                                name="Operações"
                                                type="number"
                                                label={{ 
                                                    value: 'Operações', 
                                                    angle: -90, 
                                                    position: 'insideLeft',
                                                    style: { textAnchor: 'middle', fontSize: '14px', fontWeight: 'bold' }
                                                }}
                                            />
                                            <Tooltip content={<ScatterTooltip />} />
                                            <Scatter 
                                                name="Ledgers" 
                                                dataKey="y" 
                                                fill={COLORS[3]}
                                            />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Gráfico 5 - Linha: Top Ledgers */}
                        <Grid item xs={12}>
                            <Card sx={{ borderRadius: 3, boxShadow: 3, height: '500px' }}>
                                <CardContent sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                        🏆 Top 10 Ledgers por Atividade
                                    </Typography>
                                    {topLedgers.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={400}>
                                            <LineChart 
                                                data={topLedgers} 
                                                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis 
                                                    dataKey="ledger" 
                                                    angle={-45}
                                                    textAnchor="end"
                                                    height={100}
                                                    fontSize={11}
                                                    interval={0}
                                                />
                                                <YAxis 
                                                    label={{ 
                                                        value: 'Número de Operações', 
                                                        angle: -90, 
                                                        position: 'insideLeft'
                                                    }}
                                                />
                                                <Tooltip 
                                                    content={({ active, payload, label }) => {
                                                        if (active && payload && payload.length) {
                                                            const data = payload[0].payload;
                                                            return (
                                                                <div style={{
                                                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                                                    padding: '12px',
                                                                    border: '1px solid #ccc',
                                                                    borderRadius: '8px',
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                                                }}>
                                                                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                                                                        {`Ledger: ${label}`}
                                                                    </p>
                                                                    <p style={{ margin: '4px 0', color: COLORS[4] }}>
                                                                        {`Operações: ${formatNumber(data.operacoes)}`}
                                                                    </p>
                                                                    <p style={{ margin: '4px 0', color: COLORS[0] }}>
                                                                        {`Transações: ${formatNumber(data.transacoes)}`}
                                                                    </p>
                                                                    <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '12px' }}>
                                                                        {`Rank: #${data.rank}`}
                                                                    </p>
                                                                </div>
                                                            );
                                                        }
                                                        return null;
                                                    }}
                                                />
                                                <Legend />
                                                {/* Linha principal - Operações */}
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="operacoes" 
                                                    stroke={COLORS[4]} 
                                                    strokeWidth={4}
                                                    name="Operações"
                                                    dot={{ r: 6, fill: COLORS[4] }}
                                                    activeDot={{ r: 8 }}
                                                />
                                                {/* Linha secundária - Transações */}
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="transacoes" 
                                                    stroke={COLORS[0]} 
                                                    strokeWidth={3}
                                                    name="Transações"
                                                    dot={{ r: 5, fill: COLORS[0] }}
                                                    activeDot={{ r: 7 }}
                                                    strokeDasharray="5 5"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center', 
                                            height: 400,
                                            bgcolor: 'background.default',
                                            borderRadius: 2,
                                            border: '2px dashed',
                                            borderColor: 'divider'
                                        }}>
                                            <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>
                                                📊 Nenhum Dado Disponível
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mb: 3 }}>
                                                Nenhum ledger com atividade foi encontrado no período selecionado.
                                            </Typography>
                                            <Button
                                                onClick={fetchChartsData}
                                                variant="contained"
                                                size="large"
                                                startIcon={<RefreshIcon />}
                                                sx={{ borderRadius: 2, px: 3 }}
                                            >
                                                Tentar Novamente
                                            </Button>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* Informações Adicionais */}
                <Box sx={{ width: '100%', maxWidth: '1200px' }}>
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        <Typography variant="body2">
                            <strong>💡 Gráficos Interativos:</strong> Passe o mouse sobre os elementos para ver detalhes. 
                            Os dados são atualizados em tempo real da rede {networkName}. 
                            <br />
                            <strong>📊 Unidades:</strong> Transações e Operações são contadas em unidades. 
                            Volume é acumulativo ao longo do tempo.
                        </Typography>
                    </Alert>
                </Box>
            </Box>
        </Container>
    );
}

export default ChartsPage;