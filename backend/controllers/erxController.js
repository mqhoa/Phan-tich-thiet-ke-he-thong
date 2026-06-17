const eRx = require('../models/eRx');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const Encounter = require('../models/Encounter');

// [DƯỢC SĨ / ADMIN] - Lấy toàn bộ đơn thuốc kèm thông tin hồ sơ chi tiết để bốc thuốc
exports.getAllRx = async (req, res) => {
    try {
        const rxList = await eRx.find()
            .populate('patientId', 'fullName accountId patientCode phone')
            .populate('doctorId', 'fullName accountId')
            .populate('drugs.drugId', 'name unit activeIngredient')
            .sort({ createdAt: -1 });
        res.json(rxList);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [BỆNH NHÂN] - Lấy đơn thuốc của chính mình
exports.getMyRx = async (req, res) => {
    try {
        const myRx = await eRx.find({ patientId: req.user.id })
            .populate('doctorId', 'fullName accountId')
            .populate('drugs.drugId', 'name unit');
        res.json(myRx);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [BÁC SĨ] - Tạo đơn thuốc (Liên kết chặt chẽ với đơn khám bệnh nhân)
exports.createRx = async (req, res) => {
    try {
        const { encounterId, patientId, drugs, note } = req.body;
        const doctorId = req.user.id;

        if (!Array.isArray(drugs) || drugs.length === 0) {
            return res.status(400).json({ message: 'Đơn thuốc phải có ít nhất 1 loại thuốc!' });
        }

        const patient = await User.findById(patientId);
        if (!patient || patient.role !== 'patient') {
            return res.status(400).json({ message: 'Bệnh nhân không hợp lệ!' });
        }

        const newRx = new eRx({ encounterId, patientId, doctorId, drugs, note });
        await newRx.save();

        res.status(201).json({ message: 'Kê đơn thành công! Đơn thuốc đã gửi tới dược sĩ.', newRx });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [DƯỢC SĨ] - Tiến hành cấp phát (bốc thuốc) cho bệnh nhân
exports.dispenseRx = async (req, res) => {
    try {
        const rx = await eRx.findById(req.params.id);
        if (!rx) return res.status(404).json({ message: 'Không tìm thấy đơn thuốc!' });

        if (rx.status === 'Dispensed') {
            return res.status(400).json({ message: 'Đơn thuốc này đã bốc phát trước đó!' });
        }

        rx.status = 'Dispensed';
        await rx.save();

        res.json({ message: 'Cấp phát thuốc thành công, hồ sơ bệnh án đã đóng hoàn toàn!', rx });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [DƯỢC SĨ / ADMIN] - Xem lịch sử hành động trong hệ thống
exports.getLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find()
            .sort({ createdAt: -1 })
            .populate('userId', 'username fullName accountId role');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Kiểm tra tương tác thuốc cơ bản theo từ khóa
exports.checkInteraction = (req, res) => {
    try {
        const { meds } = req.body;
        if (!meds || typeof meds !== 'string') {
            return res.status(400).json({ message: 'Thiếu thông tin thuốc (meds) hoặc dữ liệu không hợp lệ!' });
        }
        const medsLower = meds.toLowerCase();

        if (medsLower.includes('aspirin') && medsLower.includes('ibuprofen')) {
            return res.json({
                hasWarning: true,
                message: 'CẢNH BÁO Y KHOA: Nguy cơ xuất huyết dạ dày cao khi dùng chung Aspirin và Ibuprofen!'
            });
        }
        res.json({ hasWarning: false });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};