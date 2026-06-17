const Encounter = require('../models/Encounter');
const User = require('../models/User');
const eRx = require('../models/eRx');
const ActivityLog = require('../models/ActivityLog');

// 1. [BỆNH NHÂN / LỄ TÂN] - Tạo đơn đăng ký khám ban đầu
const createEncounter = async (req, res) => {
    try {
        const { patientId, symptoms } = req.body;

        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(400).json({ message: 'Bệnh nhân không hợp lệ!' });
        }

        const newEncounter = new Encounter({
            patientId,
            symptoms,
            doctorId: null,
            status: 'Pending_Assignment' // Chờ Admin xếp lịch
        });
        await newEncounter.save();

        res.status(201).json({ message: 'Đăng ký khám thành công! Đơn đã gửi tới Admin.', encounter: newEncounter });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 2. [ADMIN] - Phân công bác sĩ thật vào lịch khám và chuyển trạng thái
const assignDoctor = async (req, res) => {
    try {
        const encounterId = req.params.id;
        const { doctorId } = req.body;

        const doctor = await User.findOne({ _id: doctorId, role: 'doctor', isActive: true });
        if (!doctor) return res.status(400).json({ message: 'Bác sĩ không tồn tại hoặc chưa được Admin phê duyệt vai trò!' });

        // Cập nhật bác sĩ và chuyển trạng thái sang Chờ khám (Pending)
        const updatedEncounter = await Encounter.findByIdAndUpdate(
            encounterId,
            { doctorId, status: 'Pending' },
            { new: true }
        ).populate('patientId', 'fullName patientCode').populate('doctorId', 'fullName');

        if (!updatedEncounter) return res.status(404).json({ message: 'Không tìm thấy đơn đăng ký khám!' });

        res.status(200).json({ message: 'Phân công bác sĩ và chuyển trạng thái thành công!', encounter: updatedEncounter });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 3. [ADMIN] - Xem toàn bộ danh sách đăng ký khám trong hệ thống
const getAdminEncounters = async (req, res) => {
    try {
        const encounters = await Encounter.find()
            .populate('patientId', 'fullName patientCode phone gender')
            .populate('doctorId', 'fullName accountId')
            .sort({ createdAt: -1 });
        res.json(encounters);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi hệ thống', error: error.message });
    }
};

// 4. [BỆNH NHÂN] - Tự xem lịch sử và đơn thuốc đã được kê của mình
const getMyEncounters = async (req, res) => {
    try {
        const encounters = await Encounter.find({ patientId: req.user.id })
            .populate('doctorId', 'fullName accountId')
            .sort({ createdAt: -1 });

        // Tìm thêm đơn thuốc lồng kèm nếu ca khám đã hoàn tất
        const detailedEncounters = await Promise.all(encounters.map(async (enc) => {
            let prescription = null;
            if (enc.status === 'Completed') {
                prescription = await eRx.findOne({ encounterId: enc._id }).populate('drugs.drugId', 'name unit');
            }
            return { encounter: enc, prescription };
        }));

        res.json(detailedEncounters);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 5. [BÁC SĨ] - Xem danh sách ca bệnh được phân công (Lịch bận/Lịch hẹn hôm nay)
const getDoctorSchedule = async (req, res) => {
    try {
        const schedules = await Encounter.find({
            doctorId: req.user.id,
            status: { $in: ['Pending', 'In-Progress'] }
        }).populate('patientId', 'fullName phone gender dateOfBirth patientCode').sort({ encounterDate: 1 });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 6. [BÁC SĨ] - Tiến hành khám, chẩn đoán, dặn dò tái khám
const updateDiagnosis = async (req, res) => {
    try {
        const encounterId = req.params.id;
        const { diagnosis, followUpDate, followUpNotes } = req.body;

        const updatedEncounter = await Encounter.findByIdAndUpdate(
            encounterId,
            { diagnosis, status: 'Completed', followUpDate: followUpDate || null, followUpNotes: followUpNotes || '' },
            { new: true }
        );

        if (!updatedEncounter) return res.status(404).json({ message: 'Không tìm thấy hồ sơ ca khám này!' });

        res.status(200).json({ message: 'Đã hoàn thành ca khám và lưu lịch sử y tế thành công!', encounter: updatedEncounter });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// 7. [BÁC SĨ] - Xem danh sách bệnh nhân đã thăm khám + đơn thuốc y tế để tái khám
const getDoctorHistory = async (req, res) => {
    try {
        const completed = await Encounter.find({ doctorId: req.user.id, status: 'Completed' })
            .populate('patientId', 'fullName phone patientCode allergies bloodType')
            .sort({ encounterDate: -1 });

        const history = await Promise.all(completed.map(async (enc) => {
            const rx = await eRx.findOne({ encounterId: enc._id }).populate('drugs.drugId', 'name unit');
            return { encounterDetails: enc, prescription: rx || "Không kê đơn thuốc." };
        }));

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

module.exports = { 
    createEncounter, assignDoctor, getAdminEncounters, 
    getMyEncounters, getDoctorSchedule, updateDiagnosis, getDoctorHistory 
};