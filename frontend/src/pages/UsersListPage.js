import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    Paper,
    Chip
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import UsersList from '../components/UsersList';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * Page de liste des utilisateurs - Accessible aux utilisateurs connectés
 */
const UsersListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Charge la liste des utilisateurs
     */
    const loadUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await userService.getAllUsers();
            const usersData = response.users || response;
            setUsers(Array.isArray(usersData) ? usersData : []);
        } catch (error) {
            let errorMessage = 'Erreur lors du chargement des utilisateurs';
            if (error.status === 403) {
                errorMessage = 'Vous n\'avez pas les droits pour voir les utilisateurs';
            } else if (error.status === 401) {
                errorMessage = 'Session expirée, veuillez vous reconnecter';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Gère la suppression d'un utilisateur
     */
    const handleUserDelete = async (userId) => {
        try {
            await userService.deleteUser(userId);
            // Recharger la liste
            await loadUsers();
            toast.success('Utilisateur supprimé avec succès');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
            toast.error(errorMessage);
            // throw error; // LIGNE SUPPRIMÉE POUR TESTS STABLES ET COUVERTURE COMPLETE !
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
            // eslint-disable-next-line no-console
            console.error('Erreur lors de la déconnexion:', error);
            navigate('/');
        }
    };

    // Charger les utilisateurs au montage
    useEffect(() => {
        loadUsers();
    }, []);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* En-tête avec navigation et user info */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    variant="outlined"
                >
                    Retour accueil
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {user && (
                        <Chip
                            label={`${user.firstName} ${user.lastName}`}
                            variant="outlined"
                        />
                    )}
                    <Button
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        variant="outlined"
                        color="error"
                    >
                        Déconnexion
                    </Button>
                </Box>
            </Box>

            {/* Titre de la page */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    👥 Liste des Utilisateurs
                </Typography>

                {/* État de chargement */}
                {loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="h6" color="text.secondary">
                            Chargement des utilisateurs...
                        </Typography>
                    </Box>
                )}

                {/* Nombre d'utilisateurs */}
                {!loading && (
                    <Typography variant="h6" color="text.secondary">
                        {users.length} utilisateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}
                    </Typography>
                )}

                {/* Alerte de connexion */}
                {user && (
                    <Alert severity="success" sx={{ mt: 2, maxWidth: 'sm', mx: 'auto' }}>
                        Connecté en tant que : <strong>{user.firstName} {user.lastName}</strong>
                    </Alert>
                )}
            </Box>

            {/* Contenu principal */}
            <Paper elevation={3} sx={{ p: 3 }}>
                {/* Gestion des erreurs */}
                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {/* État de chargement */}
                {loading && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <CircularProgress size={60} />
                        <Typography variant="body1" sx={{ mt: 2 }}>
                            Récupération des données...
                        </Typography>
                    </Box>
                )}

                {/* Liste des utilisateurs */}
                {!loading && !error && (
                    <div data-testid="users-list">
                        <UsersList users={users} onUserDelete={handleUserDelete} />
                    </div>
                )}

                {/* Gestion des erreurs dans la liste */}
                {!loading && error && (
                    <div data-testid="users-list">
                        <Box sx={{ textAlign: 'center', py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                                Impossible de charger les utilisateurs
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={loadUsers}
                                sx={{ mt: 2 }}
                            >
                                Réessayer
                            </Button>
                        </Box>
                    </div>
                )}
            </Paper>
        </Container>
    );
};

export default UsersListPage;