const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requirePermission } = require('../middleware/auth');

/**
 * @route GET /api/users
 * @desc Get all users
 */
router.get('/', authenticateToken, requirePermission('read'), userController.getAllUsers);

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 */
router.get('/:id', authenticateToken, requirePermission('read'), userController.getUserById);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user by ID
 */
router.delete('/:id', authenticateToken, requirePermission('delete'), userController.deleteUser);

module.exports = router;