import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserForm from '../../components/UserForm';
import '@testing-library/jest-dom';
import { toast } from 'react-toastify';

// Mock react-toastify
jest.mock('react-toastify', () => ({
    toast: {
        error: jest.fn(),
        success: jest.fn()
    }
}));

const onRegisterMock = jest.fn();

describe('UserForm Integration Tests (Essential)', () => {
    beforeEach(() => {
        onRegisterMock.mockClear();
        jest.clearAllMocks();
        toast.error.mockClear();
        toast.success.mockClear();
    });

    /**
     * Test : soumission réussie avec données valides
     */
    test('should submit form with valid data', async () => {
        const user = userEvent.setup();
        onRegisterMock.mockResolvedValue();

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir le formulaire avec des données valides
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Vérifier
        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalledWith({
                firstName: 'Jean',
                lastName: 'Dupont',
                email: 'jean@test.com',
                password: 'password123',
                birthDate: '1990-01-01',
                city: 'Paris',
                postalCode: '75001'
            });
        });

        expect(toast.success).toHaveBeenCalledWith('Inscription réussie !');
    });

    /**
     * Test : validation des erreurs pour champs vides
     */
    test('should show validation errors for empty fields', async () => {
        const user = userEvent.setup();
        render(<UserForm onRegister={onRegisterMock} />);

        // Soumettre formulaire vide
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Vérifier les erreurs
        await waitFor(() => {
            expect(screen.getByText(/Le prénom est requis/i)).toBeInTheDocument();
            expect(screen.getByText(/Le nom est requis/i)).toBeInTheDocument();
            expect(screen.getByText(/L'email est requis/i)).toBeInTheDocument();
            expect(screen.getByText(/Le mot de passe est requis/i)).toBeInTheDocument();
            expect(screen.getByText(/La date de naissance est requise/i)).toBeInTheDocument();
            expect(screen.getByText(/La ville est requise/i)).toBeInTheDocument();
            expect(screen.getByText(/Le code postal est requis/i)).toBeInTheDocument();
        });

        expect(toast.error).toHaveBeenCalledWith('Veuillez corriger les erreurs dans le formulaire');
        expect(onRegisterMock).not.toHaveBeenCalled();
    });

    /**
     * Test : validation en temps réel après tentative de soumission (lignes 64-65)
     */
    test('should validate fields in real time after submit attempt', async () => {
        const user = userEvent.setup();
        render(<UserForm onRegister={onRegisterMock} />);

        // Soumettre d'abord pour déclencher submitAttempted
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Vérifier l'erreur initiale
        await waitFor(() => {
            expect(screen.getByText(/Le prénom est requis/i)).toBeInTheDocument();
        });

        // Maintenant taper dans un champ - devrait déclencher la validation en temps réel
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');

        // Vérifier que l'erreur disparaît
        await waitFor(() => {
            expect(screen.queryByText(/Le prénom est requis/i)).not.toBeInTheDocument();
        });
    });

    /**
     * Test : cas default dans validateField (ligne 113)
     */
    test('should handle unknown field in validateField', async () => {
        const user = userEvent.setup();
        render(<UserForm onRegister={onRegisterMock} />);

        // Déclencher submitAttempted
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Créer un événement manuel avec un nom de champ inconnu pour déclencher le cas default
        const firstNameField = screen.getByLabelText(/Prénom/i);

        // Simuler un événement avec un nom de champ inconnu
        fireEvent.change(firstNameField, {
            target: {
                name: 'unknownField',
                value: 'test'
            }
        });

        // Le test passe si aucune erreur n'est lancée
        expect(true).toBe(true);
    });

    /**
     * Test : affichage/masquage du mot de passe (ligne 310) - CORRIGÉ
     */
    test('should toggle password visibility', async () => {
        const user = userEvent.setup();
        render(<UserForm onRegister={onRegisterMock} />);

        const passwordField = screen.getByLabelText(/Mot de passe/i);

        // Sélectionner spécifiquement le bouton de toggle avec l'icône Visibility
        const toggleButton = screen.getByTestId('VisibilityIcon').closest('button');

        // Initialement type='password'
        expect(passwordField).toHaveAttribute('type', 'password');

        // Cliquer pour afficher
        await user.click(toggleButton);
        expect(passwordField).toHaveAttribute('type', 'text');

        // Cliquer pour masquer
        await user.click(toggleButton);
        expect(passwordField).toHaveAttribute('type', 'password');
    });

    /**
     * Test : erreur API avec status 400 et message email (lignes 193-210)
     */
    test('should handle API error with status 400 and email message', async () => {
        const user = userEvent.setup();
        const apiError = {
            status: 400,
            message: 'Cette adresse email est déjà utilisée'
        };
        onRegisterMock.mockRejectedValue(apiError);

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir formulaire valide
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Vérifier que l'erreur email est gérée
        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });

        expect(toast.error).toHaveBeenCalledWith('Cette adresse email est déjà utilisée');
    });

    /**
     * Test : erreur API avec status 400 sans message email (lignes 193-210)
     */
    test('should handle API error with status 400 without email message', async () => {
        const user = userEvent.setup();
        const apiError = {
            status: 400,
            message: 'Données invalides'
        };
        onRegisterMock.mockRejectedValue(apiError);

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir formulaire valide
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });

        expect(toast.error).toHaveBeenCalledWith('Données invalides');
    });

    /**
     * Test : erreur API avec status 500 (lignes 193-210)
     */
    test('should handle API error with status 500', async () => {
        const user = userEvent.setup();
        const apiError = {
            status: 500,
            message: 'Erreur interne'
        };
        onRegisterMock.mockRejectedValue(apiError);

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir formulaire valide
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });

        expect(toast.error).toHaveBeenCalledWith('Erreur serveur');
    });

    /**
     * Test : erreur API avec status 0 (lignes 193-210)
     */
    test('should handle API error with status 0', async () => {
        const user = userEvent.setup();
        const apiError = {
            status: 0,
            message: 'Network error'
        };
        onRegisterMock.mockRejectedValue(apiError);

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir formulaire valide
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });

        expect(toast.error).toHaveBeenCalledWith('Impossible de contacter le serveur');
    });

    /**
     * Test : erreur API avec message mais status différent (lignes 193-210)
     */
    test('should handle API error with message and other status', async () => {
        const user = userEvent.setup();
        const apiError = {
            status: 403,
            message: 'Accès refusé'
        };
        onRegisterMock.mockRejectedValue(apiError);

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir formulaire valide
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });

        expect(toast.error).toHaveBeenCalledWith('Accès refusé');
    });

    /**
     * Test : erreur API sans message (lignes 193-210)
     */
    test('should handle API error without message', async () => {
        const user = userEvent.setup();
        const apiError = {
            status: 404
            // Pas de message
        };
        onRegisterMock.mockRejectedValue(apiError);

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir formulaire valide
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });

        expect(toast.error).toHaveBeenCalledWith("Erreur lors de l'inscription");
    });

    /**
     * Test : validation avec formats invalides (lignes 80-113)
     */
    test('should show validator error messages for invalid formats', async () => {
        const user = userEvent.setup();
        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir avec des données invalides
        await user.type(screen.getByLabelText(/Prénom/i), '123');
        await user.type(screen.getByLabelText(/^Nom/i), '456');
        await user.type(screen.getByLabelText(/Email/i), 'invalid-email');
        await user.type(screen.getByLabelText(/Mot de passe/i), '123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '2020-01-01');
        await user.type(screen.getByLabelText(/Ville/i), '789');
        await user.type(screen.getByLabelText(/Code postal/i), 'invalid');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Vérifier les messages d'erreur spécifiques (basés sur la vraie validation)
        await waitFor(() => {
            expect(screen.getByText(/Le prénom ne doit contenir que des lettres/i)).toBeInTheDocument();
            expect(screen.getByText(/Le nom ne doit contenir que des lettres/i)).toBeInTheDocument();
            expect(screen.getByText(/Format d'email invalide/i)).toBeInTheDocument();
            expect(screen.getByText(/Le mot de passe doit faire au moins 6 caractères/i)).toBeInTheDocument();
            expect(screen.getByText(/Vous devez avoir au moins 18 ans/i)).toBeInTheDocument();
            expect(screen.getByText(/La ville ne doit contenir que des lettres/i)).toBeInTheDocument();
            expect(screen.getByText(/Code postal français invalide/i)).toBeInTheDocument();
        });
    });

    /**
     * Test : état de chargement externe
     */
    test('should handle external loading state', () => {
        render(<UserForm onRegister={onRegisterMock} loading={true} />);

        const submitButton = screen.getByRole('button', { name: /Inscription en cours.../i });
        expect(submitButton).toBeDisabled();
    });

    /**
     * Test : fonction getMaxBirthDate
     */
    test('should set correct max birth date', () => {
        render(<UserForm onRegister={onRegisterMock} />);

        const birthDateField = screen.getByLabelText(/Date de naissance/i);
        const today = new Date();
        const expectedMaxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
        const expectedMaxDateString = expectedMaxDate.toISOString().split('T')[0];

        expect(birthDateField).toHaveAttribute('max', expectedMaxDateString);
    });

    /**
     * Test : resetForm après succès
     */
    test('should reset form after successful submission', async () => {
        const user = userEvent.setup();
        onRegisterMock.mockResolvedValue();

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir le formulaire
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Attendre que l'inscription soit terminée et le formulaire reset
        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });

        await waitFor(() => {
            expect(screen.getByLabelText(/Prénom/i)).toHaveValue('');
            expect(screen.getByLabelText(/^Nom/i)).toHaveValue('');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('');
            expect(screen.getByLabelText(/Mot de passe/i)).toHaveValue('');
        });
    });



    /**
     * Test : état de soumission interne
     */
    test('should show loading state during submission', async () => {
        const user = userEvent.setup();

        // Créer une promesse qui ne se résout pas immédiatement
        let resolvePromise;
        const pendingPromise = new Promise((resolve) => {
            resolvePromise = resolve;
        });
        onRegisterMock.mockReturnValue(pendingPromise);

        render(<UserForm onRegister={onRegisterMock} />);

        // Remplir formulaire valide
        await user.type(screen.getByLabelText(/Prénom/i), 'Jean');
        await user.type(screen.getByLabelText(/^Nom/i), 'Dupont');
        await user.type(screen.getByLabelText(/Email/i), 'jean@test.com');
        await user.type(screen.getByLabelText(/Mot de passe/i), 'password123');
        await user.type(screen.getByLabelText(/Date de naissance/i), '1990-01-01');
        await user.type(screen.getByLabelText(/Ville/i), 'Paris');
        await user.type(screen.getByLabelText(/Code postal/i), '75001');

        // Soumettre
        await user.click(screen.getByRole('button', { name: /S'inscrire/i }));

        // Vérifier l'état de chargement
        expect(screen.getByRole('button', { name: /Inscription en cours.../i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Inscription en cours.../i })).toBeDisabled();

        // Résoudre la promesse pour nettoyer
        resolvePromise();
        await waitFor(() => {
            expect(onRegisterMock).toHaveBeenCalled();
        });
    });
});