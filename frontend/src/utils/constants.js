/**
 * @module constants
 * @description Constantes utilisées dans l'application
 */

/**
 * Routes de l'application
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    USERS: '/users',           // Route principale pour les utilisateurs
    ADMIN: '/admin',
    // dashboard supprimé - redirige vers /users
};

// ... reste du fichier identique

/**
 * Rôles utilisateur
 */
export const USER_ROLES = {
    USER: 'user',
    ADMIN: 'admin',
};

/**
 * Permissions utilisateur
 */
export const PERMISSIONS = {
    READ: 'read',
    DELETE: 'delete',
};

/**
 * Messages d'erreur
 */
export const ERROR_MESSAGES = {
    UNAUTHORIZED: 'Vous devez être connecté pour accéder à cette page',
    FORBIDDEN: 'Vous n\'avez pas les droits suffisants pour accéder à cette page',
    ADMIN_REQUIRED: 'Seuls les administrateurs peuvent accéder à cette page',
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    SERVER_ERROR: 'Une erreur serveur s\'est produite',
    NETWORK_ERROR: 'Erreur de connexion au serveur',
};

/**
 * Messages de succès
 */
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Connexion réussie !',
    LOGOUT_SUCCESS: 'Déconnexion réussie !',
    REGISTRATION_SUCCESS: 'Inscription réussie !',
    USER_DELETED: 'Utilisateur supprimé avec succès',
};

/**
 * Configuration de l'API
 */
export const API_CONFIG = {
    BASE_URL: process.env.REACT_APP_API_URL,
    TIMEOUT: 10000,
    ENDPOINTS: {
        AUTH: '/api/auth',
        USERS: '/api/users',
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        ME: '/api/auth/me',
        LOGOUT: '/api/auth/logout',
    },
};

/**
 * Configuration des validateurs
 */
export const VALIDATION_CONFIG = {
    MIN_PASSWORD_LENGTH: 6,
    MIN_AGE: 18,
    POSTAL_CODE_LENGTH: 5,
};

/**
 * Configuration des notifications toast
 */
export const TOAST_CONFIG = {
    POSITION: 'top-right',
    AUTO_CLOSE: 5000,
    HIDE_PROGRESS_BAR: false,
    CLOSE_ON_CLICK: true,
    PAUSE_ON_HOVER: true,
    DRAGGABLE: true,
    THEME: 'light',
};

/**
 * Configuration de l'application
 */
export const APP_CONFIG = {
    NAME: 'Plateforme Utilisateurs',
    VERSION: '1.0.0',
    DESCRIPTION: 'Gestion des utilisateurs avec authentification',
};