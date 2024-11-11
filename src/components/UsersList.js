import React from 'react';
import { List, ListItem, ListItemText, Typography } from '@mui/material';

/**
 * Component that displays a list of registered users.
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.users - The list of users to display.
 * @param {string} props.users[].firstName - The first name of the user.
 * @param {string} props.users[].lastName - The last name of the user.
 * @param {string} props.users[].birthDate - The birthdate of the user.
 * @param {string} props.users[].city - The city of the user.
 * @param {string} props.users[].postalCode - The postal code of the user.
 *
 * @returns {JSX.Element} The rendered UsersList component.
 */
const UsersList = ({ users }) => {
    return (
        <div>
            <Typography variant="h5" gutterBottom>
                Liste des utilisateurs inscrits
            </Typography>
            <List>
                {users.map((user) => (
                    <ListItem key={user.id}>
                        <ListItemText
                            primary={`${user.firstName} ${user.lastName}`}
                            secondary={`Date de naissance: ${user.birthDate}, Ville: ${user.city}, Code postal: ${user.postalCode}`}
                        />
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default UsersList;

