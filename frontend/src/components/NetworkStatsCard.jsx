import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const NetworkStatsCard = ({ title, value, subtitle, icon, color = 'primary' }) => {
    return (
        <Card sx={{ 
            height: '100%', 
            transition: 'transform 0.2s, box-shadow 0.2s', 
            '&:hover': { 
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
            } 
        }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ color: `${color}.main`, mr: 1 }}>
                        {icon}
                    </Box>
                    <Typography variant="h6" component="div">
                        {title}
                    </Typography>
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: `${color}.main`, mb: 1 }}>
                    {value}
                </Typography>
                {subtitle && (
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </Card>
    );
};

export default NetworkStatsCard;