import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react';
import UserForm from '../../components/UserForm'; // Ensure the path is correct
import {toast} from 'react-toastify';

/**
 * Mocks the `react-toastify` library for testing purposes.
 *
 *
 * This mock implementation overrides the `toast.success` method from `react-toastify`
 * to allow for testing of toast notifications in a controlled environment without
 * actually displaying any UI elements.
 *
 * The mock will keep the actual behavior of other parts of `react-toastify` intact,
 * while providing a mock version of `toast.success` that can be tracked and asserted
 * in tests.
 *
 */
jest.mock('react-toastify', () => ({
    ...jest.requireActual('react-toastify'),  // Retain original behavior for other methods
    toast: {
        success: jest.fn(), // Mock the success method of toast
    },
}));


/**
 * A mock function for handling user registration events.
 * `onRegisterMock` is a mock function that simulates the registration process
 * in tests. It is typically used to track and assert that the correct behavior
 * happens when a user attempts to register.
 *
 */
const onRegisterMock = jest.fn();

/**
 * Integration tests for the UserForm component.
 */
describe('UserForm Integration Tests', () => {
    beforeEach(() => {
        // Reset the mock before each test
        onRegisterMock.mockClear();
        // Clear localStorage before each test
        localStorage.clear();
    });

    /**
     * Test to ensure the submit button is enabled, no errors are shown when all fields are valid
     * and a success toast is displayed.
     */
    test('should enable submit button, show no errors when all fields are valid and show success toast',  () => {
        render(<UserForm onRegister={onRegisterMock}/>);
        // Fill the form with valid values
        fireEvent.change(screen.getByLabelText(/Prénom/i), {target: {value: 'Julien'}}); // Valid firstname
        fireEvent.change(screen.getByLabelText(/^Nom/i), {target: {value: 'Dubout'}}); // Valid lastname
        fireEvent.change(screen.getByLabelText(/Email/i), {target: {value: 'julien.dubout@gmail.com'}}); // Valid email
        fireEvent.change(screen.getByLabelText(/Date de naissance/i), {target: {value: '2000-05-16'}}); // 18 or older
        fireEvent.change(screen.getByLabelText(/Ville/i), {target: {value: 'Paris'}}); // Valid city
        fireEvent.change(screen.getByLabelText(/Code Postal/i), {target: {value: '75000'}}); // Valid postal code
        // Check that the button is enabled
        expect(screen.getByRole('button', {name: /Enregistrer/i})).not.toBeDisabled();
        // Submit the form
        fireEvent.click(screen.getByRole('button', {name: /Enregistrer/i}));
        // Check that the onRegister function was called with the correct data
        expect(onRegisterMock).toHaveBeenCalledWith({
                firstName: 'Julien',
                lastName: 'Dubout',
                email: 'julien.dubout@gmail.com',
                birthDate: '2000-05-16',
                city: 'Paris',
                postalCode: '75000'
            });
        // Check that there are no errors displayed
        expect(screen.queryByText(/Prénom invalide/i)).not.toBeInTheDocument(); // No error message
        expect(screen.queryByText(/^Nom invalide/i)).not.toBeInTheDocument(); // No error message
        expect(screen.queryByText(/Email invalide/i)).not.toBeInTheDocument(); // No error message
        expect(screen.queryByText(/Vous devez avoir au moins 18 ans/i)).not.toBeInTheDocument(); // No error message
        expect(screen.queryByText(/Ville invalide/i)).not.toBeInTheDocument(); // No error message
        expect(screen.queryByText(/Code postal invalide/i)).not.toBeInTheDocument(); // No error message
        // Check that the success toast was called with the correct message
        expect(toast.success).toHaveBeenCalledWith('Inscription réussie');
        // Check that the data is stored in localStorage
        const storedData = localStorage.getItem("userData");
        expect(storedData).not.toBeNull(); // Check that something has been stored
        expect(JSON.parse(storedData)).toEqual({
            firstName: 'Julien',
            lastName: 'Dubout',
            email: 'julien.dubout@gmail.com',
            birthDate: '2000-05-16',
            city: 'Paris',
            postalCode: '75000'
        }); // Check that the stored data matches what was submitted
    });

    /**
     * Test to ensure errors are shown, the submit button is disabled when fields are invalid
     * and that the success toast is not shown.
     */
    test('should show errors and disable submit button when fields are invalid',  () => {
        render(<UserForm onRegister={onRegisterMock}/>);
        // Fill the form with invalid values
        fireEvent.change(screen.getByLabelText(/Prénom/i), {target: {value: 'Pierre123'}}); // Invalid firstname
        fireEvent.change(screen.getByLabelText(/^Nom/i), {target: {value: 'Dubout!'}}); // Invalid lastname
        fireEvent.change(screen.getByLabelText(/Email/i), {target: {value: 'plainaddress'}}); // Invalid email
        fireEvent.change(screen.getByLabelText(/Date de naissance/i), {target: {value: '2020-01-01'}}); // Under 18
        fireEvent.change(screen.getByLabelText(/Ville/i), {target: {value: 'Paris$'}}); // Invalid city
        fireEvent.change(screen.getByLabelText(/Code Postal/i), {target: {value: '7500'}}); // Invalid postal code
        // Check that the button is disabled
        expect(screen.getByRole('button', {name: /Enregistrer/i})).toBeDisabled();
        // Submit the form
        fireEvent.click(screen.getByRole('button', {name: /Enregistrer/i}));
        // Check that the onRegister function was not called
        expect(onRegisterMock).not.toHaveBeenCalled();
        // Check that errors are displayed
        expect(screen.getByText(/Prénom invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Prénom invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message
        expect(screen.getByText(/^Nom invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/^Nom invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message
        expect(screen.getByText(/Email invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Email invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Vous devez avoir au moins 18 ans/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Vous devez avoir au moins 18 ans/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Ville invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Ville invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Code postal invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Code postal invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        // Check that the success toast wasn't called
        expect(toast.success).not.toHaveBeenCalled();
        // Check that nothing is stored in localStorage
        const storedData = localStorage.getItem("userData");
        expect(storedData).toBeNull(); // Check that nothing is stored

    });

    /**
     * Test to ensure errors are shown, the submit button is disabled when the user focuses on fields but the fields are empty
     * and that the success toast is not shown.
     */
    test('should show errors and disable submit button when user focuses on fields but fields are empty',  () => {
        render(<UserForm onRegister={onRegisterMock}/>);
        // Focus on the fields
        fireEvent.focus(screen.getByLabelText(/Prénom/i)); // Invalid firstname
        fireEvent.focus(screen.getByLabelText(/^Nom/i)); // Invalid lastname
        fireEvent.focus(screen.getByLabelText(/Email/i)); // Invalid email
        fireEvent.focus(screen.getByLabelText(/Date de naissance/i)); // Under 18
        fireEvent.focus(screen.getByLabelText(/Ville/i)); // Invalid city
        fireEvent.focus(screen.getByLabelText(/Code Postal/i)); // Invalid postal code
        // Check that the button is disabled
        expect(screen.getByRole('button', {name: /Enregistrer/i})).toBeDisabled();
        // Submit the form
        fireEvent.click(screen.getByRole('button', {name: /Enregistrer/i}));
        // Check that the onRegister function was not called
        expect(onRegisterMock).not.toHaveBeenCalled();
        // Check that errors are displayed
        expect(screen.getByText(/Prénom invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Prénom invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/^Nom invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/^Nom invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Email invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Email invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Vous devez avoir au moins 18 ans/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Vous devez avoir au moins 18 ans/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Ville invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Ville invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Code postal invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Code postal invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        // Check that the success toast wasn't called
        expect(toast.success).not.toHaveBeenCalled();
        // Check that nothing is stored in localStorage
        const storedData = localStorage.getItem("userData");
        expect(storedData).toBeNull();
    });

    /**
     * Test to ensure errors are shown, the submit button is disabled when fields are empty
     * and that the success toast is not shown.
     */
    test('should show errors and disable submit button when fields are empty',  () => {
        render(<UserForm onRegister={onRegisterMock}/>);
        // Fill the form with invalid values
        fireEvent.change(screen.getByLabelText(/Prénom/i), {target: {value: ''}}); // Invalid firstname
        fireEvent.change(screen.getByLabelText(/^Nom/i), {target: {value: ''}}); // Invalid lastname
        fireEvent.change(screen.getByLabelText(/Email/i), {target: {value: ''}}); // Invalid email
        fireEvent.change(screen.getByLabelText(/Date de naissance/i), {target: {value: ''}}); // Under 18
        fireEvent.change(screen.getByLabelText(/Ville/i), {target: {value: ''}}); // Invalid city
        fireEvent.change(screen.getByLabelText(/Code Postal/i), {target: {value: ''}}); // Invalid postal code
        // Check that the button is disabled
        expect(screen.getByRole('button', {name: /Enregistrer/i})).toBeDisabled();
        // Submit the form
        fireEvent.click(screen.getByRole('button', {name: /Enregistrer/i}));
        // Check that the onRegister function was not called
        expect(onRegisterMock).not.toHaveBeenCalled();
        // Check that the success toast wasn't called
        expect(toast.success).not.toHaveBeenCalled();
    });

    /**
     * Test to ensure errors are shown, the submit button is disabled when fields are filled with spaces
     * and that the success toast is not shown.
     */
    test('should show errors and disable submit button when fields are filled with spaces',  () => {
        render(<UserForm onRegister={onRegisterMock}/>);
        // Fill the form with invalid values
        fireEvent.change(screen.getByLabelText(/Prénom/i), {target: {value: ' '}}); // Invalid firstname
        fireEvent.change(screen.getByLabelText(/^Nom/i), {target: {value: ' '}}); // Invalid lastname
        fireEvent.change(screen.getByLabelText(/Email/i), {target: {value: ' '}}); // Invalid email
        fireEvent.change(screen.getByLabelText(/Date de naissance/i), {target: {value: ' '}}); // Under 18
        fireEvent.change(screen.getByLabelText(/Ville/i), {target: {value: ' '}}); // Invalid city
        fireEvent.change(screen.getByLabelText(/Code Postal/i), {target: {value: ' '}}); // Invalid postal code
        // Check that the button is disabled
        expect(screen.getByRole('button', {name: /Enregistrer/i})).toBeDisabled();
        // Submit the form
        fireEvent.click(screen.getByRole('button', {name: /Enregistrer/i}));
        // Check that the onRegister function was not called
        expect(onRegisterMock).not.toHaveBeenCalled();
        // Check that the success toast wasn't called
        expect(toast.success).not.toHaveBeenCalled();
        // Check that nothing is stored in localStorage
        const storedData = localStorage.getItem("userData");
        expect(storedData).toBeNull(); // Check that nothing is stored
    });

    /**
     * Test to ensure all errors are shown except for one valid field and the submit button is disabled
     * and that the success toast is not shown.
     */
    test('should show all errors except for one valid field and disable submit button', () => {
        render(<UserForm onRegister={onRegisterMock}/>);
        // Fill the form with a valid first name and other invalid values
        fireEvent.change(screen.getByLabelText(/Prénom/i), {target: {value: 'Marie-Claire'}}); // Valid firstname
        fireEvent.change(screen.getByLabelText(/^Nom/i), {target: {value: '#'}}); // Invalid lastname
        fireEvent.change(screen.getByLabelText(/Email/i), {target: {value: '@missingusername.com'}}); // Invalid email
        fireEvent.change(screen.getByLabelText(/Date de naissance/i), {target: {value: '2020-01-01'}}); // Under 18
        fireEvent.change(screen.getByLabelText(/Ville/i), {target: {value: 'Paris!'}}); // Invalid city
        fireEvent.change(screen.getByLabelText(/Code Postal/i), {target: {value: 'abcde'}}); // Invalid postal code
        // Check that the button is disabled
        expect(screen.getByRole('button', {name: /Enregistrer/i})).toBeDisabled();
        // Check that the onRegister function was not called
        expect(onRegisterMock).not.toHaveBeenCalled();
        // Check that errors are displayed for invalid fields
        expect(screen.queryByText(/Prénom invalide/i)).not.toBeInTheDocument(); // No error message
        expect(screen.getByText(/^Nom invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/^Nom invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Email invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Email invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Vous devez avoir au moins 18 ans/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Vous devez avoir au moins 18 ans/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Ville invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Ville invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.getByText(/Code postal invalide/i)).toBeInTheDocument(); // Error message
        expect(screen.getByText(/Code postal invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        // Check that the success toast wasn't called
        expect(toast.success).not.toHaveBeenCalled();
        // Check that nothing is stored in localStorage
        const storedData = localStorage.getItem("userData");
        expect(storedData).toBeNull(); // Check that nothing is stored
    });


    /**
     * Test case to verify that only one error is shown, that the submit button is disabled
     * and that the success toast is not shown.
     */
    test('should show error only for one invalid field and disable submit button',  () => {
        render(<UserForm onRegister={onRegisterMock}/>);

        // Fill the form with one invalid field and others valid
        fireEvent.change(screen.getByLabelText(/Prénom/i), {target: {value: 'Hélène'}}); // Valid firstname
        fireEvent.change(screen.getByLabelText(/^Nom/i), {target: {value: 'Bêlanger'}}); // Valid lastname
        fireEvent.change(screen.getByLabelText(/Email/i), {target: {value: 'username@.com'}}); // Invalid email
        fireEvent.change(screen.getByLabelText(/Date de naissance/i), {target: {value: '2000-01-01'}}); // 18 or older
        fireEvent.change(screen.getByLabelText(/Ville/i), {target: {value: 'Saint-Raphaël'}}); // Valid city
        fireEvent.change(screen.getByLabelText(/Code Postal/i), {target: {value: '83118'}}); // Valid postal code

        // Check that the button is disabled
        expect(screen.getByRole('button', {name: /Enregistrer/i})).toBeDisabled();
        // Check that the onRegister function was not called
        expect(onRegisterMock).not.toHaveBeenCalled();

        // Check that errors are displayed only for one invalid field
        expect(screen.queryByText(/Prénom invalide/i)).not.toBeInTheDocument(); //No error message
        expect(screen.queryByText(/^Nom invalide/i)).not.toBeInTheDocument(); //No error message
        expect(screen.getByText(/Email invalide/i)).toBeInTheDocument(); // No error message
        expect(screen.getByText(/Email invalide/i)).toHaveStyle('color: rgb(211, 47, 47)'); // Error message in red
        expect(screen.queryByText(/Vous devez avoir au moins 18 ans/i)).not.toBeInTheDocument(); // No error message
        expect(screen.queryByText(/Ville invalide/i)).not.toBeInTheDocument(); //No error message
        expect(screen.queryByText(/Code postal invalide/i)).not.toBeInTheDocument(); //No error message
        // Check that the success toast wasn't called
        expect(toast.success).not.toHaveBeenCalled();
        // Check that nothing is stored in localStorage
        const storedData = localStorage.getItem("userData");
        expect(storedData).toBeNull(); // Check that nothing is stored
    });

});

















