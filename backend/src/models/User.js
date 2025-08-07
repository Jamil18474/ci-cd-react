const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema for MongoDB
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
      required: true,
      unique: true // ✅ Ajouter unique pour éviter les doublons
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
      default: function() {
        // ✅ AMÉLIORATION : Admin a toutes les permissions par défaut
        return this.role === 'admin' ? ['read', 'delete'] : ['read'];
      },
      required: true
    }
  },
  {
    timestamps: true // ✅ Ajouter createdAt et updatedAt automatiquement
  }
);

// ✅ Middleware pour s'assurer que les admins ont toutes les permissions
userSchema.pre('save', function(next) {
  if (this.role === 'admin') {
    this.permissions = ['read', 'delete'];
  } else if (this.role === 'user' && this.permissions.length === 0) {
    this.permissions = ['read'];
  }
  next();
});

// Middleware pré-sauvegarde pour hasher le mot de passe
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(
      parseInt(process.env.BCRYPT_ROUNDS) || 12
    );
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('User', userSchema);