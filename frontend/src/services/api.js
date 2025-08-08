/**
 * Services API pour l'application
 * PAS DE LOCALSTORAGE - Token géré par le contexte
 */

// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL;
const API_TIMEOUT = 10000; // 10 secondes

/**
 * Classe de gestion des erreurs API
 */
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }
}

/**
 * Variable globale pour stocker le token en mémoire
 * Sera définie par le contexte d'authentification
 */
let authToken = null;

/**
 * Fonction pour définir le token (appelée par AuthContext)
 */
export const setAuthToken = (token) => {
    authToken = token;
};

/**
 * Fonction pour supprimer le token
 */
export const clearAuthToken = () => {
    authToken = null;
};

/**
 * Utilitaire pour les requêtes HTTP
 */
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: API_TIMEOUT,
    };

    // Ajouter le token d'authentification si disponible
    if (authToken) {
        defaultOptions.headers.Authorization = `Bearer ${authToken}`;
    }

    const config = { ...defaultOptions, ...options };

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const response = await fetch(url, {
            ...config,
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new ApiError(
                errorData.message || `HTTP ${response.status}`,
                response.status,
                errorData
            );
        }

        return await response.json();

    } catch (error) {
        if (error.name === 'AbortError') {
            throw new ApiError('Timeout de la requête', 408);
        }

        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(
            error.message || 'Erreur réseau',
            0,
            { originalError: error }
        );
    }
};

/**
 * Service d'authentification
 */
export const authService = {
    /**
     * Connexion utilisateur - APPEL API RÉEL
     */
    login: async (credentials) => {


        const response = await apiRequest('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });

        // Définir le token pour les prochaines requêtes
        if (response.token) {
            setAuthToken(response.token);
        }

        return response;
    },

    /**
     * Inscription utilisateur - APPEL API RÉEL
     */
    register: async (userData) => {

        return await apiRequest('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    },

    /**
     * Déconnexion
     */
    logout: async () => {
        try {
            await apiRequest('/api/auth/logout', {
                method: 'POST',
            });
        } finally {
            // Toujours supprimer le token local
            clearAuthToken();
        }
    },

    /**
     * Récupérer l'utilisateur actuel
     */
    getCurrentUser: async () => {
        return await apiRequest('/api/auth/me');
    },

    /**
     * Vérifier si le backend est accessible
     */
    healthCheck: async () => {
        return await apiRequest('/');
    },
};

/**
 * Service utilisateur
 */
export const userService = {
    /**
     * Récupérer tous les utilisateurs
     */
    getAllUsers: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = `/api/users${queryString ? `?${queryString}` : ''}`;
        return await apiRequest(endpoint);
    },

    /**
     * Supprimer un utilisateur
     */
    deleteUser: async (userId) => {
        return await apiRequest(`/api/users/${userId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Récupérer un utilisateur par ID
     */
    getUserById: async (userId) => {
        return await apiRequest(`/api/users/${userId}`);
    },
};

export { ApiError };