// src/App.js

import React, {useState} from 'react';
import {Container, Typography} from '@mui/material';
import UserForm from "./components/UserForm";
import UsersList from "./components/UsersList";

/**
 * Main component of the application.
 *
 * This component manages the state of registered users and renders the registration form
 * as well as the list of users.
 *
 * @component
 * @returns {JSX.Element} The rendered App component.
 */
function App() {
    // State to store the list of registered users
    const [users, setUsers] = useState([]);

    /**
     * Handles the registration of a new user.
     *
     * This function updates the state of registered users by adding the new user
     * to the existing list of users. It uses the functional form of setState to
     * ensure that the most recent state is used.
     *
     * @param {Object} newUser - The object representing the new user.
     * @param {string} newUser.firstName - The first name of the user.
     * @param {string} newUser.lastName - The last name of the user.
     * @param {string} newUser.email - The email of the user.
     * @param {string} newUser.birthDate - The birthdate of the user.
     * @param {string} newUser.city - The city of the user.
     * @param {string} newUser.postalCode - The postal code of the user.
     *
     * @returns {void}
     */
    const handleRegister = (newUser) => {
        setUsers((prevUsers) => [...prevUsers, newUser]);
    };


    // Render the component
    return (
        <Container>
            {/* Page title */}
            <Typography variant="h4" gutterBottom>
                S'inscrire
            </Typography>
            {/* Registration form, passing the handleRegister function as a prop */}
            <UserForm onRegister={handleRegister}/>
            {/* List of registered users, passing the list of users as a prop */}
            <UsersList users={users}/>
        </Container>
    );
}

// Exporting the App component so it can be used in other files
export default App;