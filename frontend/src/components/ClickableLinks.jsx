import React from 'react';
import { Link } from 'react-router-dom';
import { Typography, Chip } from '@mui/material';
import {
    AccountCircle as AccountIcon,
    AccountBalance as LedgerIcon,
    Receipt as TransactionIcon
} from '@mui/icons-material';

// Componente para endereços de conta clicáveis
export const ClickableAccount = ({ 
    accountId, 
    variant = "body2", 
    showIcon = false, 
    truncate = true,
    sx = {} 
}) => {
    if (!accountId) return 'N/A';
    
    const displayText = truncate 
        ? `${accountId.slice(0, 8)}...${accountId.slice(-8)}`
        : accountId;

    return (
        <Typography
            component={Link}
            to={`/account/${accountId}`}
            variant={variant}
            sx={{
                fontFamily: 'monospace',
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark'
                },
                ...sx
            }}
        >
            {showIcon && <AccountIcon sx={{ fontSize: 16 }} />}
            {displayText}
        </Typography>
    );
};

// Componente para números de ledger clicáveis
export const ClickableLedger = ({ 
    ledgerNumber, 
    variant = "body2", 
    showIcon = false,
    asChip = false,
    sx = {} 
}) => {
    if (!ledgerNumber) return 'N/A';

    if (asChip) {
        return (
            <Chip
                component={Link}
                to={`/ledger/${ledgerNumber}`}
                label={`#${ledgerNumber}`}
                color="primary"
                size="small"
                clickable
                icon={showIcon ? <LedgerIcon /> : undefined}
                sx={{
                    fontWeight: 'bold',
                    '& .MuiChip-label': { color: 'white' },
                    textDecoration: 'none',
                    ...sx
                }}
            />
        );
    }

    return (
        <Typography
            component={Link}
            to={`/ledger/${ledgerNumber}`}
            variant={variant}
            sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark'
                },
                ...sx
            }}
        >
            {showIcon && <LedgerIcon sx={{ fontSize: 16 }} />}
            #{ledgerNumber}
        </Typography>
    );
};

// Componente para hashes de transação clicáveis
export const ClickableTransaction = ({ 
    transactionId, 
    variant = "body2", 
    showIcon = false, 
    truncate = true,
    sx = {} 
}) => {
    if (!transactionId) return 'N/A';
    
    const displayText = truncate 
        ? `${transactionId.slice(0, 8)}...${transactionId.slice(-8)}`
        : transactionId;

    return (
        <Typography
            component={Link}
            to={`/transaction/${transactionId}`}
            variant={variant}
            sx={{
                fontFamily: 'monospace',
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.dark'
                },
                ...sx
            }}
        >
            {showIcon && <TransactionIcon sx={{ fontSize: 16 }} />}
            {displayText}
        </Typography>
    );
};

// 🔧 CORRIGIDO: Componente para hashes - SEM LINK para ledger hash
export const ClickableHash = ({ 
    hash, 
    type, // 'account', 'transaction' - REMOVIDO 'ledger'
    variant = "body1",
    sx = {}
}) => {
    if (!hash || !type) return hash || 'N/A';

    const getRoute = () => {
        switch (type) {
            case 'account': return `/account/${hash}`;
            case 'transaction': return `/transaction/${hash}`;
            // REMOVIDO case 'ledger' porque hash ≠ sequence
            default: return '#';
        }
    };

    // Se for um hash de ledger, apenas exibir sem link
    if (type === 'ledger') {
        return (
            <Typography
                variant={variant}
                sx={{
                    fontFamily: 'monospace',
                    fontSize: '1.1rem',
                    wordBreak: 'break-all',
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    textAlign: 'center',
                    color: 'text.primary',
                    display: 'block',
                    ...sx
                }}
            >
                {hash}
            </Typography>
        );
    }

    return (
        <Typography
            component={Link}
            to={getRoute()}
            variant={variant}
            sx={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                wordBreak: 'break-all',
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'block',
                transition: 'all 0.2s',
                '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white',
                    borderColor: 'primary.main'
                },
                ...sx
            }}
        >
            {hash}
        </Typography>
    );
};

// 🆕 NOVO: Componente específico para exibir hash de ledger (sem link)
export const LedgerHashDisplay = ({ 
    hash,
    variant = "body1",
    sx = {}
}) => {
    if (!hash) return 'N/A';

    return (
        <Typography
            variant={variant}
            sx={{
                fontFamily: 'monospace',
                fontSize: '1.1rem',
                wordBreak: 'break-all',
                bgcolor: 'background.paper',
                p: 2,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
                color: 'text.primary',
                display: 'block',
                ...sx
            }}
        >
            {hash}
        </Typography>
    );
};