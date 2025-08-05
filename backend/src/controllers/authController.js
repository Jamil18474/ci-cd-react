const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register new user
 * @param {Request} req - Express request
 * @param {Response} res - Express response
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
      email: email.trim(),
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
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        permissions: user.permissions
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Connexion réussie !',
      token,
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

module.exports = { register, login };