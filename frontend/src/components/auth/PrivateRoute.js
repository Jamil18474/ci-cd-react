import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

/**
 * Composant de route protégée pour l'authentification
 */
const PrivateRoute = ({ children, adminOnly = false, requiredPermission = null }) => {
    const { isAuthenticated, isLoading, user, hasPermission, isAdmin } = useAuth();
    const location = useLocation();

    // Affichage du loader pendant la vérification
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    gap: 2
                }}
            >
                <CircularProgress size={60} />
                <Typography variant="h6" color="text.secondary">
                    Vérification de l'authentification...
                </Typography>
            </Box>
        );
    }

    // Redirection vers /login (pas /) si non authentifié
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // Vérification des droits d'administrateur
    if (adminOnly && !isAdmin()) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    // Vérification des permissions spécifiques
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    // L'utilisateur est authentifié et autorisé
    return children;
};

export default PrivateRoute;