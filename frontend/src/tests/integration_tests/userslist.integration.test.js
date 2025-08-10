import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import UsersList from '../../components/UsersList';
import { useAuth } from '../../contexts/AuthContext';

jest.mock('../../contexts/AuthContext');

const mockUsers = [
    {
        id: '1',
        firstName: 'Jean',
        lastName: 'Dupont',
        city: 'Paris',
        role: 'user',
        permissions: ['read'],
        createdAt: '2023-01-01',
        postalCode: '75000'
    },
    {
        id: '2',
        firstName: 'Marie',
        lastName: 'Martin',
        city: 'Lyon',
        role: 'admin',
        permissions: ['read', 'delete'],
        createdAt: '2023-01-02',
        postalCode: '69000'
    }
];

describe('UsersList Integration Tests (sans Dialog, full coverage)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        window.confirm = jest.fn(() => true);
        window.alert = jest.fn();
    });

    test('affiche le message "Aucun utilisateur inscrit" si la liste est vide', () => {
        useAuth.mockReturnValue({
            isAdmin: () => false,
            hasPermission: () => false,
            user: { id: '10' }
        });
        render(<UsersList users={[]} />);
        expect(screen.getByText('Aucun utilisateur inscrit')).toBeInTheDocument();
    });

    test('affiche le message "Aucun utilisateur inscrit" si users non fourni', () => {
        useAuth.mockReturnValue({
            isAdmin: () => false,
            hasPermission: () => false,
            user: { id: '10' }
        });
        render(<UsersList />);
        expect(screen.getByText('Aucun utilisateur inscrit')).toBeInTheDocument();
    });

    test('affiche la liste des utilisateurs (pluriel)', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        render(<UsersList users={mockUsers} />);
        expect(screen.getByText('2 utilisateurs inscrits')).toBeInTheDocument();
        expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
        expect(screen.getByText('Marie Martin')).toBeInTheDocument();
        expect(screen.getByText('Droits Administrateur')).toBeInTheDocument();
    });

    test('affiche le singulier si un seul utilisateur', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        render(<UsersList users={[mockUsers[0]]} />);
        expect(screen.getByText('1 utilisateur inscrit')).toBeInTheDocument();
    });

    test('ne montre pas le chip admin pour un non-admin', () => {
        useAuth.mockReturnValue({
            isAdmin: () => false,
            hasPermission: () => false,
            user: { id: '1' }
        });
        render(<UsersList users={mockUsers} />);
        expect(screen.queryByText('Droits Administrateur')).not.toBeInTheDocument();
    });

    test('bouton suppression absent si pas admin ou pas permission', () => {
        useAuth.mockReturnValue({
            isAdmin: () => false,
            hasPermission: () => false,
            user: { id: '3' }
        });
        render(<UsersList users={mockUsers} />);
        expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument();
    });

    test('bouton suppression absent pour soi-même', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '1' }
        });
        render(<UsersList users={mockUsers} />);
        expect(screen.getAllByRole('button', { name: /supprimer/i }).length).toBe(1);
    });

    test('bouton suppression absent si pas permission', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => false,
            user: { id: '3' }
        });
        render(<UsersList users={mockUsers} />);
        expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument();
    });

    test('clique sur "Voir détails" affiche un alert avec les infos, permissions définies', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        render(<UsersList users={mockUsers} />);
        fireEvent.click(screen.getAllByText('Voir détails')[0]);
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Nom: Jean Dupont'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Ville: Paris'));
        expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Permissions: read'));
    });

    test('clique sur "Voir détails" affiche un alert sans permissions si undefined', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        const userNoPerm = { ...mockUsers[0] };
        delete userNoPerm.permissions;
        render(<UsersList users={[userNoPerm]} />);
        fireEvent.click(screen.getByText('Voir détails'));
        expect(window.alert.mock.calls[0][0]).not.toContain('Permissions');
    });

    test('onViewDetails callback est appelé si fourni', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        const onViewDetails = jest.fn();
        render(<UsersList users={mockUsers} onViewDetails={onViewDetails} />);
        fireEvent.click(screen.getAllByText('Voir détails')[0]);
        expect(onViewDetails).toHaveBeenCalledWith(mockUsers[0]);
    });

    test('handleDeleteUser appelle le confirm et le callback avec le bon id', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        const onUserDelete = jest.fn();
        render(<UsersList users={mockUsers} onUserDelete={onUserDelete} />);
        // Trouver la carte de Marie Martin et son bouton supprimer
        const card = screen.getByText('Marie Martin').closest('.MuiCard-root');
        const btn = within(card).getByRole('button', { name: /supprimer/i });
        fireEvent.click(btn);
        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Marie Martin'));
        expect(onUserDelete).toHaveBeenCalledWith('2');
    });

    test('handleDeleteUser n\'appelle pas le callback si confirm refuse', () => {
        window.confirm = jest.fn(() => false);
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        const onUserDelete = jest.fn();
        render(<UsersList users={mockUsers} onUserDelete={onUserDelete} />);
        const card = screen.getByText('Marie Martin').closest('.MuiCard-root');
        const btn = within(card).getByRole('button', { name: /supprimer/i });
        fireEvent.click(btn);
        expect(onUserDelete).not.toHaveBeenCalled();
    });

    test('handleDeleteUser ne plante pas si onUserDelete non fourni', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: '3' }
        });
        render(<UsersList users={mockUsers} />);
        const card = screen.getByText('Marie Martin').closest('.MuiCard-root');
        const btn = within(card).getByRole('button', { name: /supprimer/i });
        fireEvent.click(btn);
        expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('Marie Martin'));
    });

    test('getInitials retourne "" si firstName/lastName absents (branch covered if no crash)', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: 'me' }
        });
        // Pas d'erreur attendue = branche couverte (getInitials avec fallback "")
        render(<UsersList users={[{ id: 'X' }]} />);
        expect(screen.getByText(/utilisateur inscrit/i)).toBeInTheDocument();
    });

    test('key fallback sur index si userData.id falsy', () => {
        useAuth.mockReturnValue({
            isAdmin: () => true,
            hasPermission: () => true,
            user: { id: 'me' }
        });
        render(<UsersList users={[{ firstName: 'A' }, { firstName: 'B' }]} />);
        expect(screen.getAllByText('A').length).toBeGreaterThan(0);
        expect(screen.getAllByText('B').length).toBeGreaterThan(0);
    });
});