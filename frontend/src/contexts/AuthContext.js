import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService, setAuthToken, clearAuthToken } from '../services/api';

const AuthContext = createContext();

// Actions
const AUTH_ACTIONS = {
    LOGIN_START: 'LOGIN_START',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    SET_LOADING: 'SET_LOADING',
};

// État initial
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Reducer
const authReducer = (state, action) => {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };
        case AUTH_ACTIONS.LOGIN_START:
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case AUTH_ACTIONS.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case AUTH_ACTIONS.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Initialisation
    useEffect(() => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });

    }, []);

    // IMPORTANT : Synchroniser le token à chaque changement d'état
    useEffect(() => {
        if (state.token) {
            setAuthToken(state.token);
        } else {
            clearAuthToken();
        }
    }, [state.token]);

    const login = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.LOGIN_START });

        try {
            const response = await authService.login(credentials);

            // Mettre à jour l'état (le useEffect synchronisera le token)
            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                    token: response.token,
                    user: response.user,
                },
            });
            return response;

        } catch (error) {
            let errorMessage = 'Erreur de connexion';
            if (error.status === 401) {
                errorMessage = 'Email ou mot de passe incorrect';
            } else if (error.status === 400) {
                errorMessage = 'Données de connexion invalides';
            } else if (error.status === 0) {
                errorMessage = 'Impossible de contacter le serveur';
            } else if (error.message) {
                errorMessage = error.message;
            }

            dispatch({
                type: AUTH_ACTIONS.LOGIN_FAILURE,
                payload: errorMessage,
            });

            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const response = await authService.register(userData);
            return response;
        } catch (error) {
            let errorMessage = 'Erreur lors de l\'inscription';
            if (error.status === 400) {
                if (error.message && error.message.includes('email')) {
                    errorMessage = 'Cette adresse email est déjà utilisée';
                } else {
                    errorMessage = error.message || 'Données invalides';
                }
            } else if (error.status === 0) {
                errorMessage = 'Impossible de contacter le serveur';
            } else if (error.message) {
                errorMessage = error.message;
            }
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            if (state.isAuthenticated) {
                try {
                    await authService.logout();
                } catch (error) {
                    console.warn('⚠️ Erreur lors de la déconnexion API (ignorée):', error);
                }
            }
        } catch (error) {
            console.error('❌ Erreur lors de la déconnexion:', error);
        } finally {
            // Nettoyer l'état (le useEffect supprimera le token)
            dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
    };

    const isAdmin = () => {
        return state.user?.role === 'admin';
    };

    const hasPermission = (permission) => {
        if (!state.isAuthenticated || !state.user) {
            return false;
        }
        if (state.user.role === 'admin') {
            return true;
        }
        return state.user.permissions?.includes(permission) || false;
    };

    const clearError = () => {
        dispatch({
            type: AUTH_ACTIONS.LOGIN_FAILURE,
            payload: null,
        });
    };

    const getUserInfo = () => {
        if (!state.isAuthenticated || !state.user) {
            return null;
        }
        return {
            id: state.user.id,
            fullName: `${state.user.firstName} ${state.user.lastName}`,
            firstName: state.user.firstName,
            lastName: state.user.lastName,
            email: state.user.email,
            role: state.user.role,
            permissions: state.user.permissions || [],
            isAdmin: state.user.role === 'admin',
        };
    };

    const isSessionValid = () => {
        return state.isAuthenticated && state.user && state.token;
    };

    const value = {
        ...state,
        login,
        register,
        logout,
        clearError,
        isAdmin,
        hasPermission,
        getUserInfo,
        isSessionValid,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

export default AuthContext;