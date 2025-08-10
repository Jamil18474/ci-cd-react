import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Alert,
    Card,
    CardContent,
    Button,
    Grid,
    CircularProgress
} from '@mui/material';
import {
    ExitToApp as LogoutIcon,
    People as PeopleIcon,
    AdminPanelSettings as AdminIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

/**
 * Dashboard d'administration - SIMPLIFIÉ
 * Juste les statistiques + navigation
 */
const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Charge la liste des utilisateurs pour les statistiques
     */
    const loadUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.getAllUsers();
            const usersData = response.users || response;
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            let errorMessage = 'Erreur lors du chargement des statistiques';
            if (error.status === 403) {
                errorMessage = 'Vous n\'avez pas les droits pour voir les statistiques';
            } else if (error.status === 401) {
                errorMessage = 'Session expirée, veuillez vous reconnecter';
            } else if (error.status === 500) {
                errorMessage = 'Erreur serveur';
            } else if (error.status === 0) {
                errorMessage = 'Impossible de contacter le serveur';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            setUsers([]);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Gère la déconnexion
     */
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
            toast.success('Déconnexion réussie');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
            navigate('/');
        }
    };

    // Charger les statistiques au montage
    useEffect(() => {
        loadUsers();
    }, []);

    // Affichage du loader
    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                    <Typography variant="h6" sx={{ mt: 2 }}>
                        Chargement du dashboard administrateur...
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* En-tête avec déconnexion */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography variant="h4" component="h1" gutterBottom>
                        📊 Dashboard Administrateur
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Bienvenue {user?.firstName} {user?.lastName}
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<LogoutIcon />}
                    onClick={handleLogout}
                    color="error"
                >
                    Déconnexion
                </Button>
            </Box>

            {/* Gestion des erreurs */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            startIcon={<RefreshIcon />}
                            onClick={loadUsers}
                        >
                            Réessayer
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* Statistiques */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography variant="h3" color="primary" gutterBottom>
                                {users.length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Utilisateurs inscrits
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <AdminIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                            <Typography variant="h3" color="error" gutterBottom>
                                {users.filter(u => u.role === 'admin').length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Administrateurs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                    <Card elevation={3}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <PeopleIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                            <Typography variant="h3" color="success.main" gutterBottom>
                                {users.filter(u => u.role === 'user').length}
                            </Typography>
                            <Typography variant="h6" color="text.secondary">
                                Utilisateurs standard
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Actions principales */}
            <Card elevation={2}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h5" gutterBottom>
                        🛠️ Actions Administrateur
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Gérez les utilisateurs de la plateforme
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate('/users')}
                            startIcon={<PeopleIcon />}
                            sx={{ minWidth: 200 }}
                        >
                            Gérer les utilisateurs
                        </Button>

                        {error && (
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={loadUsers}
                                startIcon={<RefreshIcon />}
                                sx={{ minWidth: 200 }}
                            >
                                Actualiser les données
                            </Button>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Container>
    );
};

export default AdminDashboard;