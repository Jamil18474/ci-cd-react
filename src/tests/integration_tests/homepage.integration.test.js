import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import HomePage from '../../pages/HomePage';
import { useAuth } from '../../contexts/AuthContext';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';

// Mock des dépendances
jest.mock('../../contexts/AuthContext');

// Mock toastify pour tester les toasts de succès/erreur
jest.mock('react-toastify', () => ({
    ...jest.requireActual('react-toastify'),
    toast: { success: jest.fn(), error: jest.fn() }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const HomePageWrapper = ({ authState }) => {
    useAuth.mockReturnValue(authState);

    return (
        <BrowserRouter>
            <HomePage />
        </BrowserRouter>
    );
};

describe('HomePage Integration Tests', () => {
    beforeEach(() => {
        mockNavigate.mockClear();
        toast.success.mockClear();
        toast.error.mockClear();
    });

    /**
     * Test : utilisateur non connecté voit les options d'inscription/connexion
     */
    test('should show login and register options for unauthenticated user', () => {
        const authState = {
            isAuthenticated: false,
            user: null,
            isAdmin: jest.fn().mockReturnValue(false)
        };

        render(<HomePageWrapper authState={authState} />);

        expect(screen.getByText('🌟 Plateforme Utilisateurs')).toBeInTheDocument();
        expect(screen.getByText('🔐 Se connecter')).toBeInTheDocument();
        expect(screen.getByText('📝 S\'inscrire')).toBeInTheDocument();
        expect(screen.getByText('✨ Fonctionnalités')).toBeInTheDocument();
    });

    /**
     * Test : navigation vers login
     */
    test('should navigate to login when clicking login button', async () => {
        const user = userEvent.setup();
        const authState = {
            isAuthenticated: false,
            user: null,
            isAdmin: jest.fn().mockReturnValue(false)
        };

        render(<HomePageWrapper authState={authState} />);

        await user.click(screen.getByText('🔐 Se connecter'));
        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    /**
     * Test : navigation vers register
     */
    test('should navigate to register when clicking register button', async () => {
        const user = userEvent.setup();
        const authState = {
            isAuthenticated: false,
            user: null,
            isAdmin: jest.fn().mockReturnValue(false)
        };

        render(<HomePageWrapper authState={authState} />);

        await user.click(screen.getByText('📝 S\'inscrire'));
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    /**
     * Test : utilisateur connecté admin voit le dashboard admin
     */
    test('should show admin dashboard for authenticated admin', () => {
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin' },
            isAdmin: jest.fn().mockReturnValue(true)
        };

        render(<HomePageWrapper authState={authState} />);

        expect(screen.getByText('🎉 Bienvenue, Admin !')).toBeInTheDocument();
        expect(screen.getByText('📊 Dashboard Administrateur')).toBeInTheDocument();
        expect(screen.getByText('👥 Gérer les utilisateurs')).toBeInTheDocument();
        expect(screen.getByText('Rôle :')).toBeInTheDocument();
        expect(screen.getByText('Administrateur')).toBeInTheDocument();
    });

    /**
     * Test : utilisateur standard voit les utilisateurs
     */
    test('should show users page for authenticated regular user', () => {
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', role: 'user' },
            isAdmin: jest.fn().mockReturnValue(false)
        };

        render(<HomePageWrapper authState={authState} />);

        expect(screen.getByText('🎉 Bienvenue, Jean !')).toBeInTheDocument();
        expect(screen.getByText('👥 Voir les utilisateurs')).toBeInTheDocument();
        expect(screen.getByText('Rôle :')).toBeInTheDocument();
        expect(screen.getByText('Utilisateur')).toBeInTheDocument();
    });

    /**
     * Test : navigation vers admin dashboard
     */
    test('should navigate to admin dashboard when clicking admin button', async () => {
        const user = userEvent.setup();
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin' },
            isAdmin: jest.fn().mockReturnValue(true)
        };

        render(<HomePageWrapper authState={authState} />);

        await user.click(screen.getByText('📊 Dashboard Administrateur'));
        expect(mockNavigate).toHaveBeenCalledWith('/admin');
    });

    /**
     * Test : navigation vers gestion utilisateurs (admin)
     */
    test('should navigate to users management when clicking admin users button', async () => {
        const user = userEvent.setup();
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin' },
            isAdmin: jest.fn().mockReturnValue(true)
        };

        render(<HomePageWrapper authState={authState} />);

        await user.click(screen.getByText('👥 Gérer les utilisateurs'));
        expect(mockNavigate).toHaveBeenCalledWith('/users');
    });

    /**
     * Test : navigation vers utilisateurs (utilisateur standard)
     */
    test('should navigate to users page when clicking users button as regular user', async () => {
        const user = userEvent.setup();
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', role: 'user' },
            isAdmin: jest.fn().mockReturnValue(false)
        };

        render(<HomePageWrapper authState={authState} />);

        await user.click(screen.getByText('👥 Voir les utilisateurs'));
        expect(mockNavigate).toHaveBeenCalledWith('/users');
    });

    /**
     * Test : affichage des informations de profil pour admin
     */
    test('should display admin profile information', () => {
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Admin', lastName: 'User', email: 'admin@test.com', role: 'admin' },
            isAdmin: jest.fn().mockReturnValue(true)
        };

        render(<HomePageWrapper authState={authState} />);

        expect(screen.getByText('👤 Votre Profil')).toBeInTheDocument();
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('admin@test.com')).toBeInTheDocument();
        expect(screen.getByText('Administrateur')).toBeInTheDocument();
    });

    /**
     * Test : affichage des informations de profil pour utilisateur standard
     */
    test('should display regular user profile information', () => {
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', role: 'user' },
            isAdmin: jest.fn().mockReturnValue(false)
        };

        render(<HomePageWrapper authState={authState} />);

        expect(screen.getByText('👤 Votre Profil')).toBeInTheDocument();
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
        expect(screen.getByText('jean@test.com')).toBeInTheDocument();
        expect(screen.getByText('Utilisateur')).toBeInTheDocument();
    });

    /**
     * Test : vérification des fonctionnalités pour utilisateur non connecté
     */
    test('should display features section for unauthenticated user', () => {
        const authState = {
            isAuthenticated: false,
            user: null,
            isAdmin: jest.fn().mockReturnValue(false)
        };

        render(<HomePageWrapper authState={authState} />);

        expect(screen.getByText('✨ Fonctionnalités')).toBeInTheDocument();
        expect(screen.getByText('🔒 Sécurisé')).toBeInTheDocument();
        expect(screen.getByText('👥 Communauté')).toBeInTheDocument();
        expect(screen.getByText('⚡ Moderne')).toBeInTheDocument();
    });

    /**
     * Test : vérification que isAdmin est appelé pour utilisateur connecté
     */
    test('should call isAdmin function for authenticated users', () => {
        const isAdminMock = jest.fn().mockReturnValue(false);
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', role: 'user' },
            isAdmin: isAdminMock
        };

        render(<HomePageWrapper authState={authState} />);

        expect(isAdminMock).toHaveBeenCalled();
    });

    /**
     * Test : déconnexion (succès)
     */
    test('should logout and navigate to / when clicking logout (success)', async () => {
        const user = userEvent.setup();
        const logoutMock = jest.fn().mockResolvedValue();
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', role: 'user' },
            isAdmin: jest.fn().mockReturnValue(false),
            logout: logoutMock
        };
        render(<HomePageWrapper authState={authState} />);
        await user.click(screen.getByText('Déconnexion'));
        expect(logoutMock).toHaveBeenCalled();
        expect(toast.success).toHaveBeenCalledWith('Déconnexion réussie');
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    /**
     * Test : déconnexion (échec)
     */
    test('should show error toast if logout fails', async () => {
        const user = userEvent.setup();
        const logoutMock = jest.fn().mockRejectedValue(new Error('fail'));
        const authState = {
            isAuthenticated: true,
            user: { firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', role: 'user' },
            isAdmin: jest.fn().mockReturnValue(false),
            logout: logoutMock
        };
        render(<HomePageWrapper authState={authState} />);
        await user.click(screen.getByText('Déconnexion'));
        expect(logoutMock).toHaveBeenCalled();
        expect(toast.error).toHaveBeenCalledWith('Erreur lors de la déconnexion');
    });
});