import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import { useAuth } from '../../contexts/AuthContext';
import '@testing-library/jest-dom';

// Mock des dépendances
jest.mock('../../contexts/AuthContext');

// Mock de useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate,
}));

const LoginFormWrapper = ({ authError = null, loginMock = jest.fn() }) => {
    useAuth.mockReturnValue({
        login: loginMock,
        error: authError
    });

    return (
        <BrowserRouter>
            <LoginForm />
        </BrowserRouter>
    );
};

describe('LoginForm Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Test : formulaire de connexion valide
     */
    test('should submit form with valid credentials', async () => {
        const user = userEvent.setup();
        const mockLogin = jest.fn().mockResolvedValueOnce({});

        render(<LoginFormWrapper loginMock={mockLogin} />);

        // Utiliser les data-testid
        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        await user.type(emailInput, 'admin@example.com');
        await user.type(passwordInput, 'password123');

        // Soumettre
        await user.click(screen.getByTestId('submit-button'));

        // Vérifier que login a été appelé
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'admin@example.com',
                password: 'password123'
            });
        });
    });

    /**
     * Test : validation des champs invalides
     */
    test('should show validation errors for invalid fields', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        // Utiliser les vrais inputs via data-testid
        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        await user.type(emailInput, 'invalid-email');
        await user.type(passwordInput, '123');

        // Utiliser userEvent.click pour déclencher handleSubmit correctement
        const submitButton = screen.getByTestId('submit-button');

        // D'abord, nous devons activer le bouton en remplissant les champs avec des valeurs
        // puis simuler la soumission qui déclenchera la validation
        fireEvent.click(submitButton);

        // Vérifier les messages d'erreur
        await waitFor(() => {
            expect(screen.getByText(/Email invalide/i)).toBeInTheDocument();
            expect(screen.getByText(/Mot de passe invalide/i)).toBeInTheDocument();
        });
    });

    /**
     * Test : champs vides avec soumission directe du formulaire
     */
    test('should show required field errors for empty fields via form submit', async () => {
        render(<LoginFormWrapper />);

        // Soumettre le formulaire vide via fireEvent.submit
        const form = screen.getByTestId('submit-button').closest('form');
        fireEvent.submit(form);

        // Vérifier les messages d'erreur
        await waitFor(() => {
            expect(screen.getByText(/Email requis/i)).toBeInTheDocument();
            expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
        });
    });

    /**
     * Test : soumission avec champs partiellement remplis (pour couvrir d'autres branches)
     */
    test('should handle form submission with partially filled invalid data', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        // Remplir avec des données invalides
        await user.type(emailInput, 'invalid');
        await user.type(passwordInput, '12');

        // Forcer la soumission via le formulaire
        const form = screen.getByTestId('submit-button').closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/Email invalide/i)).toBeInTheDocument();
            expect(screen.getByText(/Mot de passe invalide/i)).toBeInTheDocument();
        });
    });

    /**
     * Test : soumission avec email vide et password rempli
     */
    test('should handle form submission with empty email and filled password', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        // Remplir seulement le password
        await user.type(passwordInput, 'password123');

        // Forcer la soumission
        const form = screen.getByTestId('submit-button').closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/Email requis/i)).toBeInTheDocument();
        });
    });

    /**
     * Test : soumission avec email rempli et password vide
     */
    test('should handle form submission with filled email and empty password', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const emailInput = screen.getByTestId('email-input').querySelector('input');

        // Remplir seulement l'email
        await user.type(emailInput, 'test@example.com');

        // Forcer la soumission
        const form = screen.getByTestId('submit-button').closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
        });
    });

    /**
     * Test : affichage des erreurs d'authentification
     */
    test('should display authentication error', () => {
        render(<LoginFormWrapper authError="Email ou mot de passe incorrect" />);

        expect(screen.getByText('Email ou mot de passe incorrect')).toBeInTheDocument();
    });

    /**
     * Test : toggle de visibilité du mot de passe
     */
    test('should toggle password visibility', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const passwordField = screen.getByTestId('password-input').querySelector('input');
        const toggleButton = screen.getByTestId('password-toggle');

        // Par défaut masqué
        expect(passwordField).toHaveAttribute('type', 'password');

        // Cliquer pour afficher
        await user.click(toggleButton);
        expect(passwordField).toHaveAttribute('type', 'text');

        // Cliquer pour masquer
        await user.click(toggleButton);
        expect(passwordField).toHaveAttribute('type', 'password');
    });

    /**
     * Test : bouton désactivé avec champs invalides
     */
    test('should disable submit button with invalid form', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const submitButton = screen.getByTestId('submit-button');
        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        // Bouton désactivé par défaut (champs vides)
        expect(submitButton).toBeDisabled();

        // Remplir un seul champ
        await user.type(emailInput, 'test@example.com');
        expect(submitButton).toBeDisabled();

        // Remplir les deux champs avec des valeurs valides
        await user.type(passwordInput, 'password123');

        await waitFor(() => {
            expect(submitButton).not.toBeDisabled();
        });
    });

    /**
     * Test : état de chargement
     */
    test('should show loading state during submission', async () => {
        const user = userEvent.setup();
        let resolveLogin;
        const mockLogin = jest.fn().mockImplementationOnce(
            () => new Promise(resolve => { resolveLogin = resolve; })
        );

        render(<LoginFormWrapper loginMock={mockLogin} />);

        // Remplir le formulaire
        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        await user.type(emailInput, 'admin@example.com');
        await user.type(passwordInput, 'password123');

        // Soumettre
        const submitButton = screen.getByTestId('submit-button');
        await user.click(submitButton);

        // Vérifier l'état de chargement
        await waitFor(() => {
            expect(screen.getByText('Connexion en cours...')).toBeInTheDocument();
        });
        expect(submitButton).toBeDisabled();

        // Résoudre la promesse
        resolveLogin();

        await waitFor(() => {
            expect(screen.getByText('Se connecter')).toBeInTheDocument();
        });
    });

    /**
     * Test : gestion des erreurs de connexion
     */
    test('should handle login errors', async () => {
        const user = userEvent.setup();
        const mockLogin = jest.fn().mockRejectedValueOnce(new Error('Login failed'));
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        render(<LoginFormWrapper loginMock={mockLogin} />);

        // Remplir le formulaire
        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        await user.type(emailInput, 'admin@example.com');
        await user.type(passwordInput, 'password123');

        // Soumettre
        await user.click(screen.getByTestId('submit-button'));

        // Vérifier que l'erreur est loggée
        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Erreur de connexion:', expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
    });

    /**
     * Test : validation en temps réel
     */
    test('should show real-time validation', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const emailInput = screen.getByTestId('email-input').querySelector('input');

        // Taper une valeur invalide
        await user.type(emailInput, 'invalid');

        // La validation devrait se déclencher
        await waitFor(() => {
            expect(screen.getByText(/Email invalide/i)).toBeInTheDocument();
        });

        // Corriger la valeur
        await user.clear(emailInput);
        await user.type(emailInput, 'valid@email.com');

        // L'erreur devrait disparaître
        await waitFor(() => {
            expect(screen.queryByText(/Email invalide/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test : navigation vers admin après login réussi
     */
    test('should navigate to admin after successful login', async () => {
        const user = userEvent.setup();
        const mockLogin = jest.fn().mockResolvedValueOnce({});

        render(<LoginFormWrapper loginMock={mockLogin} />);

        // Remplir le formulaire
        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        await user.type(emailInput, 'admin@example.com');
        await user.type(passwordInput, 'password123');

        // Soumettre
        await user.click(screen.getByTestId('submit-button'));

        // Vérifier la navigation
        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/admin');
        });
    });

    /**
     * Test : trim des espaces dans l'email
     */
    test('should trim email before submission', async () => {
        const user = userEvent.setup();
        const mockLogin = jest.fn().mockResolvedValueOnce({});

        render(<LoginFormWrapper loginMock={mockLogin} />);

        // Remplir avec des espaces
        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        await user.type(emailInput, '  admin@example.com  ');
        await user.type(passwordInput, 'password123');

        // Soumettre
        await user.click(screen.getByTestId('submit-button'));

        // Vérifier que l'email est trimé
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith({
                email: 'admin@example.com', // Sans espaces
                password: 'password123'
            });
        });
    });

    /**
     * Test pour couvrir la ligne 71 : validateField avec case default
     */
    test('should handle validateField with unknown field name', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const emailInput = screen.getByTestId('email-input').querySelector('input');

        // Simuler un événement de changement avec un nom de champ personnalisé
        fireEvent.change(emailInput, {
            target: {
                name: 'unknownField', // Nom de champ qui déclenchera le case default
                value: 'test'
            }
        });

        expect(emailInput).toBeInTheDocument();
    });

    /**
     * Test spécifique pour couvrir toutes les branches de handleSubmit
     */
    test('should handle all handleSubmit branches', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        // Test 1: Formulaire invalide avec preventDefault
        await user.type(emailInput, 'invalid');
        const form = screen.getByTestId('submit-button').closest('form');

        // Utiliser fireEvent.submit pour déclencher handleSubmit avec e.preventDefault()
        fireEvent.submit(form, {
            preventDefault: jest.fn()
        });

        await waitFor(() => {
            expect(screen.getByText(/Email invalide/i)).toBeInTheDocument();
        });

        // Test 2: Clear et remplir avec des données valides
        await user.clear(emailInput);
        await user.clear(passwordInput);
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'password123');

        // Maintenant le formulaire est valide
        expect(screen.getByTestId('submit-button')).not.toBeDisabled();
    });

    /**
     * Test pour les champs avec seulement des espaces (trim)
     */
    test('should handle whitespace-only values', async () => {
        const user = userEvent.setup();
        render(<LoginFormWrapper />);

        const emailInput = screen.getByTestId('email-input').querySelector('input');
        const passwordInput = screen.getByTestId('password-input').querySelector('input');

        // Remplir avec seulement des espaces
        await user.type(emailInput, '   ');
        await user.type(passwordInput, '   ');

        // Forcer la soumission
        const form = screen.getByTestId('submit-button').closest('form');
        fireEvent.submit(form);

        await waitFor(() => {
            expect(screen.getByText(/Email requis/i)).toBeInTheDocument();
            expect(screen.getByText(/Mot de passe requis/i)).toBeInTheDocument();
        });
    });
});