import React, { useState } from 'react';
import {
    TextField,
    Button,
    Grid,
    Typography,
    Box,
    CircularProgress,
    Card,
    CardContent,
    InputAdornment,
    IconButton
} from '@mui/material';
import {
    Person as PersonIcon,
    Save as SaveIcon,
    Visibility,
    VisibilityOff
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import {
    isNameValid,
    isEmailValid,
    isAgeValidFromBirthDate,
    isPostalCodeValid,
    isPasswordValid
} from '../validators/validators';

/**
 * Composant de formulaire d'inscription utilisateur
 * NOUVEAU : Avec champ password + utilisation API backend
 */
const UserForm = ({ onRegister, loading: externalLoading = false }) => {
    // État du formulaire avec password
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',           // NOUVEAU champ
        birthDate: '',
        city: '',
        postalCode: ''
    });

    // États de validation et d'interface
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitAttempted, setSubmitAttempted] = useState(false);

    /**
     * Gère les changements dans les champs du formulaire
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Validation en temps réel si une tentative de soumission a eu lieu
        if (submitAttempted) {
            const fieldError = validateField(name, value);
            setErrors(prev => ({
                ...prev,
                [name]: fieldError
            }));
        }
    };

    /**
     * Valide un champ spécifique
     */
    const validateField = (fieldName, value) => {
        switch (fieldName) {
            case 'firstName':
                if (!value.trim()) return 'Le prénom est requis';
                if (!isNameValid(value)) return 'Le prénom ne doit contenir que des lettres, espaces, apostrophes et tirets';
                return '';

            case 'lastName':
                if (!value.trim()) return 'Le nom est requis';
                if (!isNameValid(value)) return 'Le nom ne doit contenir que des lettres, espaces, apostrophes et tirets';
                return '';

            case 'email':
                if (!value.trim()) return 'L\'email est requis';
                if (!isEmailValid(value)) return 'Format d\'email invalide';
                return '';

            case 'password':
                if (!value.trim()) return 'Le mot de passe est requis';
                if (!isPasswordValid(value)) return 'Le mot de passe doit faire au moins 6 caractères';
                return '';

            case 'birthDate':
                if (!value.trim()) return 'La date de naissance est requise';
                if (!isAgeValidFromBirthDate(value)) return 'Vous devez avoir au moins 18 ans';
                return '';

            case 'city':
                if (!value.trim()) return 'La ville est requise';
                if (!isNameValid(value)) return 'La ville ne doit contenir que des lettres, espaces, apostrophes et tirets';
                return '';

            case 'postalCode':
                if (!value.trim()) return 'Le code postal est requis';
                if (!isPostalCodeValid(value)) return 'Code postal français invalide (5 chiffres)';
                return '';

            default:
                return '';
        }
    };

    /**
     * Valide l'ensemble du formulaire
     */
    const validateForm = () => {
        const newErrors = {};
        let isValid = true;

        // Valider tous les champs (y compris password)
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key]);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        return { isValid, errors: newErrors };
    };

    /**
     * Remet le formulaire à zéro
     */
    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            birthDate: '',
            city: '',
            postalCode: ''
        });
        setErrors({});
        setSubmitAttempted(false);
        setIsSubmitting(false);
    };

    /**
     * Gère la soumission du formulaire
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitAttempted(true);

        // Validation du formulaire
        const { isValid, errors: validationErrors } = validateForm();
        setErrors(validationErrors);

        if (!isValid) {
            toast.error('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        setIsSubmitting(true);

        try {
            // Préparer les données à envoyer à l'API
            const userData = {
                ...formData,
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim().toLowerCase(),
                city: formData.city.trim(),
                postalCode: formData.postalCode.trim()
                // password reste tel quel pour le hachage côté serveur
            };

            // Appeler la fonction onRegister fournie par le parent (qui utilise l'API)
            await onRegister(userData);

            // Succès - réinitialiser le formulaire
            resetForm();
            toast.success('Inscription réussie !');

        } catch (error) {
            // Gérer les erreurs de l'API
            let errorMessage = 'Erreur lors de l\'inscription';

            if (error.status === 400) {
                if (error.message && error.message.includes('email')) {
                    errorMessage = 'Cette adresse email est déjà utilisée';
                    setErrors(prev => ({ ...prev, email: errorMessage }));
                } else {
                    errorMessage = error.message;
                }
            } else if (error.status === 500) {
                errorMessage = 'Erreur serveur';
            } else if (error.status === 0) {
                errorMessage = 'Impossible de contacter le serveur';
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // État de chargement (interne ou externe)
    const isLoading = isSubmitting || externalLoading;

    /**
     * Calcule la date maximum pour le champ de naissance (18 ans)
     */
    const getMaxBirthDate = () => {
        const today = new Date();
        const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        return maxDate.toISOString().split('T')[0];
    };

    return (
        <Card elevation={2}>
            <CardContent>
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h5" component="h2" gutterBottom>
                        Inscription Utilisateur
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Remplissez tous les champs pour créer votre compte
                    </Typography>
                </Box>

                <Box component="form" onSubmit={handleSubmit} noValidate>
                    <Grid container spacing={3}>
                        {/* Prénom */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Prénom"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                error={!!errors.firstName}
                                helperText={errors.firstName}
                                disabled={isLoading}
                                required
                                autoComplete="given-name"
                            />
                        </Grid>

                        {/* Nom */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Nom"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                error={!!errors.lastName}
                                helperText={errors.lastName}
                                disabled={isLoading}
                                required
                                autoComplete="family-name"
                            />
                        </Grid>

                        {/* Email */}
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                                disabled={isLoading}
                                required
                                autoComplete="email"
                            />
                        </Grid>

                        {/* NOUVEAU: Mot de passe */}
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Mot de passe"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password || 'Au moins 6 caractères'}
                                disabled={isLoading}
                                required
                                autoComplete="new-password"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                disabled={isLoading}
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>

                        {/* Date de naissance */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Date de naissance"
                                name="birthDate"
                                type="date"
                                value={formData.birthDate}
                                onChange={handleChange}
                                error={!!errors.birthDate}
                                helperText={errors.birthDate || 'Vous devez avoir au moins 18 ans'}
                                disabled={isLoading}
                                required
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ max: getMaxBirthDate() }}
                            />
                        </Grid>

                        {/* Code postal */}
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                fullWidth
                                label="Code postal"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={handleChange}
                                error={!!errors.postalCode}
                                helperText={errors.postalCode || 'Format français (ex: 75001)'}
                                disabled={isLoading}
                                required
                                inputProps={{ maxLength: 5 }}
                            />
                        </Grid>

                        {/* Ville */}
                        <Grid size={12}>
                            <TextField
                                fullWidth
                                label="Ville"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                error={!!errors.city}
                                helperText={errors.city}
                                disabled={isLoading}
                                required
                                autoComplete="address-level2"
                            />
                        </Grid>
                    </Grid>

                    {/* Bouton de soumission */}
                    <Box sx={{ mt: 4, textAlign: 'center' }}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                            sx={{
                                minWidth: 200,
                                py: 1.5
                            }}
                        >
                            {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                        </Button>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};

export default UserForm;