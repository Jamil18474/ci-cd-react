import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/api';
import '@testing-library/jest-dom';

// Mock du service API
jest.mock('../../services/api', () => ({
    authService: {
        login: jest.fn(),
        logout: jest.fn(),
        register: jest.fn()
    },
    setAuthToken: jest.fn(),
    clearAuthToken: jest.fn()
}));

// Composant de test pour register
const RegisterTestComponent = () => {
    const { register } = useAuth();
    const [registerError, setRegisterError] = React.useState(null);

    const handleRegister = async () => {
        try {
            await register({ firstName: 'Test', email: 'test@test.com' });
            setRegisterError(null);
        } catch (err) {
            setRegisterError(err.message);
        }
    };

    return (
        <div>
            <div data-testid="register-error">
                {registerError || 'No error'}
            </div>
            <button data-testid="register-btn" onClick={handleRegister}>
                Register
            </button>
        </div>
    );
};

// Composant de test principal
const TestComponent = () => {
    const {
        isAuthenticated,
        login,
        logout,
        user,
        error,
        clearError,
        isAdmin,
        hasPermission,
        getUserInfo,
        isSessionValid,
        isLoading,
        __testUnknownAction
    } = useAuth();

    const handleLogin = async () => {
        try {
            await login({ email: 'test@test.com', password: 'test' });
        } catch (err) {
            // Erreur gérée par le contexte
        }
    };

    return (
        <div>
            <div data-testid="auth-status">
                {isAuthenticated ? 'Connected' : 'Disconnected'}
            </div>
            <div data-testid="user-name">
                {user ? `${user.firstName} ${user.lastName}` : 'No user'}
            </div>
            <div data-testid="auth-error">
                {error || 'No error'}
            </div>
            <div data-testid="is-admin">
                {isAdmin() ? 'Is Admin' : 'Not Admin'}
            </div>
            <div data-testid="has-permission">
                {hasPermission('delete') ? 'Has Delete' : 'No Delete'}
            </div>
            <div data-testid="user-info">
                {getUserInfo() ? 'Has Info' : 'No Info'}
            </div>
            <div data-testid="session-valid">
                {isSessionValid() ? 'Session Valid' : 'Session Invalid'}
            </div>
            <div data-testid="loading">
                {isLoading ? 'Loading' : 'Not Loading'}
            </div>

            <button data-testid="login-btn" onClick={handleLogin}>
                Login
            </button>
            <button data-testid="logout-btn" onClick={logout}>
                Logout
            </button>
            <button data-testid="clear-error-btn" onClick={clearError}>
                Clear Error
            </button>
            {__testUnknownAction && (
                <button data-testid="unknown-action-btn" onClick={__testUnknownAction}>
                    Test Unknown Action
                </button>
            )}
        </div>
    );
};

describe('AuthContext Integration Tests (Simplified)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ✅ Test essentiel : état initial
    test('should provide initial disconnected state', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('auth-status')).toHaveTextContent('Disconnected');
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });

    // ✅ Test essentiel : connexion réussie
    test('should handle successful login', async () => {
        const mockUser = { firstName: 'John', lastName: 'Doe', role: 'admin', permissions: ['delete'] };
        authService.login.mockResolvedValueOnce({
            token: 'fake-token',
            user: mockUser
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Connected');
            expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
            expect(screen.getByTestId('is-admin')).toHaveTextContent('Is Admin');
            expect(screen.getByTestId('has-permission')).toHaveTextContent('Has Delete');
        });
    });

    // ✅ Test essentiel : erreur de connexion générique
    test('should handle login error', async () => {
        authService.login.mockRejectedValueOnce(new Error('Login failed'));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-error')).toHaveTextContent('Login failed');
        });
    });

    // ✅ Test essentiel : erreur de connexion sans message
    test('should handle login error without message', async () => {
        authService.login.mockRejectedValueOnce({});

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-error')).toHaveTextContent('Erreur de connexion');
        });
    });

    // ✅ Test essentiel : clearError
    test('should clear error', async () => {
        authService.login.mockRejectedValueOnce(new Error('Test error'));

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-error')).toHaveTextContent('Test error');
        });

        fireEvent.click(screen.getByTestId('clear-error-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-error')).toHaveTextContent('No error');
        });
    });

    // ✅ Test essentiel : inscription réussie
    test('should handle successful registration', async () => {
        authService.register.mockResolvedValueOnce({ message: 'Success' });

        render(
            <AuthProvider>
                <RegisterTestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('register-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('register-error')).toHaveTextContent('No error');
        });
    });

    // ✅ Test essentiel : erreur inscription
    test('should handle registration error', async () => {
        authService.register.mockRejectedValueOnce(new Error('Registration failed'));

        render(
            <AuthProvider>
                <RegisterTestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('register-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('register-error')).toHaveTextContent('Registration failed');
        });
    });

    // ✅ Test essentiel : erreur inscription sans message
    test('should handle registration error without message', async () => {
        authService.register.mockRejectedValueOnce({});

        render(
            <AuthProvider>
                <RegisterTestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('register-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('register-error')).toHaveTextContent('Erreur lors de l\'inscription');
        });
    });

    // ✅ Test essentiel : déconnexion
    test('should handle logout', async () => {
        const mockUser = { firstName: 'John', lastName: 'Doe', role: 'user' };
        authService.login.mockResolvedValueOnce({
            token: 'fake-token',
            user: mockUser
        });
        authService.logout.mockResolvedValueOnce();

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Connected');
        });

        fireEvent.click(screen.getByTestId('logout-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Disconnected');
        });
    });

    // ✅ Test essentiel : déconnexion quand pas connecté
    test('should handle logout when not authenticated', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('logout-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Disconnected');
        });

        expect(authService.logout).not.toHaveBeenCalled();
    });

    // ✅ Test essentiel : déconnexion avec erreur API
    test('should handle logout with API error', async () => {
        const mockUser = { firstName: 'John', lastName: 'Doe', role: 'user' };
        authService.login.mockResolvedValueOnce({
            token: 'fake-token',
            user: mockUser
        });
        authService.logout.mockRejectedValueOnce(new Error('Logout error'));

        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        fireEvent.click(screen.getByTestId('login-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Connected');
        });

        fireEvent.click(screen.getByTestId('logout-btn'));

        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Disconnected');
            expect(consoleSpy).toHaveBeenCalledWith('⚠️ Erreur lors de la déconnexion API (ignorée):', expect.any(Error));
        });

        consoleSpy.mockRestore();
    });

    // ✅ Test essentiel : useAuth en dehors du provider
    test('should throw error when useAuth is used outside AuthProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');

        consoleSpy.mockRestore();
    });

    // ✅ Test essentiel : action inconnue pour couvrir la ligne 68
    test('should handle unknown action and return current state', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Déclencher l'action inconnue pour couvrir la ligne 68
        fireEvent.click(screen.getByTestId('unknown-action-btn'));

        // L'état ne devrait pas changer
        await waitFor(() => {
            expect(screen.getByTestId('auth-status')).toHaveTextContent('Disconnected');
        });
    });
});