import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../../pages/LoginPage';
import { useAuth } from '../../contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock des dépendances
jest.mock('../../contexts/AuthContext');

const mockNavigate = jest.fn();
let mockLocation = { state: null };
const mockLogin = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation
}));

beforeEach(() => {
    // Remet le mock à zéro avant chaque test
    useAuth.mockReturnValue({
        login: mockLogin,
        error: null,
    });
    mockLogin.mockClear();
    mockNavigate.mockClear();
    mockLocation = { state: null };
});

const LoginPageWrapper = () => (
    <BrowserRouter>
        <LoginPage />
    </BrowserRouter>
);

describe('LoginPage Integration Tests', () => {
    test('should render login page correctly', () => {
        render(<LoginPageWrapper />);
        expect(screen.getByText('🔐 Connexion')).toBeInTheDocument();
        expect(screen.getByText('Accédez à votre compte')).toBeInTheDocument();
        expect(screen.getByText('Retour à l\'accueil')).toBeInTheDocument();
    });

    test('should navigate to home when clicking back button', async () => {
        const user = userEvent.setup();
        render(<LoginPageWrapper />);
        await user.click(screen.getByText('Retour à l\'accueil'));
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('should navigate to register page when clicking create account', async () => {
        const user = userEvent.setup();
        render(<LoginPageWrapper />);
        await user.click(screen.getByText('Créer un compte'));
        expect(mockNavigate).toHaveBeenCalledWith('/register');
    });

    test('should submit login form with valid credentials', async () => {
        const user = userEvent.setup();
        render(<LoginPageWrapper />);

        // Remplir le formulaire
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText('Mot de passe *');
        await user.clear(emailInput);
        await user.type(emailInput, 'admin@example.com');
        await user.clear(passwordInput);
        await user.type(passwordInput, 'password123');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /Se connecter/i }));

        // Vérifier que login a été appelé
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'admin@example.com',
                password: 'password123'
            });
        });
    });

    test('should display authentication errors', () => {
        useAuth.mockReturnValue({
            login: mockLogin,
            error: 'Email ou mot de passe incorrect'
        });

        render(<LoginPageWrapper />);
        expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
    });

    test('should display redirect message when location.state.from exists', () => {
        mockLocation = { state: { from: '/admin' } };
        render(<LoginPageWrapper />);
        expect(screen.getByText(/Connectez-vous pour accéder à cette page/i)).toBeInTheDocument();
    });
});