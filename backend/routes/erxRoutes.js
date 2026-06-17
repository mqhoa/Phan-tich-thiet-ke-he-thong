const express = require('express');
const router = express.Router();
const erxController = require('../controllers/erxController');
const { checkRole } = require('../middleware/checkRole');

router.get('/erx', checkRole(['admin', 'pharmacy', 'doctor']), erxController.getAllRx);
router.get('/erx/my', checkRole(['patient']), erxController.getMyRx);
router.post('/erx', checkRole(['doctor']), erxController.createRx);
router.put('/erx/:id/dispense', checkRole(['pharmacy']), erxController.dispenseRx);

router.get('/logs', checkRole(['admin', 'pharmacy']), erxController.getLogs);
router.post('/check-interaction', erxController.checkInteraction);

module.exports = router;