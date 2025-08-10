import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../pages/RegisterPage';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import '@testing-library/jest-dom';

// Mock des dépendances
jest.mock('../../contexts/AuthContext');
jest.mock('react-toastify', () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

// Variable pour stocker la fonction onRegister
let mockOnRegisterRef = null;

// Mock UserForm pour simuler différents scénarios
jest.mock('../../components/UserForm', () => {
    return function MockUserForm({ onRegister }) {
        // Stocker la référence dans une variable de module
        mockOnRegisterRef = onRegister;

        const handleSubmit = async () => {
            try {
                await onRegister({
                    firstName: 'Test',
                    lastName: 'User',
                    email: 'test@example.com',
                    password: 'password123',
                    birthDate: '1990-01-01',
                    city: 'Paris',
                    postalCode: '75001'
                });
            } catch (error) {
                // L'erreur sera gérée par le parent
            }
        };

        return (
            <div data-testid="user-form">
                <button onClick={handleSubmit}>Submit Form</button>
            </div>
        );
    };
});

describe('RegisterPage Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnRegisterRef = null;
    });

    /**
     * Test : rendu de la page d'inscription
     */
    test('should render registration page correctly', () => {
        useAuth.mockReturnValue({
            register: jest.fn(),
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        expect(screen.getByText('📝 Inscription')).toBeInTheDocument();
        expect(screen.getByText('Créez votre compte utilisateur')).toBeInTheDocument();
        expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument();
        expect(screen.getByTestId('user-form')).toBeInTheDocument();
    });

    /**
     * Test : navigation vers la page d'accueil
     */
    test('should navigate to home when clicking back button', async () => {
        const user = userEvent.setup();

        useAuth.mockReturnValue({
            register: jest.fn(),
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        await user.click(screen.getByText('Retour à l\'accueil'));

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    /**
     * Test : inscription réussie
     */
    test('should handle successful registration', async () => {
        const user = userEvent.setup();
        const mockRegister = jest.fn().mockResolvedValueOnce({});

        useAuth.mockReturnValue({
            register: mockRegister,
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        // Simuler la soumission du formulaire
        await user.click(screen.getByText('Submit Form'));

        // Vérifier que register a été appelé
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalledWith({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123',
                birthDate: '1990-01-01',
                city: 'Paris',
                postalCode: '75001'
            });
        });

        // Vérifier la navigation vers la connexion
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });

        // Vérifier le toast de succès
        expect(toast.success).toHaveBeenCalledWith(
            'Inscription réussie ! Vous pouvez maintenant vous connecter.'
        );
    });

    /**
     * Test : gestion des erreurs d'inscription (couvre lignes 36-38)
     */
    test('should handle registration errors and log them', async () => {
        const user = userEvent.setup();
        const registrationError = new Error('Cette adresse email est déjà utilisée');
        const mockRegister = jest.fn().mockRejectedValueOnce(registrationError);

        // Spy sur console.error pour vérifier qu'il est appelé
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        useAuth.mockReturnValue({
            register: mockRegister,
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        // Simuler la soumission du formulaire qui va échouer
        await user.click(screen.getByText('Submit Form'));

        // Vérifier que register a été appelé
        await waitFor(() => {
            expect(mockRegister).toHaveBeenCalled();
        });

        // Vérifier que l'erreur est loggée (ligne 37)
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de l\'inscription:', registrationError);
        });

        // Vérifier qu'il n'y a pas de navigation vers login
        expect(mockNavigate).not.toHaveBeenCalledWith('/login');

        // Vérifier qu'il n'y a pas de toast de succès
        expect(toast.success).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });

    /**
     * Test : navigation vers la page de connexion
     */
    test('should navigate to login page when clicking login link', async () => {
        const user = userEvent.setup();

        useAuth.mockReturnValue({
            register: jest.fn(),
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        await user.click(screen.getByText('Se connecter'));

        expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    /**
     * Test direct de la fonction handleRegister pour s'assurer de la couverture
     */
    test('should cover handleRegister error handling directly', async () => {
        const registrationError = new Error('Network error');
        const mockRegister = jest.fn().mockRejectedValueOnce(registrationError);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        useAuth.mockReturnValue({
            register: mockRegister,
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        // Attendre que le composant soit rendu et la fonction disponible
        await waitFor(() => {
            expect(mockOnRegisterRef).toBeDefined();
        });

        // Appeler directement handleRegister pour s'assurer que l'erreur est gérée
        try {
            await mockOnRegisterRef({
                firstName: 'Test',
                lastName: 'User',
                email: 'test@example.com',
                password: 'password123',
                birthDate: '1990-01-01',
                city: 'Paris',
                postalCode: '75001'
            });
        } catch (error) {
            // L'erreur devrait être re-lancée après le log
            expect(error).toBe(registrationError);
        }

        // Vérifier que console.error a été appelé
        expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de l\'inscription:', registrationError);

        consoleErrorSpy.mockRestore();
    });

    /**
     * Test : vérifier que l'erreur est bien re-lancée (throw error)
     */
    test('should re-throw error after logging', async () => {
        const registrationError = new Error('Registration failed');
        const mockRegister = jest.fn().mockRejectedValueOnce(registrationError);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        useAuth.mockReturnValue({
            register: mockRegister,
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        // Attendre que le composant soit monté et la fonction disponible
        await waitFor(() => {
            expect(mockOnRegisterRef).toBeDefined();
        });

        // Tester que l'erreur est bien re-lancée
        await expect(mockOnRegisterRef({
            firstName: 'Test',
            lastName: 'User',
            email: 'test@example.com',
            password: 'password123',
            birthDate: '1990-01-01',
            city: 'Paris',
            postalCode: '75001'
        })).rejects.toThrow('Registration failed');

        // Vérifier que l'erreur a été loggée
        expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de l\'inscription:', registrationError);

        consoleErrorSpy.mockRestore();
    });

    /**
     * Test supplémentaire pour s'assurer que le catch block est bien couvert
     */
    test('should handle different types of registration errors', async () => {
        const user = userEvent.setup();
        const networkError = new Error('Network error');
        const mockRegister = jest.fn().mockRejectedValueOnce(networkError);
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        useAuth.mockReturnValue({
            register: mockRegister,
            error: null,
            isLoading: false
        });

        render(
            <BrowserRouter>
                <RegisterPage />
            </BrowserRouter>
        );

        // Utiliser le bouton du mock pour déclencher l'erreur
        await user.click(screen.getByText('Submit Form'));

        // Attendre que l'erreur soit gérée
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur lors de l\'inscription:', networkError);
        });

        // Pas de navigation en cas d'erreur
        expect(mockNavigate).not.toHaveBeenCalledWith('/login');
        expect(toast.success).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});