import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Box, 
    TextField, 
    Button, 
    Typography,
    InputAdornment,
    Alert,
    CircularProgress
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSearch = async () => {
        if (!searchTerm || !searchTerm.trim()) {
            setError('Por favor, digite algo para buscar.');
            return;
        }

        const term = searchTerm.trim();
        setLoading(true);
        setError('');
        
        console.log(`🔍 Iniciando busca por: "${term}"`);

        try {
            // 1. É um ID de conta? (Começa com 'G', 56 caracteres)
            if (term.startsWith('G') && term.length === 56) {
                console.log('✅ Detectado como ID de conta');
                navigate(`/account/${term}`);
                return;
            }

            // 2. É um número de ledger? (Apenas dígitos)
            if (/^\d+$/.test(term)) {
                console.log('✅ Detectado como número de ledger');
                navigate(`/ledger/${term}`);
                return;
            }

            // 3. É um hash de 64 caracteres? (Pode ser transação ou ledger)
            if (term.length === 64 && /^[0-9a-fA-F]+$/i.test(term)) {
                console.log('🔍 Hash de 64 caracteres detectado, verificando tipo...');
                
                // Primeiro, tentar como transação
                try {
                    console.log('🔄 Verificando se é transação...');
                    await axios.get(`https://horizon.stellar.org/transactions/${term}`);
                    console.log('✅ É uma transação válida');
                    navigate(`/transaction/${term}`);
                    return;
                } catch (txError) {
                    console.log('❌ Não é uma transação, tentando como ledger...');
                }

                // Se não for transação, tentar como hash de ledger
                try {
                    console.log('🔄 Verificando se é hash de ledger...');
                    const ledgersResponse = await axios.get('https://horizon.stellar.org/ledgers?order=desc&limit=200');
                    const ledgers = ledgersResponse.data._embedded.records;
                    
                    const foundLedger = ledgers.find(ledger => 
                        ledger.hash.toLowerCase() === term.toLowerCase()
                    );
                    
                    if (foundLedger) {
                        console.log('✅ É um hash de ledger válido');
                        navigate(`/ledger/${foundLedger.sequence}`);
                        return;
                    }
                } catch (ledgerError) {
                    console.log('❌ Erro ao buscar ledgers:', ledgerError.message);
                }

                // Se não encontrou nem como transação nem como ledger
                setError('Hash não encontrado como transação ou ledger. Verifique se está correto.');
                return;
            }

            // 4. Formato não reconhecido
            setError('Formato não reconhecido. Use:\n• ID de conta (G... 56 caracteres)\n• Número de ledger (apenas dígitos)\n• Hash de transação/ledger (64 caracteres hexadecimais)');

        } catch (error) {
            console.error('❌ Erro na busca:', error);
            setError(`Erro na busca: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        setError('');
    };

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
            {/* Campo de Busca */}
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Buscar por Endereço (G...), Hash da Transação ou Nº do Ledger"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': {
                                borderColor: 'primary.main',
                            },
                        },
                    }}
                />
                <Button 
                    variant="contained" 
                    onClick={handleSearch}
                    disabled={loading || !searchTerm.trim()}
                    sx={{ 
                        minWidth: 120,
                        height: 56 // Mesma altura do TextField
                    }}
                >
                    {loading ? (
                        <CircularProgress size={20} color="inherit" />
                    ) : (
                        'Buscar'
                    )}
                </Button>
                {searchTerm && (
                    <Button 
                        variant="outlined" 
                        onClick={handleClear}
                        disabled={loading}
                        sx={{ minWidth: 80 }}
                    >
                        Limpar
                    </Button>
                )}
            </Box>

            {/* Mensagem de Erro */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 2 }}
                    onClose={() => setError('')}
                >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {error}
                    </Typography>
                </Alert>
            )}

            {/* Exemplos de Busca */}
            <Box sx={{ 
                textAlign: 'center', 
                color: 'text.secondary',
                fontSize: '0.875rem'
            }}>
                <Typography variant="body2" gutterBottom>
                    💡 <strong>Exemplos:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    • <strong>Conta:</strong> GBAGQIVNLM4VQFCF2GQGR7FHQNQBR7XZJNVHQX2U7QP6WJX
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                    • <strong>Ledger:</strong> 59251585
                </Typography>
                <Typography variant="body2">
                    • <strong>Hash:</strong> 0f9a1ef6b2c3d4e5f6789abcdef01234567890abcdef01234567890abcdef01234
                </Typography>
            </Box>
        </Box>
    );
}

export default SearchBar;