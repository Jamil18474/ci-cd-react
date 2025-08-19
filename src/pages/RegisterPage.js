import React from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import UserForm from '../components/UserForm';

/**
 * Page d'inscription des utilisateurs
 */
const RegisterPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    /**
     * Gère l'inscription d'un nouvel utilisateur
     */
    const handleRegister = async (userData) => {
        try {
            await register(userData);

            // Succès - rediriger vers la connexion
            toast.success('Inscription réussie ! Vous pouvez maintenant vous connecter.');
            navigate('/login');

        } catch (error) {
            // L'erreur est déjà gérée par le contexte Auth et UserForm
            console.error('Erreur lors de l\'inscription:', error);
            // Laisser UserForm gérer l'affichage des erreurs
            throw error;
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
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
                    📝 Inscription
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Créez votre compte utilisateur
                </Typography>
            </Box>

            {/* Formulaire d'inscription */}
            <Paper elevation={3} sx={{ p: 4 }}>
                <UserForm onRegister={handleRegister} />

                <Divider sx={{ my: 4 }} />

                {/* Lien vers connexion */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Vous avez déjà un compte ?
                    </Typography>
                    <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => navigate('/login')}
                    >
                        Se connecter
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default RegisterPage;