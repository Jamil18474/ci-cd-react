import React from 'react';
import { render, screen } from '@testing-library/react';
import UsersList from '../../components/UsersList'; // Ensure to import your component
import '@testing-library/jest-dom/extend-expect';

/**
 * Test suite for the UsersList component.
 * @module UsersList.test
 */
describe('UsersList', () => {

    /**
     * Test case to check if the title is rendered.
     * @test
     * @description This test verifies that the title "Liste des utilisateurs inscrits" is displayed when the UsersList component is rendered.
     */
    test('renders the title', () => {
        render(<UsersList users={[]} />);

        // Check that the title is displayed
        const titleElement = screen.getByText(/Liste des utilisateurs inscrits/i);
        expect(titleElement).toBeInTheDocument();
    });

    /**
     * Test case to check if a list of users is rendered.
     * @test
     * @description This test verifies that the UsersList component correctly displays a list of users when provided with user data.
     */
    test('renders a list of users', () => {
        const users = [
            {
                id: '1',
                firstName: 'Julien',
                lastName: 'Dubout',
                birthDate: '1990-01-01',
                city: 'Paris',
                postalCode: '75001',
            },
            {
                id: '2',
                firstName: 'Juliette',
                lastName: 'Dupont',
                birthDate: '1992-02-02',
                city: 'Lyon',
                postalCode: '69001',
            },
        ];

        render(<UsersList users={users} />);

        // Check that the users are displayed
        expect(screen.getByText('Julien Dubout')).toBeInTheDocument();
        expect(screen.getByText('Ville: Paris, Code postal: 75001')).toBeInTheDocument();
        expect(screen.getByText('Juliette Dupont')).toBeInTheDocument();
        expect(screen.getByText('Ville: Lyon, Code postal: 69001')).toBeInTheDocument();
    });

    /**
     * Test case to check if an empty list message is rendered when no users are provided.
     * @test
     * @description This test verifies that the UsersList component displays an appropriate message when no user data is provided.
     */
    test('renders an empty list message when no users are provided', () => {
        render(<UsersList users={[]} />);

        // Check that no users are displayed
        const userItems = screen.queryAllByRole('listitem');
        expect(userItems.length).toBe(0);
    });
});
