import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import UserForm from '../components/UserForm';
import { toast } from 'react-toastify';

/**
 * Page d'inscription des nouveaux utilisateurs
 * UTILISE L'API BACKEND - PAS DE LOCALSTORAGE
 */
const RegisterPage = () => {
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    /**
     * Gère l'inscription d'un nouvel utilisateur via API
     */
    const handleUserRegister = async (userData) => {
        setLoading(true);

        try {


            // APPEL API via le contexte d'authentification
            await register(userData);



            // Afficher une notification de succès
            toast.success(`Inscription réussie ! Bienvenue ${userData.firstName} ${userData.lastName}`);

            // Rediriger vers la page de connexion après un délai
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.',
                        email: userData.email
                    }
                });
            }, 2000);

        } catch (error) {
            // Gérer les erreurs spécifiques du backend
            let errorMessage = 'Erreur lors de l\'inscription';

            if (error.status === 400) {
                if (error.message && error.message.includes('adresse email')) {
                    errorMessage = 'Cette adresse email est déjà utilisée';
                } else {
                    errorMessage = error.message || 'Données invalides. Vérifiez vos informations.';
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Retourne à la page de connexion
     */
    const handleGoBack = () => {
        navigate('/login');
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Bouton retour */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                sx={{ mb: 3 }}
                variant="outlined"
            >
                Retour à la connexion
            </Button>

            {/* En-tête */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    📝 Inscription
                </Typography>
                <Typography variant="h6" color="text.secondary">
                    Créez votre compte pour accéder à la plateforme
                </Typography>
            </Box>



            {/* Formulaire d'inscription */}
            <UserForm
                onRegister={handleUserRegister}
                loading={loading}
            />

            <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Vous avez déjà un compte ?{' '}
                    <Button
                        variant="text"
                        onClick={handleGoBack}
                        sx={{ textDecoration: 'underline' }}
                    >
                        Connectez-vous ici
                    </Button>
                </Typography>
            </Box>
        </Container>
    );
};

export default RegisterPage;