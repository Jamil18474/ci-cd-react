const jwt = require('jsonwebtoken');

/**
 * JWT authentication middleware
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      message: 'Vous devez être connecté pour accéder à cette ressource.',
      error: 'MISSING_TOKEN',
      timestamp: new Date().toISOString()
    });
  }

  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    return res.status(500).json({
      message: 'Erreur de configuration serveur.',
      error: 'MISSING_JWT_SECRET',
      timestamp: new Date().toISOString()
    });
  }

  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      let errorMessage = 'Votre session a expiré, veuillez vous reconnecter.';
      let errorCode = 'TOKEN_EXPIRED';
      let statusCode = 401; // ✅ CHANGEMENT ICI : 401 au lieu de 403

      if (err.name === 'JsonWebTokenError') {
        errorMessage = 'Token invalide, veuillez vous reconnecter.';
        errorCode = 'INVALID_TOKEN';
        statusCode = 401; // ✅ Token invalide = 401
      } else if (err.name === 'TokenExpiredError') {
        errorMessage = 'Votre session a expiré, veuillez vous reconnecter.';
        errorCode = 'TOKEN_EXPIRED';
        statusCode = 401; // ✅ Token expiré = 401
      } else if (err.name === 'NotBeforeError') {
        errorMessage = 'Token pas encore valide.';
        errorCode = 'TOKEN_NOT_ACTIVE';
        statusCode = 401; // ✅ Token pas encore actif = 401
      }

      return res.status(statusCode).json({
        message: errorMessage,
        error: errorCode,
        timestamp: new Date().toISOString()
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Permission-based authorization middleware
 * @param {string} permission - Required permission
 * @returns {Function} Express middleware
 */
exports.requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentification requise.',
        error: 'NO_USER_IN_REQUEST',
        timestamp: new Date().toISOString()
      });
    }


    if (!req.user.permissions || !req.user.permissions.includes(permission)) {
      let message = 'Vous n\'avez pas les droits nécessaires pour cette action.';

      switch (permission) {
      case 'delete':
        message = 'Seuls les administrateurs peuvent supprimer des utilisateurs.';
        break;
      case 'read':
        message = 'Vous n\'avez pas les droits pour consulter les utilisateurs.';
        break;
      default:
        message = `Permission '${permission}' requise pour cette action.`;
      }



      return res.status(403).json({
        message,
        error: 'INSUFFICIENT_PERMISSIONS',
        required_permission: permission,
        user_permissions: req.user.permissions || [],
        user_role: req.user.role,
        timestamp: new Date().toISOString()
      });
    }


    next();
  };
};

/**
 * Admin role middleware
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentification requise.',
      error: 'NO_USER_IN_REQUEST',
      timestamp: new Date().toISOString()
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Accès réservé aux administrateurs.',
      error: 'ADMIN_ROLE_REQUIRED',
      user_role: req.user.role,
      timestamp: new Date().toISOString()
    });
  }

  next();
};

/**
 * Flexible role OR permission middleware
 * @param {string} role - Required role
 * @param {string} permission - Alternative permission
 * @returns {Function} Express middleware
 */
exports.requireRoleOrPermission = (role, permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentification requise.',
        error: 'NO_USER_IN_REQUEST',
        timestamp: new Date().toISOString()
      });
    }

    const hasRole = req.user.role === role;
    const hasPermission = req.user.permissions && req.user.permissions.includes(permission);

    if (!hasRole && !hasPermission) {
      return res.status(403).json({
        message: 'Vous n\'avez pas les droits nécessaires pour cette action.',
        error: 'INSUFFICIENT_ROLE_OR_PERMISSION',
        required_role: role,
        required_permission: permission,
        user_role: req.user.role,
        user_permissions: req.user.permissions || [],
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};