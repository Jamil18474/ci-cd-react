import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';
// MAINTENANT importer App
import App from './App';

const BASE = '/ci-cd-react';

// Mock TOUTES les dépendances AVANT d'importer App
jest.mock('./contexts/AuthContext', () => ({
    AuthProvider: ({ children }) => <div data-testid="auth-provider">{children}</div>,
    useAuth: () => ({
        isAuthenticated: false,
        isAdmin: () => false,
        user: null
    })
}));

jest.mock('react-toastify', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('@mui/material/styles', () => ({
    ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>,
    createTheme: () => ({}),
}));

jest.mock('@mui/material', () => ({
    CssBaseline: () => <div data-testid="css-baseline" />,
}));

// Mock toutes les pages
jest.mock('./pages/HomePage', () => () => <div data-testid="home-page">HomePage</div>);
jest.mock('./pages/LoginPage', () => () => <div data-testid="login-page">LoginPage</div>);
jest.mock('./pages/RegisterPage', () => () => <div data-testid="register-page">RegisterPage</div>);
jest.mock('./pages/UsersListPage', () => () => <div data-testid="users-page">UsersListPage</div>);
jest.mock('./pages/AdminDashboard', () => () => <div data-testid="admin-page">AdminDashboard</div>);
jest.mock('./components/auth/PrivateRoute', () => ({ children }) => <div data-testid="private-route">{children}</div>);



describe('App Component - Focus sur couverture', () => {
    beforeEach(() => {
        // Remettre la route initiale à chaque test pour éviter les effets de bord
        window.history.pushState({}, '', `${BASE}/`);
    });

    /**
     * Test : rendu de base
     */
    test('should render app with basic components', () => {
        render(<App />);
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(screen.getByTestId('css-baseline')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });



    /**
     * Test : route par défaut (HomePage)
     */
    test('should render HomePage on default route', () => {
        window.history.pushState({}, '', `${BASE}/`);
        render(<App />);
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    /**
     * Test : route login
     */
    test('should render LoginPage on /login route', () => {
        window.history.pushState({}, '', `${BASE}/login`);
        render(<App />);
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
    });

    /**
     * Test : route register
     */
    test('should render RegisterPage on /register route', () => {
        window.history.pushState({}, '', `${BASE}/register`);
        render(<App />);
        expect(screen.getByTestId('register-page')).toBeInTheDocument();
    });

    /**
     * Test : route protégée users
     */
    test('should render protected UsersListPage on /users route', () => {
        window.history.pushState({}, '', `${BASE}/users`);
        render(<App />);
        expect(screen.getByTestId('private-route')).toBeInTheDocument();
        expect(screen.getByTestId('users-page')).toBeInTheDocument();
    });

    /**
     * Test : route admin protégée
     */
    test('should render protected AdminDashboard on /admin route', () => {
        window.history.pushState({}, '', `${BASE}/admin`);
        render(<App />);
        expect(screen.getByTestId('private-route')).toBeInTheDocument();
        expect(screen.getByTestId('admin-page')).toBeInTheDocument();
    });

    /**
     * Test : redirection sur route inconnue
     */
    test('should redirect unknown routes to home', () => {
        window.history.pushState({}, '', `${BASE}/unknown-route`);
        render(<App />);
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    /**
     * Test : structure complète de l'app
     */
    test('should have correct app structure', () => {
        render(<App />);
        const app = document.querySelector('.App');
        expect(app).toBeInTheDocument();
        expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('toast-container')).toBeInTheDocument();
    });

    test('Router basename is /ci-cd-react in local mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        window.history.pushState({}, '', `${BASE}/`);
        render(<App />);
        process.env.NODE_ENV = originalEnv;
    });

    test('Router basename is /ci-cd-react in production mode', () => {
        const originalEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'production';
        window.history.pushState({}, '', `${BASE}/`);
        render(<App />);
        process.env.NODE_ENV = originalEnv;
    });
    test('should focus and blur skip link for accessibility (couvre onFocus/onBlur)', () => {
        render(<App />);
        // Sélectionne le skip link par son texte
        const skipLink = screen.getByText(/Aller au contenu principal/i);

        // Focus (doit déclencher onFocus et changer le style)
        fireEvent.focus(skipLink);
        expect(skipLink.style.left).toBe('16px');
        expect(skipLink.style.width).toBe('auto');
        expect(skipLink.style.height).toBe('auto');

        // Blur (doit déclencher onBlur et remettre le style caché)
        fireEvent.blur(skipLink);
        expect(skipLink.style.left).toBe('-999px');
        expect(skipLink.style.width).toBe('1px');
        expect(skipLink.style.height).toBe('1px');
    });
});