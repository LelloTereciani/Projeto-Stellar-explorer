import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Switch,
    FormControlLabel,
    Button,
    IconButton,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
    Chip
} from '@mui/material';
import {
    AccountBalance as StellarIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Menu as MenuIcon,
    BarChart as ChartsIcon,
    NetworkWifi as NetworkIcon
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';

function Header() {
    const { 
        isTestnet, 
        toggleNetwork, 
        isDarkMode, 
        toggleTheme, 
        networkName, 
        networkColor 
    } = useAppContext();
    
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    // Verificar se está na página de gráficos
    const isChartsPage = location.pathname === '/charts';

    return (
        <AppBar 
            position="sticky" 
            elevation={2}
            sx={{ 
                bgcolor: networkColor,
                borderBottom: '2px solid',
                borderColor: 'rgba(255,255,255,0.1)'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
                {/* Logo e Título - CLICÁVEL para voltar ao início */}
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StellarIcon sx={{ fontSize: 32, mr: 1 }} />
                    <Typography 
                        variant="h6" 
                        component={Link}
                        to="/"
                        sx={{ 
                            fontWeight: 'bold',
                            textDecoration: 'none',
                            color: 'inherit',
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            '&:hover': {
                                opacity: 0.8
                            }
                        }}
                    >
                        Stellar Explorer
                    </Typography>
                </Box>
                {/* Navegação Desktop - BOTÃO GRÁFICOS COM CORES CORRIGIDAS */}
                {!isMobile && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Button
                            component={Link}
                            to="/charts"
                            startIcon={<ChartsIcon />}
                            variant={isChartsPage ? 'contained' : 'outlined'}
                            sx={{ 
                                borderRadius: 2,
                                // 🔧 CORES TOTALMENTE CORRIGIDAS
                                ...(isChartsPage ? {
                                    // Quando ativo (na página de gráficos)
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    border: '1px solid #1976d2',
                                    '&:hover': {
                                        bgcolor: '#1565c0',
                                        color: 'white',
                                        border: '1px solid #1565c0'
                                    }
                                } : {
                                    // Quando inativo (homepage) - CORES VISÍVEIS
                                    color: 'white', // Texto branco para contraste
                                    borderColor: 'white', // Borda branca
                                    bgcolor: 'transparent', // Fundo transparente
                                    border: '1px solid white',
                                    '&:hover': {
                                        borderColor: 'white',
                                        bgcolor: 'rgba(255, 255, 255, 0.1)', // Fundo branco translúcido no hover
                                        color: 'white'
                                    }
                                })
                            }}
                        >
                            Gráficos
                        </Button>
                    </Box>
                )}

                {/* Controles */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Chip da Rede */}
                    <Chip
                        icon={<NetworkIcon />}
                        label={networkName}
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            fontWeight: 'bold',
                            display: { xs: 'none', sm: 'flex' }
                        }}
                    />

                    {/* Switch da Rede */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={isTestnet}
                                onChange={toggleNetwork}
                                size="small"
                                sx={{
                                    '& .MuiSwitch-switchBase.Mui-checked': {
                                        color: '#ff9800',
                                    },
                                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                        backgroundColor: '#ff9800',
                                    },
                                }}
                            />
                        }
                        label={
                            <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                                {isTestnet ? 'Test' : 'Main'}
                            </Typography>
                        }
                        sx={{ m: 0 }}
                    />

                    {/* Switch do Tema */}
                    <IconButton
                        onClick={toggleTheme}
                        sx={{ 
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                        }}
                    >
                        {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
                    </IconButton>

                    {/* Menu Mobile */}
                    {isMobile && (
                        <>
                            <IconButton
                                onClick={handleMenuOpen}
                                sx={{ 
                                    color: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' }
                                }}
                            >
                                <MenuIcon />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={open}
                                onClose={handleMenuClose}
                                PaperProps={{
                                    sx: {
                                        borderRadius: 2,
                                        mt: 1,
                                        minWidth: 200
                                    }
                                }}
                            >
                                <MenuItem
                                    component={Link}
                                    to="/charts"
                                    onClick={handleMenuClose}
                                    selected={isChartsPage}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        borderRadius: 1,
                                        mx: 1,
                                        my: 0.5
                                    }}
                                >
                                    <ChartsIcon />
                                    Gráficos
                                </MenuItem>
                            </Menu>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;