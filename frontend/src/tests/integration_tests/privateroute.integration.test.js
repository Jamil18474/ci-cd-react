import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../components/auth/PrivateRoute';
import { useAuth } from '../../contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock useAuth
jest.mock('../../contexts/AuthContext');

const TestComponent = () => <div data-testid="protected-content">Contenu protégé</div>;

const PrivateRouteWrapper = ({ adminOnly, requiredPermission, authState, initialEntries = ['/protected'] }) => {
    useAuth.mockReturnValue(authState);

    return (
        <MemoryRouter initialEntries={initialEntries}>
            <Routes>
                <Route path="/login" element={<div data-testid="login-page">Page de connexion</div>} />
                <Route path="/" element={<div data-testid="home-page">Page d'accueil</div>} />
                <Route
                    path="/protected"
                    element={
                        <PrivateRoute adminOnly={adminOnly} requiredPermission={requiredPermission}>
                            <TestComponent />
                        </PrivateRoute>
                    }
                />
            </Routes>
        </MemoryRouter>
    );
};

describe('PrivateRoute Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test : utilisateur connecté accède au contenu (SANS props - couvre ligne 9)
     */
    test('should render protected content for authenticated user with default props', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => false
        };

        // Ne pas passer adminOnly ni requiredPermission pour couvrir les valeurs par défaut
        render(<PrivateRouteWrapper authState={authState} />);

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : utilisateur connecté accède au contenu (AVEC props explicites)
     */
    test('should render protected content for authenticated user with explicit props', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => false
        };

        render(<PrivateRouteWrapper adminOnly={false} requiredPermission={null} authState={authState} />);

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : utilisateur non connecté redirigé vers login
     */
    test('should redirect unauthenticated user to login', () => {
        const authState = {
            isAuthenticated: false,
            isLoading: false,
            user: null,
            isAdmin: () => false,
            hasPermission: () => false
        };

        render(<PrivateRouteWrapper authState={authState} />);

        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    /**
     * Test : admin accède au contenu admin
     */
    test('should allow admin access to admin-only content', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'admin' },
            isAdmin: () => true,
            hasPermission: () => true
        };

        render(<PrivateRouteWrapper adminOnly={true} authState={authState} />);

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : utilisateur standard refuse l'accès admin
     */
    test('should deny regular user access to admin-only content', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => false
        };

        render(<PrivateRouteWrapper adminOnly={true} authState={authState} />);

        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    /**
     * Test : état de chargement
     */
    test('should show loading state while authenticating', () => {
        const authState = {
            isAuthenticated: false,
            isLoading: true,
            user: null,
            isAdmin: () => false,
            hasPermission: () => false
        };

        render(<PrivateRouteWrapper authState={authState} />);

        expect(screen.getByTestId('loading-state')).toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    /**
     * Test : permission spécifique refusée
     */
    test('should deny access when required permission is missing', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: (perm) => perm !== 'admin' // Retourne false pour 'admin'
        };

        render(
            <PrivateRouteWrapper
                requiredPermission="admin"
                authState={authState}
            />
        );

        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    /**
     * Test : permission spécifique accordée
     */
    test('should allow access when required permission is granted', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: (perm) => perm === 'read' // Retourne true pour 'read'
        };

        render(
            <PrivateRouteWrapper
                requiredPermission="read"
                authState={authState}
            />
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : requiredPermission null (couvre la branche null)
     */
    test('should allow access when requiredPermission is null', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => false // Peu importe car requiredPermission est null
        };

        render(
            <PrivateRouteWrapper
                requiredPermission={null}
                authState={authState}
            />
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : requiredPermission undefined (couvre la branche falsy)
     */
    test('should allow access when requiredPermission is undefined', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => false // Peu importe car requiredPermission est undefined
        };

        render(
            <PrivateRouteWrapper
                requiredPermission={undefined}
                authState={authState}
            />
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : requiredPermission string vide (couvre la branche falsy)
     */
    test('should allow access when requiredPermission is empty string', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => false // Peu importe car requiredPermission est ""
        };

        render(
            <PrivateRouteWrapper
                requiredPermission=""
                authState={authState}
            />
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : adminOnly false explicite (couvre la branche false)
     */
    test('should allow access when adminOnly is explicitly false', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => true
        };

        render(
            <PrivateRouteWrapper
                adminOnly={false}
                authState={authState}
            />
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : cas complexe - admin=true mais isAdmin() retourne true
     */
    test('should allow admin access when adminOnly is true and user is admin', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'admin' },
            isAdmin: () => true, // Admin authentique
            hasPermission: () => true
        };

        render(
            <PrivateRouteWrapper
                adminOnly={true}
                requiredPermission="somePermission"
                authState={authState}
            />
        );

        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });

    /**
     * Test : utilisateur sans permissions définies (edge case)
     */
    test('should handle user without permissions', () => {
        const authState = {
            isAuthenticated: true,
            isLoading: false,
            user: { id: '1', role: 'user' },
            isAdmin: () => false,
            hasPermission: () => false // Toujours false
        };

        render(
            <PrivateRouteWrapper
                requiredPermission="somePermission"
                authState={authState}
            />
        );
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });
});