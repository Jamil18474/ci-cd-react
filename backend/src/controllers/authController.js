const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {
  isEmailValid,
  isPasswordValid,
  isNameValid,
  isPostalCodeValid,
  isAgeValidFromBirthDate
} = require('../utils/validators');

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate, city, postalCode } = req.body;

    // --- VALIDATION ---
    let errors = {};

    if (!firstName || !isNameValid(firstName)) {
      errors.firstName = "Prénom invalide (lettres, espaces, tirets, apostrophes uniquement)";
    }
    if (!lastName || !isNameValid(lastName)) {
      errors.lastName = "Nom invalide (lettres, espaces, tirets, apostrophes uniquement)";
    }
    if (!email || !isEmailValid(email)) {
      errors.email = "Email invalide";
    }
    if (!password || !isPasswordValid(password)) {
      errors.password = "Mot de passe invalide (6 caractères minimum)";
    }
    if (!birthDate || !isAgeValidFromBirthDate(birthDate)) {
      errors.birthDate = "Vous devez avoir au moins 18 ans";
    }
    if (!city || !isNameValid(city)) {
      errors.city = "Ville invalide (lettres, espaces, tirets, apostrophes uniquement)";
    }
    if (!postalCode || !isPostalCodeValid(postalCode)) {
      errors.postalCode = "Code postal invalide (format français attendu)";
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: "Validation échouée", errors });
    }
    // --- FIN VALIDATION ---

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });

    if (existingUser) {
      return res.status(400).json({ message: 'Cette adresse email est déjà utilisée.' });
    }

    const userData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      password,
      birthDate: new Date(birthDate),
      city: city.trim(),
      postalCode: postalCode.trim(),
      role: 'user'
    };

    const user = new User(userData);
    const savedUser = await user.save();

    res.status(201).json({
      message: 'Votre compte a été créé avec succès !',
      userId: savedUser._id
    });

  } catch (error) {
    res.status(500).json({
      message: 'Une erreur est survenue lors de la création du compte.',
      error: error.message
    });
  }
};

/**
 * Authenticate user and return JWT token
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    // CRÉATION TOKEN avec durée explicite
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      firstName: user.firstName,
      lastName: user.lastName
    };

    const jwtOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'user-management-api',
      audience: 'user-management-frontend'
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, jwtOptions);

    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    res.json({
      message: 'Connexion réussie !',
      token,
      expiresAt: expiresAt.toISOString(),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Une erreur est survenue lors de la connexion.',
      error: error.message
    });
  }
};

/**
 * Logout endpoint
 */
const logout = (req, res) => {
  try {
    res.json({
      message: 'Déconnexion réussie',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erreur lors de la déconnexion',
      error: error.message
    });
  }
};

module.exports = { register, login, logout };