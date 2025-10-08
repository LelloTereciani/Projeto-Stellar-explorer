import React from 'react';
import { Box, Typography, Container, Divider } from '@mui/material';
import { Copyright as CopyrightIcon } from '@mui/icons-material';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <Box
            component="footer"
            sx={{
                bgcolor: 'background.paper',
                borderTop: '1px solid',
                borderColor: 'divider',
                mt: 'auto',
                py: 3
            }}
        >
            <Container maxWidth="lg">
                <Divider sx={{ mb: 2 }} />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: 1
                    }}
                >
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontWeight: 500
                        }}
                    >
                        <CopyrightIcon sx={{ fontSize: 16 }} />
                        {currentYear} Todos os direitos reservados
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontWeight: 'bold' }}
                    >
                        • Wesley Rodrigues Tereciani - Desenvolvedor Blockchain Fullstack - Web3 •
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

export default Footer;