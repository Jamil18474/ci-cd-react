const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, birthDate, city, postalCode } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Cette adresse email est déjà utilisée.' });
    }

    const userData = {
      firstName,
      lastName,
      email: email.trim().toLowerCase(), // ✅ Normaliser l'email
      password,
      birthDate: new Date(birthDate),
      city,
      postalCode,
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

    // ✅ CRÉATION TOKEN avec durée explicite
    const tokenPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
      firstName: user.firstName, // ✅ Ajouter pour éviter les requêtes supplémentaires
      lastName: user.lastName
    };

    const jwtOptions = {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      issuer: 'user-management-api',
      audience: 'user-management-frontend'
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, jwtOptions);

    // ✅ VÉRIFICATION DE LA DURÉE DU TOKEN
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);




    res.json({
      message: 'Connexion réussie !',
      token,
      expiresAt: expiresAt.toISOString(), // ✅ Informer le frontend de l'expiration
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
 * ✅ NOUVEAU : Logout endpoint
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