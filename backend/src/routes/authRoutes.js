const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post('/register', authController.register);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and return JWT token
 * @access Public
 */
router.post('/login', authController.login);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route GET /api/auth/me
 * @desc Get current user from token
 * @access Private
 */
router.get('/me', authenticateToken, (req, res) => {
  try {


    res.json({
      message: 'Token valide',
      user: {
        id: req.user.userId,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        role: req.user.role,
        permissions: req.user.permissions
      },
      tokenInfo: {
        issuedAt: new Date(req.user.iat * 1000).toISOString(),
        expiresAt: new Date(req.user.exp * 1000).toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Erreur vérification token:', error);
    res.status(500).json({
      message: 'Erreur lors de la vérification du token',
      error: error.message
    });
  }
});

// ✅ Route de diagnostic JWT
router.get('/token-info', authenticateToken, (req, res) => {
  const now = Date.now() / 1000;
  const timeLeft = req.user.exp - now;

  res.json({
    currentTime: new Date().toISOString(),
    tokenIssuedAt: new Date(req.user.iat * 1000).toISOString(),
    tokenExpiresAt: new Date(req.user.exp * 1000).toISOString(),
    timeLeftSeconds: Math.round(timeLeft),
    timeLeftMinutes: Math.round(timeLeft / 60),
    timeLeftHours: Math.round(timeLeft / 3600),
    user: req.user.email,
    role: req.user.role
  });
});

module.exports = router;