const express = require('express');
const router = express.Router();
const encounterController = require('../controllers/encounterController');
const { checkRole } = require('../middleware/checkRole');

// Luồng đặt lịch và điều phối của Admin/Bệnh nhân
router.post('/', checkRole(['admin', 'receptionist', 'patient']), encounterController.createEncounter);
router.get('/my-history', checkRole(['patient']), encounterController.getMyEncounters);
router.get('/admin/all', checkRole(['admin']), encounterController.getAdminEncounters);
router.put('/:id/assign-doctor', checkRole(['admin']), encounterController.assignDoctor);

// Luồng xử lý nghiệp vụ y tế của Bác sĩ
router.get('/doctor/schedule', checkRole(['doctor']), encounterController.getDoctorSchedule);
router.get('/doctor/history', checkRole(['doctor']), encounterController.getDoctorHistory);
router.put('/:id/diagnosis', checkRole(['doctor']), encounterController.updateDiagnosis);

module.exports = router;