const Encounter = require('../models/Encounter');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

// [LỄ TÂN] - Tạo hồ sơ khám bệnh khi bệnh nhân đến
const createEncounter = async (req, res) => {
    try {
        const { patientId, doctorId, symptoms } = req.body;
        const userId = req.user.id;

        const [patient, doctor] = await Promise.all([
            User.findById(patientId),
            User.findById(doctorId)
        ]);

        if (!patient || patient.role !== 'patient') {
            return res.status(400).json({ message: 'patientId không hợp lệ hoặc không phải bệnh nhân!' });
        }
        if (!doctor || doctor.role !== 'doctor') {
            return res.status(400).json({ message: 'doctorId không hợp lệ hoặc không phải bác sĩ!' });
        }

        const newEncounter = new Encounter({
            patientId,
            doctorId,
            symptoms,
            status: 'Pending'
        });
        await newEncounter.save();

        await ActivityLog.create({
            userId: userId,
            action: 'CREATE_ENCOUNTER',
            details: { encounterId: newEncounter._id, patientId, doctorId }
        });

        res.status(201).json({ message: 'Tạo hồ sơ khám thành công', encounter: newEncounter });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [BÁC SĨ] - Cập nhật chẩn đoán sau khi khám xong
const updateDiagnosis = async (req, res) => {
    try {
        const encounterId = req.params.id;
        const { diagnosis } = req.body;
        const userId = req.user.id;

        const updatedEncounter = await Encounter.findByIdAndUpdate(
            encounterId,
            {
                diagnosis: diagnosis,
                status: 'Completed'
            },
            { new: true }
        );

        if (!updatedEncounter) {
            return res.status(404).json({ message: 'Không tìm thấy hồ sơ khám' });
        }

        await ActivityLog.create({
            userId: userId,
            action: 'UPDATE_DIAGNOSIS',
            details: { encounterId, newDiagnosis: diagnosis }
        });

        res.status(200).json({ message: 'Cập nhật chẩn đoán thành công', encounter: updatedEncounter });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { createEncounter, updateDiagnosis };