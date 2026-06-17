const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkRole } = require('../middleware/checkRole');

// [PUT] /api/users/update-profile
router.put('/update-profile', checkRole(['patient', 'doctor', 'pharmacy', 'admin']), userController.updateProfile);

module.exports = router;