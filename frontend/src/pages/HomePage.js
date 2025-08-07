import React from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Grid,
    Card,
    CardContent,
    Paper
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Page d'accueil - Interface simplifiée
 */
const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const navigate = useNavigate();

    // Si déjà connecté, redirection simple
    if (isAuthenticated) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom color="primary">
                        🎉 Bienvenue, {user?.firstName} !
                    </Typography>

                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Vous êtes connecté en tant que : <strong>{user?.firstName} {user?.lastName}</strong>
                        {user?.role === 'admin' && ' (Administrateur)'}
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                        {/* UN SEUL BOUTON SELON LE RÔLE */}
                        {user?.role === 'admin' ? (
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/admin')}
                                sx={{ mr: 2 }}
                            >
                                📊 Dashboard Administrateur
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => navigate('/users')}
                                sx={{ mr: 2 }}
                            >
                                👥 Voir les utilisateurs
                            </Button>
                        )}
                    </Box>
                </Paper>
            </Container>
        );
    }

    // Page d'accueil pour visiteurs non connectés
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" component="h1" gutterBottom color="primary">
                    🌟 Plateforme Utilisateurs
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
                    Gérez vos utilisateurs en toute simplicité
                </Typography>

                <Box sx={{ mb: 4 }}>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/login')}
                        sx={{ mr: 2, py: 1.5, px: 4 }}
                    >
                        🔐 Se connecter
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() => navigate('/register')}
                        sx={{ py: 1.5, px: 4 }}
                    >
                        📝 S'inscrire
                    </Button>
                </Box>

                <Typography variant="body2" color="text.secondary">
                    Connectez-vous pour accéder à toutes les fonctionnalités
                </Typography>
            </Box>

            {/* Section avantages */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h4" gutterBottom>🔒</Typography>
                            <Typography variant="h6" gutterBottom>Sécurisé</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Protection des données personnelles avec MongoDB
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h4" gutterBottom>⚡</Typography>
                            <Typography variant="h6" gutterBottom>Rapide</Typography>
                            <Typography variant="body2" color="text.secondary">
                                API Node.js performante pour une expérience fluide
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={2}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="h4" gutterBottom>🎯</Typography>
                            <Typography variant="h6" gutterBottom>Simple</Typography>
                            <Typography variant="body2" color="text.secondary">
                                Interface intuitive pour tous les utilisateurs
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <Paper elevation={1} sx={{ p: 4, bgcolor: 'grey.50', textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    💡 Comment ça marche ?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    1. Créez votre compte ou connectez-vous<br />
                    2. Consultez la liste des utilisateurs<br />
                    3. Actions supplémentaires selon vos droits
                </Typography>
            </Paper>
        </Container>
    );
};

export default HomePage;