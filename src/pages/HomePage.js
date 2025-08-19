import React from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Paper,
    Alert
} from '@mui/material';
import {
    Person as PersonIcon,
    Login as LoginIcon,
    PersonAdd as RegisterIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    AdminPanelSettings as AdminIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Page d'accueil principale
 */
const HomePage = () => {
    const { isAuthenticated, user, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    // Handler de déconnexion
    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Déconnexion réussie');
            navigate('/');
        } catch (error) {
            toast.error('Erreur lors de la déconnexion');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* En-tête principal */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <PersonIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                <Typography variant="h2" component="h1" gutterBottom color="primary">
                    🌟 Plateforme Utilisateurs
                </Typography>
                <Typography variant="h4" component="h2" color="text.secondary" sx={{ mb: 4 }}>
                    Gestion moderne et sécurisée des comptes utilisateurs
                </Typography>
            </Box>

            {/* Bouton de déconnexion affiché en haut à droite quand connecté */}
            {isAuthenticated && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                    >
                        Déconnexion
                    </Button>
                </Box>
            )}

            {/* Contenu principal selon l'état d'authentification */}
            {!isAuthenticated ? (
                // UTILISATEUR NON CONNECTÉ
                <Box>
                    {/* Actions principales */}
                    <Grid container spacing={4} sx={{ mb: 6 }}>
                        <Grid item xs={12} md={6}>
                            <Card elevation={3} sx={{ height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <LoginIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        Se connecter
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        Accédez à votre compte existant
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/login')}
                                        startIcon={<LoginIcon />}
                                        fullWidth
                                    >
                                        🔐 Se connecter
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Card elevation={3} sx={{ height: '100%' }}>
                                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                    <RegisterIcon sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                                    <Typography variant="h5" component="h3" gutterBottom>
                                        S'inscrire
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                        Créez votre nouveau compte
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={() => navigate('/register')}
                                        startIcon={<RegisterIcon />}
                                        color="secondary"
                                        fullWidth
                                    >
                                        📝 S'inscrire
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Fonctionnalités */}
                    <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h4" component="h2" gutterBottom>
                            ✨ Fonctionnalités
                        </Typography>
                        <Grid container spacing={3} sx={{ mt: 2 }}>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h6" component="h3" gutterBottom>
                                    🔒 Sécurisé
                                </Typography>
                                <Typography variant="body2">
                                    Authentification robuste et protection des données
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h6" component="h3" gutterBottom>
                                    👥 Communauté
                                </Typography>
                                <Typography variant="body2">
                                    Découvrez et interagissez avec d'autres utilisateurs
                                </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <Typography variant="h6" component="h3" gutterBottom>
                                    ⚡ Moderne
                                </Typography>
                                <Typography variant="body2">
                                    Interface intuitive et expérience utilisateur optimale
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            ) : (
                // UTILISATEUR CONNECTÉ
                <Box>
                    {/* Message de bienvenue */}
                    <Alert severity="success" sx={{ mb: 4 }}>
                        <Typography variant="h6">
                            🎉 Bienvenue, {user?.firstName} !
                        </Typography>
                    </Alert>

                    {/* Actions selon le rôle */}
                    <Grid container spacing={4}>
                        {/* ADMIN */}
                        {isAdmin() ? (
                            <>
                                <Grid item xs={12} md={6}>
                                    <Card elevation={3}>
                                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                            <DashboardIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
                                            <Typography variant="h5" component="h3" gutterBottom>
                                                Dashboard Administrateur
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                                Gérez la plateforme et les utilisateurs
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={() => navigate('/admin')}
                                                startIcon={<AdminIcon />}
                                                color="error"
                                                fullWidth
                                            >
                                                📊 Dashboard Administrateur
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Card elevation={3}>
                                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                            <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                            <Typography variant="h5" component="h3" gutterBottom>
                                                Gestion des Utilisateurs
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                                Consultez et gérez tous les utilisateurs
                                            </Typography>
                                            <Button
                                                variant="contained"
                                                size="large"
                                                onClick={() => navigate('/users')}
                                                startIcon={<PeopleIcon />}
                                                fullWidth
                                            >
                                                👥 Gérer les utilisateurs
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </>
                        ) : (
                            // UTILISATEUR STANDARD
                            <Grid item xs={12} md={8} sx={{ mx: 'auto' }}>
                                <Card elevation={3}>
                                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                                        <PeopleIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                                        <Typography variant="h5" component="h3" gutterBottom>
                                            Communauté
                                        </Typography>
                                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                                            Découvrez les autres membres de la communauté
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            size="large"
                                            onClick={() => navigate('/users')}
                                            startIcon={<PeopleIcon />}
                                            fullWidth
                                        >
                                            👥 Voir les utilisateurs
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>

                    {/* Informations du profil */}
                    <Paper elevation={2} sx={{ p: 3, mt: 4, textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>
                            👤 Votre Profil
                        </Typography>
                        <Typography variant="body1">
                            <strong>Nom :</strong> {user?.firstName} {user?.lastName}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Email :</strong> {user?.email}
                        </Typography>
                        <Typography variant="body1">
                            <strong>Rôle :</strong> {isAdmin() ? 'Administrateur' : 'Utilisateur'}
                        </Typography>
                    </Paper>
                </Box>
            )}
        </Container>
    );
};

export default HomePage;