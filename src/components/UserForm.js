import React, {useCallback, useState} from 'react';
import { TextField, Button, Container, Typography, Grid2 } from '@mui/material';

/**
 * Component for user registration form.
 *
 * This component allows users to input their registration details and submit the form.
 *
 * @param {Object} props - The component props.
 * @param {function} props.onRegister - Callback function to handle user registration.
 * This function is called with the form data when the form is submitted.
 *
 * @returns {JSX.Element} The rendered UserForm component.
 */
const UserForm = ({ onRegister }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        birthDate: '',
        city: '',
        postalCode: ''
    });

    /**
     * Handles changes to the form fields.
     *
     * This function is called whenever a form field is changed. It updates the
     * corresponding value in the form data state based on the input field's name
     * and value.
     * By using useCallback, we avoid recreating these functions on every render, which can be beneficial if the parent component re-renders frequently.
     *
     * @param {Object} e - The event object triggered by the input change.
     * @param {string} e.target.name - The name of the input field that triggered the change.
     * @param {string} e.target.value - The new value of the input field.
     *
     * @returns {void}
     */
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    }, []);


    /**
     * Handles the form submission.
     *
     * This function is called when the form is submitted. It prevents the default
     * form submission behavior, invokes the `onRegister` callback with the current
     * form data, and then resets the form fields to their initial empty state.
     * By using useCallback, we avoid recreating these functions on every render, which can be beneficial if the parent component re-renders frequently.
     *
     * @param {Object} e - The event object triggered by the form submission.
     * @param {Event} e.preventDefault - Prevents the default form submission behavior.
     *
     * @returns {void}
     */
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        onRegister(formData);
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            birthDate: '',
            city: '',
            postalCode: ''
        });
    }, [formData, onRegister]);

    // We create an array of objects for the form fields and map them to reduce repetition.
    const fields = [
        { name: 'firstName', label: 'Prénom', type: 'text' },
        { name: 'lastName', label: 'Nom', type: 'text' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'birthDate', label: 'Date de naissance', type: 'date' },
        { name: 'city', label: 'Ville', type: 'text' },
        { name: 'postalCode', label: 'Code Postal', type: 'text' },
    ];


    return (
        <Container>
            <Typography variant="h4" gutterBottom>
                Formulaire d'inscription
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    {fields.map((field) => (
                        <Grid2 size={{ xs: 12, sm: 6 }} key={field.name}>
                            <TextField
                                label={field.label}
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                                name={field.name}
                                type={field.type}
                                value={formData[field.name]}
                                onChange={handleChange}
                                fullWidth
                                margin="normal"
                            />
                        </Grid2>
                    ))}

                    <Button type="submit" variant="contained" color="primary">
                        Enregistrer
                    </Button>
                </Grid2>
            </form>
        </Container>
    );
}

export default UserForm;
