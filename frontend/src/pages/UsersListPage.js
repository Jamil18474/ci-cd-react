import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Button,
    Alert,
    CircularProgress,
    Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    ArrowBack as ArrowBackIcon,
    ExitToApp as LogoutIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import UsersList from '../components/UsersList';
import { toast } from 'react-toastify';

/**
 * Page liste des utilisateurs - SIMPLIFIÉ
 * Pas de bouton actualiser
 */
const UsersListPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    /**
     * Charge la liste des utilisateurs depuis l'API
     */
    const loadUsers = async () => {
        setLoading(true);
        try {


            const response = await userService.getAllUsers();
            const usersData = response.users || response;

            setUsers(usersData);


        } catch (error) {


            let errorMessage = 'Erreur lors du chargement des utilisateurs';
            if (error.status === 403) {
                errorMessage = 'Vous n\'avez pas les droits pour voir les utilisateurs';
            } else if (error.status === 401) {
                errorMessage = 'Session expirée, veuillez vous reconnecter';
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    /**
     * Gère la suppression d'un utilisateur
     */
    const handleUserDelete = async (userId) => {
        try {
            await userService.deleteUser(userId);
            await loadUsers(); // Recharger automatiquement
            toast.success('Utilisateur supprimé avec succès');
        } catch (error) {


            let errorMessage = 'Erreur lors de la suppression';
            if (error.status === 403) {
                errorMessage = 'Vous n\'avez pas les droits pour supprimer cet utilisateur';
            } else if (error.status === 404) {
                errorMessage = 'Utilisateur introuvable';
            } else if (error.message) {
                errorMessage = error.message;
            }

            toast.error(errorMessage);
            throw error;
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
            console.error('Erreur déconnexion:', error);
            navigate('/');
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Navigation simplifiée - PAS DE BOUTON ACTUALISER */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                {/* Bouton retour */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    variant="outlined"
                >
                    Retour accueil
                </Button>

                {/* Boutons droite */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    {/* Badge utilisateur */}
                    <Chip
                        icon={user?.role === 'admin' ? <AdminIcon /> : undefined}
                        label={`${user?.firstName} ${user?.lastName}`}
                        color={user?.role === 'admin' ? 'primary' : 'default'}
                        variant="outlined"
                    />

                    {/* Bouton Dashboard Admin */}
                    {user?.role === 'admin' && (
                        <Button
                            variant="contained"
                            onClick={() => navigate('/admin')}
                            size="small"
                        >
                            📊 Dashboard
                        </Button>
                    )}

                    {/* Déconnexion */}
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

            {/* En-tête */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h3" component="h1" gutterBottom color="primary">
                    👥 Liste des Utilisateurs
                </Typography>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, my: 2 }}>
                        <CircularProgress size={20} />
                        <Typography variant="h6" color="text.secondary">
                            Chargement...
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="h6" color="text.secondary">
                        {users.length} utilisateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}
                    </Typography>
                )}

                {/* Statut utilisateur connecté */}
                <Alert severity="success" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
                    Connecté en tant que : <strong>{user?.firstName} {user?.lastName}</strong>
                    {user?.role === 'admin' && ' (Administrateur)'}
                </Alert>
            </Box>

            {/* Liste des utilisateurs */}
            <Paper elevation={3} sx={{ p: 3 }}>
                {loading ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <CircularProgress size={60} />
                        <Typography sx={{ mt: 2 }} color="text.secondary">
                            Récupération des données...
                        </Typography>
                    </Box>
                ) : (
                    <UsersList
                        users={users}
                        onUserDelete={handleUserDelete}
                    />
                )}
            </Paper>
        </Container>
    );
};

export default UsersListPage;