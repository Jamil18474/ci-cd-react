/**
 * @module validators
 */

/**
 * Vérifie si la date de naissance donne au moins 18 ans.
 * @param {string} birthDate - Date de naissance au format 'YYYY-MM-DD'
 * @returns {boolean}
 */
function isAgeValidFromBirthDate(birthDate) {
  if (birthDate === null || birthDate === undefined || typeof birthDate !== 'string' || birthDate.trim() === '') {
    return false;
  }
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return false;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDifference = today.getMonth() - birth.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 18;
}

/**
 * Vérifie si le code postal est français (5 chiffres valides)
 * @param {string} postalCode
 * @returns {boolean}
 */
function isPostalCodeValid(postalCode) {
  if (postalCode === null || postalCode === undefined || typeof postalCode !== 'string' || postalCode.trim() === '') {
    return false;
  }
  // Regex codes postaux français 01000 à 98899
  const postalCodeRegex = /^(0[1-9]\d{3}|[1-8]\d{4}|9[0-8][0-9]{3})$/;
  return postalCodeRegex.test(postalCode);
}

/**
 * Vérifie si un nom/prénom/ville est valide (lettres, espaces, tirets, apostrophes)
 * @param {string} name
 * @returns {boolean}
 */
function isNameValid(name) {
  if (name === null || name === undefined || typeof name !== 'string' || name.trim() === '') {
    return false;
  }
  const nameRegex = /^[A-Za-zÀ-ÿ '-]+$/;
  return nameRegex.test(name);
}

/**
 * Vérifie si l'email est valide
 * @param {string} email
 * @returns {boolean}
 */
function isEmailValid(email) {
  if (email === null || email === undefined || typeof email !== 'string' || email.trim() === '') {
    return false;
  }
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]{2,})+$/;
  return emailRegex.test(email);
}

/**
 * Vérifie si le mot de passe est valide (au moins 6 caractères)
 * @param {string} password
 * @returns {boolean}
 */
function isPasswordValid(password) {
  if (password === null || password === undefined || typeof password !== 'string' || password.trim() === '') {
    return false;
  }
  return password.length >= 6;
}

module.exports = {
  isAgeValidFromBirthDate,
  isPostalCodeValid,
  isNameValid,
  isEmailValid,
  isPasswordValid
};