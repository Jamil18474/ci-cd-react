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
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// État initial
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Object lookup - plus propre que switch/if
const actionHandlers = {
    [AUTH_ACTIONS.SET_LOADING]: (state, action) => ({
        ...state,
        isLoading: action.payload,
    }),
    [AUTH_ACTIONS.LOGIN_START]: (state) => ({
        ...state,
        isLoading: true,
        error: null,
    }),
    [AUTH_ACTIONS.LOGIN_SUCCESS]: (state, action) => ({
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
    }),
    [AUTH_ACTIONS.LOGIN_FAILURE]: (state, action) => ({
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
    }),
    [AUTH_ACTIONS.LOGOUT]: (state) => ({
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    }),
    [AUTH_ACTIONS.CLEAR_ERROR]: (state) => ({
        ...state,
        error: null,
    }),
};

// Reducer ultra-simple - une seule ligne !
const authReducer = (state, action) =>
    actionHandlers[action.type]?.(state, action) ?? state;

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
    }, []);

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

            dispatch({
                type: AUTH_ACTIONS.LOGIN_SUCCESS,
                payload: {
                    token: response.token,
                    user: response.user,
                },
            });
            return response;

        } catch (error) {
            // SIMPLIFIÉ : Une seule logique d'erreur
            const errorMessage = error?.message || 'Erreur de connexion';

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
            // SIMPLIFIÉ : Une seule logique d'erreur
            const errorMessage = error?.message || 'Erreur lors de l\'inscription';
            throw new Error(errorMessage);
        }
    };

    const logout = async () => {
        try {
            if (state.isAuthenticated) {
                await authService.logout();
            }
        } catch (error) {
            console.warn('⚠️ Erreur lors de la déconnexion API (ignorée):', error);
        }

        dispatch({ type: AUTH_ACTIONS.LOGOUT });
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
            type: AUTH_ACTIONS.CLEAR_ERROR,
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

    // Fonction pour tester la ligne 68 (action inconnue) - uniquement en test
    const __testUnknownAction = () => {
        dispatch({ type: 'UNKNOWN_TEST_ACTION' });
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
        ...(process.env.NODE_ENV === 'test' && { __testUnknownAction }),
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