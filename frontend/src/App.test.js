// src/App.test.js
import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import App from './App';

test('should register a new user and display it in the list', () => {
    render(<App/>);

    // Check that the title is present
    const titleElement = screen.getByText(/S'inscrire/i);
    expect(titleElement).toBeInTheDocument();

    // We use getByLabelText which is better than getByPlaceholderText since placeholder is not a substitute as a label and even combined with labels can cause problems in forms for errors and cognitive concerns
    const firstName = screen.getByLabelText(/Prénom/i);
    // We use a regular expression to ensure nothing is taken before "Nom" since "Prénom" is already present.
    const lastName = screen.getByLabelText(/^Nom/i);
    const email = screen.getByLabelText(/Email/i);
    const birthDate = screen.getByLabelText(/Date de naissance/i);
    const city = screen.getByLabelText(/Ville/i);
    const postalCode = screen.getByLabelText(/Code postal/i);

    /**
     * Fills out the user registration form with predefined values.
     *
     * This function simulates user input by changing the values of the form fields
     * for first name, last name, email, birthdate, city, and postal code.
     * It uses the `fireEvent.change` method from the Testing Library to trigger
     * the change events for each input field.
     *
     * @returns {void}
     */
    const fillOutForm = () => {
        fireEvent.change(firstName, {target: {value: 'Julien'}});
        fireEvent.change(lastName, {target: {value: 'Dubout'}});
        fireEvent.change(email, {target: {value: 'julien.dubout@gmail.com'}});
        fireEvent.change(birthDate, {target: {value: '1990-01-01'}});
        fireEvent.change(city, {target: {value: 'Paris'}});
        fireEvent.change(postalCode, {target: {value: '75001'}});
    };

    fillOutForm();

    // Submit the form
    fireEvent.click(screen.getByRole('button', {name: /Enregistrer/i}));

    // Check that the user has been added to the list
    const userItem = screen.getByText(/Julien Dubout/i);
    expect(userItem).toBeInTheDocument();
    expect(screen.getByText(/Ville: Paris, Code postal: 75001/i)).toBeInTheDocument();
});