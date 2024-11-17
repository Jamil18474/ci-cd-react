import React, { useState } from 'react';
import { TextField, Button, Container, Grid2 } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import { isAgeValidFromBirthDate, isPostalCodeValid, isNameValid, isEmailValid } from '../validators/validators'; // Replace with your actual validators
import 'react-toastify/dist/ReactToastify.css';

/**
 * UserForm component for user registration.
 *
 * @param {Object} props - The component props.
 * @param {function} props.onRegister - Callback function to handle user registration.
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

    const [errors, setErrors] = useState({});

    /**
     * Handles empty input fields when the user focuses on them.
     *
     * @param {Object} e - The event object.
     */
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Update form data
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));

        // Immediate field validation
        const validationError = validateField(name, value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: validationError,
        }));
    };

    /**
     * Handles empty input field when user focuses on.
     *
     * @param {Object} e - The event object.
     */
    const handleFocus = (e) => {
        const { name, value } = e.target;
        const validationError = validateField(name, value);
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: validationError,
        }));
    };

    /**
     * Validates a specific field based on its name and value.
     *
     * @param {string} name - The name of the field to validate.
     * @param {string} value - The value of the field to validate.
     * @returns {string} The validation error message, or an empty string if valid.
     */
    const validateField = (name, value) => {
        const validationMap = {
            firstName: { validator: isNameValid, errorMessage: "Prénom invalide." },
            lastName: { validator: isNameValid, errorMessage: "Nom invalide." },
            city: { validator: isNameValid, errorMessage: "Ville invalide." },
            email: { validator: isEmailValid, errorMessage: "Email invalide." },
            postalCode: { validator: isPostalCodeValid, errorMessage: "Code postal invalide." },
            birthDate: { validator: isAgeValidFromBirthDate, errorMessage: "Vous devez avoir au moins 18 ans." },
        };
        const validation = validationMap[name];
        return validation.validator(value) ? '' : validation.errorMessage;
    };

    /**
     * Handles form submission, validates the form, and triggers registration.
     *
     * @param {Object} e - The event object.
     */
    const handleSubmit = (e) => {
        e.preventDefault();
        const submitValidation = () => {
            isFormValid() && (() => {
                onRegister({ ...formData });
                toast.success("Inscription réussie");
                resetForm();
            })();
        };

        /**
         * Resets the form data and errors.
         */
        const resetForm = () => {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                birthDate: '',
                city: '',
                postalCode: ''
            });
            setErrors({});
        };
        submitValidation();
    };

    /**
     * Validates all fields in the form and returns any errors.
     *
     * @returns {Object} An object containing validation errors.
     */
    const validateFormAll = () => {
        const newErrors = {};
        Object.keys(formData).forEach((key) => {
            const error = validateField(key, formData[key]);
            if (error) newErrors[key] = error;
        });
        return Object.keys(newErrors).length === 0 ? {} : newErrors;
    };

    /**
     * Checks if the entire form is valid.
     *
     * @returns {boolean} True if the form is valid, false otherwise.
     */
    const isFormValid = () => {
        const validationErrors = validateFormAll();
        return Object.keys(validationErrors).length === 0;
    };

    return (
        <Container>
            <h4>Formulaire d'inscription</h4>
            <form onSubmit={handleSubmit}>
                <Grid2 container spacing={2}>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Prénom"
                            name="firstName"
                            type="text"
                            value={formData.firstName}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            fullWidth
                            error={!!errors.firstName}
                            helperText={errors.firstName || ''}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Nom"
                            name="lastName"
                            type="text"
                            value={formData.lastName}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            fullWidth
                            error={!!errors.lastName}
                            helperText={errors.lastName || ''}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            fullWidth
                            error={!!errors.email}
                            helperText={errors.email || ''}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Date de naissance"
                            name="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            fullWidth
                            error={!!errors.birthDate}
                            helperText={errors.birthDate || ''}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Ville"
                            name="city"
                            type="text"
                            value={formData.city}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            fullWidth
                            error={!!errors.city}
                            helperText={errors.city || ''}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Code Postal"
                            name="postalCode"
                            type="text"
                            value={formData.postalCode}
                            onChange={handleChange}
                            onFocus={handleFocus}
                            fullWidth
                            error={!!errors.postalCode}
                            helperText={errors.postalCode || ''}
                        />
                    </Grid2>
                    <Grid2 size={{ xs: 12, sm: 6 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!isFormValid()} // Check if the form is valid
                        >
                            Enregistrer
                        </Button>
                    </Grid2>
                </Grid2>
            </form>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={true}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ zIndex: 9999 }} // Ensure the toast is above other elements
                bodyStyle={{ fontSize: '16px' }} // Adjust font size if necessary
                toastStyle={{ padding: '10px', borderRadius: '5px' }} // Adjust toast style
            />
        </Container>
    );
};

export default UserForm;

