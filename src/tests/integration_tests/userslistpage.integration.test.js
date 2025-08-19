import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UsersListPage from '../../pages/UsersListPage';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import '@testing-library/jest-dom';

// Mock des dépendances dont toast
jest.mock('../../contexts/AuthContext');
jest.mock('../../services/api');
import { toast } from 'react-toastify';
jest.mock('react-toastify', () => ({
    ...jest.requireActual('react-toastify'),
    toast: { success: jest.fn(), error: jest.fn() }
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const UsersListPageWrapper = ({ authContext = {} }) => {
    const defaultAuthContext = {
        user: { firstName: 'Admin', lastName: 'Test', id: '99' },
        logout: jest.fn(),
        isAdmin: () => true,
        hasPermission: () => true,
        ...authContext
    };

    useAuth.mockReturnValue(defaultAuthContext);

    return (
        <BrowserRouter>
            <UsersListPage />
        </BrowserRouter>
    );
};

const mockUsers = [
    { id: '1', firstName: 'Jean', lastName: 'Dupont', city: 'Paris', role: 'user' },
    { id: '2', firstName: 'Marie', lastName: 'Martin', city: 'Lyon', role: 'admin' }
];

describe('UsersListPage Integration Tests', () => {
    beforeEach(() => {
        useAuth.mockClear();
        userService.getAllUsers.mockClear();
        userService.deleteUser.mockClear();
        mockNavigate.mockClear();
        toast.success.mockClear();
        toast.error.mockClear();
        jest.clearAllMocks();
    });

    test('should load users (response.users present)', async () => {
        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('Liste des Utilisateurs')).toBeInTheDocument();
        });
        expect(screen.getAllByText('Jean Dupont').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Marie Martin').length).toBeGreaterThanOrEqual(1);
    });

    test('should load users (response is array)', async () => {
        userService.getAllUsers.mockResolvedValueOnce([...mockUsers]);
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('Liste des Utilisateurs')).toBeInTheDocument();
        });
        expect(screen.getAllByText('Jean Dupont').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Marie Martin').length).toBeGreaterThanOrEqual(1);
    });

    test('should set users to empty if usersData is not array', async () => {
        userService.getAllUsers.mockResolvedValueOnce({ users: null });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('0 utilisateur inscrit')).toBeInTheDocument();
        });
        expect(screen.getByText('Aucun utilisateur inscrit')).toBeInTheDocument();
    });

    test('should handle loading error: status 403', async () => {
        userService.getAllUsers.mockRejectedValueOnce({ status: 403 });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText("Vous n'avez pas les droits pour voir les utilisateurs")).toBeInTheDocument();
        });
    });

    test('should handle loading error: status 401', async () => {
        userService.getAllUsers.mockRejectedValueOnce({ status: 401 });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('Session expirée, veuillez vous reconnecter')).toBeInTheDocument();
        });
    });

    test('should handle loading error: error.message', async () => {
        userService.getAllUsers.mockRejectedValueOnce({ message: "Erreur personnalisée" });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('Erreur personnalisée')).toBeInTheDocument();
        });
    });

    test('should handle loading error: default', async () => {
        userService.getAllUsers.mockRejectedValueOnce({});
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('Erreur lors du chargement des utilisateurs')).toBeInTheDocument();
        });
    });

    test('should retry loading users after error', async () => {
        const user = userEvent.setup();
        userService.getAllUsers
            .mockRejectedValueOnce({ message: 'Erreur réseau' })
            .mockResolvedValueOnce({ users: mockUsers });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('Erreur réseau')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Réessayer'));
        await waitFor(() => {
            expect(screen.getAllByText('Jean Dupont').length).toBeGreaterThanOrEqual(1);
        });
        expect(userService.getAllUsers).toHaveBeenCalledTimes(2);
    });

    test('should logout successfully', async () => {
        const user = userEvent.setup();
        const mockLogout = jest.fn().mockResolvedValueOnce();
        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });
        render(<UsersListPageWrapper authContext={{ logout: mockLogout }} />);
        await waitFor(() => {
            expect(screen.getByText('Déconnexion')).toBeInTheDocument();
        });
        await user.click(screen.getByText('Déconnexion'));
        await waitFor(() => {
            expect(mockLogout).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    test('should handle logout error (console.error + navigate)', async () => {
        const user = userEvent.setup();
        const error = new Error('Logout failed');
        const mockLogout = jest.fn().mockRejectedValueOnce(error);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });
        render(<UsersListPageWrapper authContext={{ logout: mockLogout }} />);
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

    test('should handle user deletion (success)', async () => {
        const user = userEvent.setup();
        userService.getAllUsers.mockResolvedValue({ users: mockUsers });
        userService.deleteUser.mockResolvedValueOnce({});

        render(
            <UsersListPageWrapper authContext={{
                user: { firstName: 'Admin', lastName: 'Test', id: '99' },
                isAdmin: () => true,
                hasPermission: () => true
            }} />
        );

        await waitFor(() => {
            expect(screen.getByText('Liste des Utilisateurs')).toBeInTheDocument();
        });

        window.confirm = jest.fn(() => true);

        const deleteBtns = screen.getAllByRole('button', { name: /supprimer/i });
        expect(deleteBtns.length).toBeGreaterThan(0);
        await user.click(deleteBtns[0]);
        expect(userService.deleteUser).toHaveBeenCalledWith('1');
        expect(toast.success).toHaveBeenCalledWith('Utilisateur supprimé avec succès');
    });

    test('should handle user deletion (error - custom message)', async () => {
        const user = userEvent.setup();
        userService.getAllUsers.mockResolvedValue({ users: mockUsers });
        userService.deleteUser.mockRejectedValueOnce({ response: { data: { message: 'Suppression impossible' } } });

        render(
            <UsersListPageWrapper authContext={{
                user: { firstName: 'Admin', lastName: 'Test', id: '99' },
                isAdmin: () => true,
                hasPermission: () => true
            }} />
        );

        await waitFor(() => {
            expect(screen.getByText('Liste des Utilisateurs')).toBeInTheDocument();
        });

        window.confirm = jest.fn(() => true);

        const deleteBtns = screen.getAllByRole('button', { name: /supprimer/i });
        expect(deleteBtns.length).toBeGreaterThan(0);

        // Evite que Jest plante sur une unhandledRejection
        await expect(user.click(deleteBtns[0])).resolves.toBeUndefined();
        expect(userService.deleteUser).toHaveBeenCalledWith('1');
        expect(toast.error).toHaveBeenCalledWith('Suppression impossible');
    });

    test('should handle user deletion (error - fallback message)', async () => {
        const user = userEvent.setup();
        userService.getAllUsers.mockResolvedValue({ users: mockUsers });
        userService.deleteUser.mockRejectedValueOnce({});

        render(
            <UsersListPageWrapper authContext={{
                user: { firstName: 'Admin', lastName: 'Test', id: '99' },
                isAdmin: () => true,
                hasPermission: () => true
            }} />
        );

        await waitFor(() => {
            expect(screen.getByText('Liste des Utilisateurs')).toBeInTheDocument();
        });

        window.confirm = jest.fn(() => true);

        const deleteBtns = screen.getAllByRole('button', { name: /supprimer/i });
        expect(deleteBtns.length).toBeGreaterThan(0);

        // Evite que Jest plante sur une unhandledRejection
        await expect(user.click(deleteBtns[0])).resolves.toBeUndefined();
        expect(userService.deleteUser).toHaveBeenCalledWith('1');
        expect(toast.error).toHaveBeenCalledWith('Erreur lors de la suppression');
    });

    test('should navigate back to home', async () => {
        const user = userEvent.setup();
        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });
        render(<UsersListPageWrapper />);
        await user.click(screen.getByText('Retour accueil'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should display user information', async () => {
        userService.getAllUsers.mockResolvedValueOnce({ users: mockUsers });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getAllByText('Jean Dupont').length).toBeGreaterThanOrEqual(1);
            expect(screen.getByText('Connecté en tant que :')).toBeInTheDocument();
        });
    });

    test('should handle empty users list', async () => {
        userService.getAllUsers.mockResolvedValueOnce({ users: [] });
        render(<UsersListPageWrapper />);
        await waitFor(() => {
            expect(screen.getByText('0 utilisateur inscrit')).toBeInTheDocument();
            expect(screen.getByText('Aucun utilisateur inscrit')).toBeInTheDocument();
        });
    });
});