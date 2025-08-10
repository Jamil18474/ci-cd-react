const User = require('../models/User');
const {
  isEmailValid,
  isPasswordValid,
  isNameValid,
  isPostalCodeValid,
  isAgeValidFromBirthDate
} = require('../utils/validators');

/**
 * Get all users (pas besoin de validation custom ici)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({
      message: 'Liste des utilisateurs récupérée avec succès.',
      users: users.map(user => ({
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        birthDate: user.birthDate,
        city: user.city,
        postalCode: user.postalCode,
        role: user.role,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }))
    });
  } catch (error) {
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération des utilisateurs.',
      error: error.message
    });
  }
};

/**
 * Get user by MongoDB ObjectId
 */
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
    }
    const user = await User.findById(userId, '-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }
    res.json({
      message: 'Utilisateur récupéré avec succès.',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        birthDate: user.birthDate,
        city: user.city,
        postalCode: user.postalCode,
        role: user.role,
        permissions: user.permissions,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Une erreur est survenue lors de la récupération de l\'utilisateur.',
      error: error.message
    });
  }
};

/**
 * Update user by ID (exemple avec validation)
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
    }

    const { firstName, lastName, email, birthDate, city, postalCode, password } = req.body;
    const errors = {};

    if (firstName !== undefined && !isNameValid(firstName)) {
      errors.firstName = 'Prénom invalide';
    }
    if (lastName !== undefined && !isNameValid(lastName)) {
      errors.lastName = 'Nom invalide';
    }
    if (email !== undefined && !isEmailValid(email)) {
      errors.email = 'Email invalide';
    }
    if (birthDate !== undefined && !isAgeValidFromBirthDate(birthDate)) {
      errors.birthDate = 'Vous devez avoir au moins 18 ans';
    }
    if (city !== undefined && !isNameValid(city)) {
      errors.city = 'Ville invalide';
    }
    if (postalCode !== undefined && !isPostalCodeValid(postalCode)) {
      errors.postalCode = 'Code postal invalide';
    }
    if (password !== undefined && !isPasswordValid(password)) {
      errors.password = 'Mot de passe invalide';
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ message: 'Validation échouée', errors });
    }

    const updatedData = {};
    if (firstName !== undefined) updatedData.firstName = firstName.trim();
    if (lastName !== undefined) updatedData.lastName = lastName.trim();
    if (email !== undefined) updatedData.email = email.trim().toLowerCase();
    if (birthDate !== undefined) updatedData.birthDate = new Date(birthDate);
    if (city !== undefined) updatedData.city = city.trim();
    if (postalCode !== undefined) updatedData.postalCode = postalCode.trim();
    if (password !== undefined) updatedData.password = password;

    const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true, runValidators: true, context: 'query' });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    res.json({
      message: 'Utilisateur mis à jour avec succès.',
      user: {
        id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        birthDate: updatedUser.birthDate,
        city: updatedUser.city,
        postalCode: updatedUser.postalCode,
        role: updatedUser.role,
        permissions: updatedUser.permissions,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Une erreur est survenue lors de la mise à jour de l\'utilisateur.',
      error: error.message
    });
  }
};

/**
 * Delete user by ID (validation déjà présente)
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Identifiant utilisateur invalide.' });
    }

    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (userToDelete._id.toString() === req.user.userId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' });
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    res.json({
      message: `L'utilisateur ${deletedUser.firstName} ${deletedUser.lastName} a été supprimé avec succès.`,
      deletedUser: {
        id: deletedUser._id,
        firstName: deletedUser.firstName,
        lastName: deletedUser.lastName,
        email: deletedUser.email
      }
    });
  } catch (error) {
    res.status(500).json({
      message: 'Une erreur est survenue lors de la suppression de l\'utilisateur.',
      error: error.message
    });
  }
};