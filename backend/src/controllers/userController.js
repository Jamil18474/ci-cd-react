const User = require('../models/User');

/**
 * Get all users from database
 * @param {Request} req - Express request
 * @param {Response} res - Express response
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
 * @param {Request} req - Express request
 * @param {Response} res - Express response
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
 * Delete user by ID (prevents self-deletion)
 * @param {Request} req - Express request
 * @param {Response} res - Express response
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