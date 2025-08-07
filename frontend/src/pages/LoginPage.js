import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Alert,
    Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import LoginForm from '../components/auth/LoginForm'; // VOTRE LoginForm existant

/**
 * Page de connexion
 */
const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            {/* Bouton retour */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate('/')}
                sx={{ mb: 3 }}
                variant="outlined"
            >
                Retour à l'accueil
            </Button>

            {/* En-tête */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    🔐 Connexion
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Accédez à votre compte
                </Typography>
            </Box>

            {/* Formulaire de connexion */}
            <Paper elevation={3} sx={{ p: 4 }}>
                {/* Message de redirection si applicable */}
                {location.state?.from && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Connectez-vous pour accéder à cette page.
                    </Alert>
                )}

                {/* UTILISER VOTRE LoginForm existant */}
                <LoginForm />

                <Divider sx={{ my: 3 }} />

                {/* Lien vers inscription */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vous n'avez pas encore de compte ?
                    </Typography>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/register')}
                    >
                        Créer un compte
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default LoginPage;