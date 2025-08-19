import React, { useState } from 'react';
import {
    TextField,
    Button,
    Box,
    Alert,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Visibility,
    VisibilityOff,
    Login as LoginIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { isEmailValid, isPasswordValid } from '../../validators/validators';

/**
 * Formulaire de connexion pour les administrateurs
 */
const LoginForm = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login, error: authError } = useAuth();
    const navigate = useNavigate();

    /**
     * Gère les changements dans les champs du formulaire
     * @param {Event} e - Événement de changement
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validation en temps réel
        const fieldError = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: fieldError
        }));
    };

    /**
     * Valide un champ spécifique
     * @param {string} fieldName - Nom du champ
     * @param {string} value - Valeur du champ
     * @returns {string} Message d'erreur ou chaîne vide
     */
    const validateField = (fieldName, value) => {
        switch (fieldName) {
            case 'email':
                if (!value.trim()) return 'Email requis';
                if (!isEmailValid(value)) return 'Email invalide';
                return '';
            case 'password':
                if (!value.trim()) return 'Mot de passe requis';
                if (!isPasswordValid(value)) return 'Mot de passe invalide';
                return '';
            default:
                return '';
        }
    };

    /**
     * Valide l'ensemble du formulaire
     * @returns {boolean} True si le formulaire est valide
     */
    const isFormValid = () => {
        const emailError = validateField('email', formData.email);
        const passwordError = validateField('password', formData.password);

        return !emailError && !passwordError && formData.email && formData.password;
    };

    /**
     * Gère la soumission du formulaire
     * @param {Event} e - Événement de soumission
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isFormValid()) {
            // Valider tous les champs pour afficher les erreurs
            const newErrors = {};
            Object.keys(formData).forEach(key => {
                const error = validateField(key, formData[key]);
                if (error) newErrors[key] = error;
            });
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);

        try {
            await login({
                email: formData.email.trim(),
                password: formData.password
            });

            // Redirection vers le dashboard admin
            navigate('/admin');

        } catch (error) {
            // L'erreur est gérée par le contexte Auth
            console.error('Erreur de connexion:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Bascule l'affichage du mot de passe
     */
    const togglePasswordVisibility = () => {
        setShowPassword(prev => !prev);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate>
            {authError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {authError}
                </Alert>
            )}

            <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                margin="normal"
                required
                autoComplete="email"
                autoFocus
                data-testid="email-input"
            />

            <TextField
                fullWidth
                label="Mot de passe"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                margin="normal"
                required
                autoComplete="current-password"
                data-testid="password-input"
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                aria-label="basculer la visibilité du mot de passe"
                                onClick={togglePasswordVisibility}
                                edge="end"
                                data-testid="password-toggle"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={!isFormValid() || isSubmitting}
                startIcon={<LoginIcon />}
                sx={{ mt: 3, mb: 2 }}
                data-testid="submit-button"
            >
                {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
            </Button>
        </Box>
    );
};

export default LoginForm;