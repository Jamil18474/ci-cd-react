import React, { useState } from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip,
    IconButton,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Tooltip,
    Avatar
} from '@mui/material';
import {
    Person as PersonIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    LocationCity as CityIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/api';
import { toast } from 'react-toastify';

/**
 * Interface UNIFIÉE - Même expérience pour admin et user
 * Infos principales + bouton détails pour tous
 */
const UsersList = ({ users = [], onUserDelete = null }) => {
    const { isAdmin, hasPermission, user: currentUser } = useAuth();
    const [selectedUser, setSelectedUser] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [loading, setLoading] = useState(false);

    const getInitials = (userData) => {
        const first = userData.firstName?.charAt(0)?.toUpperCase() || '';
        const last = userData.lastName?.charAt(0)?.toUpperCase() || '';
        return `${first}${last}`;
    };

    const getAvatarColor = (userData) => {
        if (userData.role === 'admin') return 'error';
        return 'primary';
    };

    const handleDeleteUser = async () => {
        if (!deleteDialog.user) return;
        setLoading(true);
        try {
            if (onUserDelete) {
                await onUserDelete(deleteDialog.user.id);
            } else {
                await userService.deleteUser(deleteDialog.user.id);
            }
            toast.success(`Utilisateur ${deleteDialog.user.firstName} ${deleteDialog.user.lastName} supprimé`);
            setDeleteDialog({ open: false, user: null });
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Erreur lors de la suppression';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const canDeleteUser = (userData) => {
        if (!isAdmin()) return false;
        if (!hasPermission('delete')) return false;
        if (userData.id === currentUser?.id) return false;
        return true;
    };

    if (!users || users.length === 0) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        Aucun utilisateur inscrit
                    </Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Box>
            {/* En-tête */}
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Liste des Utilisateurs
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {users.length} utilisateur{users.length > 1 ? 's' : ''} inscrit{users.length > 1 ? 's' : ''}
                    </Typography>
                </Box>

                {isAdmin() && (
                    <Chip
                        icon={<AdminIcon />}
                        label="Droits Administrateur"
                        color="primary"
                        variant="outlined"
                    />
                )}
            </Box>

            {/* INTERFACE UNIFIÉE - Vue grille compacte pour TOUS */}
            <Grid container spacing={3}>
                {users.map((userData, index) => (
                    <Grid item xs={12} sm={6} md={4} key={userData.id || index}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
                                {/* INFOS PRINCIPALES SEULEMENT */}
                                <Box sx={{ textAlign: 'center', mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 60,
                                            height: 60,
                                            mx: 'auto',
                                            mb: 2,
                                            bgcolor: `${getAvatarColor(userData)}.main`,
                                            color: `${getAvatarColor(userData)}.contrastText`
                                        }}
                                    >
                                        {getInitials(userData)}
                                    </Avatar>

                                    <Typography variant="h6" gutterBottom>
                                        {userData.firstName} {userData.lastName}
                                    </Typography>

                                    {userData.role === 'admin' && (
                                        <Chip
                                            icon={<AdminIcon />}
                                            label="Admin"
                                            size="small"
                                            color="error"
                                            sx={{ mb: 1 }}
                                        />
                                    )}

                                    <Typography variant="body2" color="text.secondary">
                                        {userData.city}
                                    </Typography>
                                </Box>

                                {/* ACTIONS - Bouton détails pour TOUS */}
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => setSelectedUser(userData)}
                                        startIcon={<ViewIcon />}
                                        fullWidth
                                    >
                                        Voir détails
                                    </Button>

                                    {canDeleteUser(userData) && (
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                onClick={() => setDeleteDialog({ open: true, user: userData })}
                                                size="small"
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Dialog DÉTAILS - Même contenu pour tous avec infos admin en plus */}
            <Dialog
                open={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                maxWidth="sm"
                fullWidth
            >
                {selectedUser && (
                    <>
                        <DialogTitle>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar
                                    sx={{
                                        bgcolor: `${getAvatarColor(selectedUser)}.main`,
                                        color: `${getAvatarColor(selectedUser)}.contrastText`
                                    }}
                                >
                                    {getInitials(selectedUser)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h6">
                                        {selectedUser.firstName} {selectedUser.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Détails du profil
                                    </Typography>
                                </Box>
                            </Box>
                        </DialogTitle>

                        <DialogContent>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {/* INFORMATIONS PUBLIQUES */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CityIcon color="primary" />
                                    <Typography variant="body1">
                                        <strong>Ville :</strong> {selectedUser.city}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CityIcon color="primary" />
                                    <Typography variant="body1">
                                        <strong>Code postal :</strong> {selectedUser.postalCode}
                                    </Typography>
                                </Box>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AdminIcon color={selectedUser.role === 'admin' ? 'error' : 'primary'} />
                                    <Typography variant="body1">
                                        <strong>Rôle :</strong> {selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                                    </Typography>
                                </Box>

                                {/* INFORMATIONS ADMIN - Seulement pour les admins */}
                                {isAdmin() && (
                                    <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                                        <Typography variant="subtitle2" gutterBottom color="primary">
                                            <AdminIcon sx={{ fontSize: 16, mr: 1 }} />
                                            Informations administrateur
                                        </Typography>
                                        {selectedUser.permissions && (
                                            <Typography variant="body2" sx={{ mb: 1 }}>
                                                <strong>Permissions :</strong> {selectedUser.permissions.join(', ')}
                                            </Typography>
                                        )}
                                        {selectedUser.createdAt && (
                                            <Typography variant="body2">
                                                <strong>Inscrit le :</strong> {new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')}
                                            </Typography>
                                        )}
                                    </Box>
                                )}


                            </Box>
                        </DialogContent>

                        <DialogActions>
                            <Button onClick={() => setSelectedUser(null)}>
                                Fermer
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            {/* Dialog suppression */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        Cette action est irréversible !
                    </Alert>
                    <Typography>
                        Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
                        <strong>
                            {deleteDialog.user?.firstName} {deleteDialog.user?.lastName}
                        </strong> ?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })} disabled={loading}>
                        Annuler
                    </Button>
                    <Button
                        onClick={handleDeleteUser}
                        color="error"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? 'Suppression...' : 'Supprimer'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UsersList;