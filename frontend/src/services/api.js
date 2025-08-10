/**
 * Services API pour l'application
 * PAS DE LOCALSTORAGE - Token géré par le contexte
 */

// Configuration de base
const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Classe de gestion des erreurs API
 */
class ApiError extends Error {
    constructor(message, status, data) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        if (data !== undefined) {
            this.data = data;
        }
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
        }
    };

    // Ajouter le token d'authentification si disponible
    if (authToken) {
        defaultOptions.headers.Authorization = `Bearer ${authToken}`;
    }

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);

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
        if (error instanceof ApiError) {
            throw error;
        }

        // Gestion des erreurs réseau
        if (error.message === 'Failed to fetch' || (error.message && error.message.includes('fetch'))) {
            throw new ApiError('Erreur réseau - impossible de contacter le serveur', 0, { originalError: error });
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
        if (!credentials.email || !credentials.password) {
            throw new ApiError('Email et mot de passe requis', 400);
        }

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
        if (!userData.email || !userData.password) {
            throw new ApiError('Email et mot de passe requis', 400);
        }

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
        } catch (error) {
            // Ne pas lancer l'erreur pour la déconnexion
            console.warn('Erreur lors de la déconnexion API:', error);
        } finally {
            // Toujours supprimer le token local
            clearAuthToken();
        }
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
        if (!userId) {
            throw new ApiError('ID utilisateur requis', 400);
        }

        return await apiRequest(`/api/users/${userId}`, {
            method: 'DELETE',
        });
    },
};

export { ApiError };