import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import AdminDashboard from '../../pages/AdminDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import '@testing-library/jest-dom';

// Mocks
jest.mock('../../contexts/AuthContext');
jest.mock('../../services/api');

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const AdminDashboardWrapper = ({ authContext = {} }) => {
    const defaultAuthContext = {
        user: { firstName: 'Admin', lastName: 'User' },
        logout: jest.fn(),
        ...authContext
    };

    useAuth.mockReturnValue(defaultAuthContext);

    return (
        <BrowserRouter>
            <AdminDashboard />
        </BrowserRouter>
    );
};

const mockUsers = [
    { id: '1', role: 'user', firstName: 'Jean', lastName: 'Dupont' },
    { id: '2', role: 'admin', firstName: 'Admin', lastName: 'User' },
    { id: '3', role: 'user', firstName: 'Marie', lastName: 'Martin' }
];

describe('AdminDashboard Integration Tests', () => {
    beforeEach(() => {
        useAuth.mockClear();
        userService.getAllUsers.mockClear();
        mockNavigate.mockClear();
        jest.clearAllMocks();
    });

    test('should load and display user statistics (response.users case)', async () => {
        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('📊 Dashboard Administrateur')).toBeInTheDocument();
        });

        expect(screen.getByText('3')).toBeInTheDocument(); // Total users
        expect(screen.getByText('1')).toBeInTheDocument(); // Admins
        expect(screen.getByText('2')).toBeInTheDocument(); // Standard users
    });

    test('should load and display user statistics (response is array)', async () => {
        userService.getAllUsers.mockResolvedValueOnce(mockUsers);

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('📊 Dashboard Administrateur')).toBeInTheDocument();
        });

        expect(screen.getByText('3')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
    });

    test('should fallback to empty array if usersData is not array', async () => {
        userService.getAllUsers.mockResolvedValueOnce({ users: null });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('📊 Dashboard Administrateur')).toBeInTheDocument();
        });

        // Les 3 statistiques sont à zéro
        const zeros = screen.getAllByText('0');
        expect(zeros).toHaveLength(3);

        // Vérifie aussi les intitulés pour être sûr de l'ordre
        expect(screen.getByText('Utilisateurs inscrits')).toBeInTheDocument();
        expect(screen.getByText('Administrateurs')).toBeInTheDocument();
        expect(screen.getByText('Utilisateurs standard')).toBeInTheDocument();
    });

    test('should handle loading error: status 403', async () => {
        userService.getAllUsers.mockRejectedValueOnce({
            status: 403,
            message: 'Accès refusé'
        });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Vous n\'avez pas les droits pour voir les statistiques')).toBeInTheDocument();
        });
    });

    test('should handle loading error: status 500', async () => {
        userService.getAllUsers.mockRejectedValueOnce({
            status: 500,
            message: 'Erreur serveur'
        });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
        });
    });

    test('should handle loading error: status 401', async () => {
        userService.getAllUsers.mockRejectedValueOnce({
            status: 401,
            message: 'Non autorisé'
        });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Session expirée, veuillez vous reconnecter')).toBeInTheDocument();
        });
    });

    test('should handle loading error: status 0', async () => {
        userService.getAllUsers.mockRejectedValueOnce({
            status: 0
        });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Impossible de contacter le serveur')).toBeInTheDocument();
        });
    });

    test('should handle loading error: error.message', async () => {
        userService.getAllUsers.mockRejectedValueOnce({
            message: 'Erreur personnalisée'
        });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Erreur personnalisée')).toBeInTheDocument();
        });
    });

    test('should handle loading error: no status, no message', async () => {
        userService.getAllUsers.mockRejectedValueOnce({});

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Erreur lors du chargement des statistiques')).toBeInTheDocument();
        });
    });

    test('should retry loading after error', async () => {
        const user = userEvent.setup();
        userService.getAllUsers
            .mockRejectedValueOnce({ status: 500, message: 'Erreur serveur' })
            .mockResolvedValueOnce({ users: mockUsers });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Erreur serveur')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Réessayer'));

        await waitFor(() => {
            expect(userService.getAllUsers).toHaveBeenCalledTimes(2);
        });
    });

    test('should show loading state', () => {
        userService.getAllUsers.mockImplementationOnce(() => new Promise(() => {}));

        render(<AdminDashboardWrapper />);

        expect(screen.getByText('Chargement du dashboard administrateur...')).toBeInTheDocument();
    });

    test('should navigate to users management', async () => {
        const user = userEvent.setup();
        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });

        render(<AdminDashboardWrapper />);

        await waitFor(() => {
            expect(screen.getByText('Gérer les utilisateurs')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Gérer les utilisateurs'));

        expect(mockNavigate).toHaveBeenCalledWith('/users');
    });

    test('should logout successfully', async () => {
        const user = userEvent.setup();
        const mockLogout = jest.fn().mockResolvedValueOnce();

        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });

        render(<AdminDashboardWrapper authContext={{ logout: mockLogout }} />);

        await waitFor(() => {
            expect(screen.getByText('Déconnexion')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Déconnexion'));

        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
        }, { timeout: 3000 });
    });

    test('should handle logout error (console.error + navigate)', async () => {
        const user = userEvent.setup();
        const error = new Error('Logout failed');
        const mockLogout = jest.fn().mockRejectedValueOnce(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });

        render(<AdminDashboardWrapper authContext={{ logout: mockLogout }} />);

        await waitFor(() => {
            expect(screen.getByText('Déconnexion')).toBeInTheDocument();
        });

        await user.click(screen.getByText('Déconnexion'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de la déconnexion:', error);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });

        consoleErrorSpy.mockRestore();
    });
});