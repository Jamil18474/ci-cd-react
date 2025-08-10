import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Chip,
    IconButton,
    Button,
    Tooltip,
    Avatar
} from '@mui/material';
import {
    Person as PersonIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const UsersList = ({ users = [], onUserDelete = null, onViewDetails = null }) => {
    const { isAdmin, hasPermission, user: currentUser } = useAuth();

    const getInitials = (userData) => {
        const first = userData.firstName?.charAt(0)?.toUpperCase() || '';
        const last = userData.lastName?.charAt(0)?.toUpperCase() || '';
        return `${first}${last}`;
    };

    const getAvatarColor = (userData) => {
        if (userData.role === 'admin') return 'error';
        return 'primary';
    };

    // Suppression très simple sans Dialog
    const handleDeleteUser = (userData) => {
        if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${userData.firstName} ${userData.lastName} ?`)) {
            if (onUserDelete) onUserDelete(userData.id);
        }
    };

    // Affichage détails simple sans Dialog
    const handleViewDetails = (userData) => {
        if (onViewDetails) onViewDetails(userData);
        else alert(
            `Nom: ${userData.firstName} ${userData.lastName}\n` +
            `Ville: ${userData.city}\n` +
            `Code postal: ${userData.postalCode}\n` +
            `Rôle: ${userData.role}\n` +
            (userData.permissions ? `Permissions: ${userData.permissions.join(', ')}` : '')
        );
    };

    const canDeleteUser = (userData) =>
        isAdmin() && hasPermission('delete') && userData.id !== currentUser?.id;

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
            <Grid container spacing={3}>
                {users.map((userData, index) => (
                    <Grid item xs={12} sm={6} md={4} key={userData.id || index}>
                        <Card sx={{ height: '100%' }}>
                            <CardContent>
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
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleViewDetails(userData)}
                                        startIcon={<ViewIcon />}
                                        fullWidth
                                    >
                                        Voir détails
                                    </Button>
                                    {canDeleteUser(userData) && (
                                        <Tooltip title="Supprimer">
                                            <IconButton
                                                aria-label="Supprimer"
                                                onClick={() => handleDeleteUser(userData)}
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
        </Box>
    );
};

export default UsersList;