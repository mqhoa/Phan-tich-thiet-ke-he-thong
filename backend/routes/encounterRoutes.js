const express = require('express');
const router = express.Router();
const encounterController = require('../controllers/encounterController');
const { checkRole } = require('../middleware/checkRole');

// [POST] /api/encounters (Tạo hồ sơ)
router.post('/', checkRole(['admin']), encounterController.createEncounter);

router.put('/:id/diagnosis', checkRole(['doctor']), encounterController.updateDiagnosis);

module.exports = router;