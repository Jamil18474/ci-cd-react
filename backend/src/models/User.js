const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema for MongoDB
 * @typedef {Object} User
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} email - User's email (unique)
 * @property {string} password - Hashed password
 * @property {Date} birthDate - User's birthDate
 * @property {string} city - User's city
 * @property {string} postalCode - User's postal code
 * @property {string} role - User role ('user' | 'admin')
 * @property {string[]} permissions - User permissions array
 */
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    birthDate: {
      type: Date,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    postalCode: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      required: true
    },
    permissions: {
      type: [String],
      enum: ['read', 'delete'],
      default: ['read'],
      required: true
    }
  }
);

// Middleware pré-sauvegarde pour hasher le mot de passe
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS)
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);