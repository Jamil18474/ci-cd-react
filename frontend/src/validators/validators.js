/**
 * @module validators
 */

/**
 * Calculates age from a birthdate and checks if the age is valid (>= 18).
 * @param {string} birthDate - The birthdate in 'YYYY-MM-DD' format.
 * @returns {boolean} - True if the age is valid (>= 18), otherwise false.
 */
export const isAgeValidFromBirthDate = (birthDate) => {
    // Check that birthDate is not null, undefined, empty, or only spaces
    if (birthDate === null || birthDate === undefined || typeof birthDate !== 'string' || birthDate.trim() === '') {
        return false; // Return false if birthDate is null, undefined, empty, or only spaces
    }

    // Create a Date object from the date string
    const birth = new Date(birthDate);

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();

    // Adjust age if the birthday has not occurred yet this year
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age >= 18;
};

/**
 * Checks if the postal code is in the French format.
 * @param {string} postalCode - The postal code to check.
 * @returns {boolean} - True if the postal code is valid, otherwise false.
 */
export const isPostalCodeValid = (postalCode) => {
    // Check that postalCode is not null, undefined, empty, or only spaces
    if (postalCode === null || postalCode === undefined || typeof postalCode !== 'string' || postalCode.trim() === '') {
        return false; // Return false if postalCode is null, undefined, empty, or only spaces
    }
    // Regular expression to check postal codes from 01000 to 98899
    const postalCodeRegex = /^(0[1-9]\d{3}|[1-8]\d{4}|9[0-8][0-9]{3})$/; // French format (5 digits)
    return postalCodeRegex.test(postalCode);
};

/**
 * Checks if the name, first name, or city is valid (no special characters or digits).
 * @param {string} name - The name, first name, or city to check.
 * @returns {boolean} - True if the name/first name/city is valid, otherwise false.
 */
export const isNameValid = (name) => {
    // Check that name is not null, undefined, empty, or only spaces
    if (name === null || name === undefined || typeof name !== 'string' || name.trim() === '') {
        return false; // Return false if name is null, undefined, empty, or only spaces
    }
    const nameRegex = /^[A-Za-zÀ-ÿ '-]+$/; // Accepts letters, accents, spaces, apostrophes, and hyphens
    return nameRegex.test(name); // Test the name with the regular expression
};

/**
 * Checks if the email is valid.
 * @param {string} email - The email to check.
 * @returns {boolean} - True if the email is valid, otherwise false.
 */
export const isEmailValid = (email) => {
    // Check that email is not null, undefined, empty, or only spaces
    if (email === null || email === undefined || typeof email !== 'string' || email.trim() === '') {
        return false; // Return false if email is null, undefined, empty, or only spaces
    }
    // Regular expression to validate the email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]{2,})+$/;
    return emailRegex.test(email);
};
