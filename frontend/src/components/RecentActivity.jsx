import React from 'react';
import { 
    Card, 
    CardContent, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper,
    Chip,
    Box
} from '@mui/material';
import { Link } from 'react-router-dom';

const RecentActivity = ({ transactions }) => {
    const formatAddress = (address) => {
        return `${address.slice(0, 8)}...${address.slice(-8)}`;
    };

    const getTimeAgo = (timestamp) => {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);
        
        if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m atrás`;
        return `${Math.floor(diffInSeconds / 3600)}h atrás`;
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    ⚡ Transações Recentes
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Hash</strong></TableCell>
                                <TableCell><strong>Ledger</strong></TableCell>
                                <TableCell><strong>Conta de Origem</strong></TableCell>
                                <TableCell><strong>Operações</strong></TableCell>
                                <TableCell><strong>Taxa</strong></TableCell>
                                <TableCell><strong>Tempo</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {transactions.map((tx) => (
                                <TableRow key={tx.id} hover>
                                    <TableCell>
                                        <Link 
                                            to={`/transaction/${tx.hash}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'primary.main',
                                                    fontFamily: 'monospace',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                {formatAddress(tx.hash)}
                                            </Typography>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link 
                                            to={`/ledger/${tx.ledger}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <Chip 
                                                label={tx.ledger} 
                                                size="small" 
                                                color="secondary"
                                                clickable
                                            />
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Link 
                                            to={`/account/${tx.sourceAccount}`}
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    color: 'info.main',
                                                    fontFamily: 'monospace',
                                                    '&:hover': { textDecoration: 'underline' }
                                                }}
                                            >
                                                {formatAddress(tx.sourceAccount)}
                                            </Typography>
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <Chip 
                                            label={tx.operationCount} 
                                            size="small" 
                                            color="success"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                                            {tx.feePaid} XLM
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {getTimeAgo(tx.createdAt)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
};

export default RecentActivity;