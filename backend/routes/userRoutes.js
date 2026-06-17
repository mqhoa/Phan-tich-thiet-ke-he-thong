const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { checkRole } = require('../middleware/checkRole');

router.put('/update-profile', checkRole(['patient', 'doctor', 'pharmacy', 'receptionist', 'admin']), userController.updateProfile);

// Admin kiểm soát, phê duyệt vai trò nhân sự
router.get('/pending-approvals', checkRole(['admin']), userController.getPendingUsers);
router.post('/approve-role', checkRole(['admin']), userController.approveUser);

module.exports = router;