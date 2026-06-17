const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      fullName, phone, citizenId, patientCode,
      dateOfBirth, gender, bloodType, allergies, address
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { fullName, phone, citizenId, patientCode, dateOfBirth, gender, bloodType, allergies, address, isProfileComplete: true },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

    await ActivityLog.create({
      userId: userId,
      action: 'UPDATE_PROFILE',
      details: { changedData: { fullName, phone, citizenId } },
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Cập nhật thông tin thành công!', user: updatedUser });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Số điện thoại, CCCD hoặc Mã bệnh nhân đã tồn tại!' });
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [ADMIN] - Lấy danh sách tài khoản bác sĩ/dược sĩ chờ duyệt
exports.getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await User.find({ isActive: false, role: { $ne: 'patient' } }).select('-password');
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [ADMIN] - Phê duyệt tài khoản nhân viên
exports.approveUser = async (req, res) => {
    try {
        const { userId, approve } = req.body; // approve: true/false

        if (approve) {
            const updatedUser = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });
            if (!updatedUser) return res.status(404).json({ message: 'Không tìm thấy tài khoản.' });

            await ActivityLog.create({
                userId: req.user.id,
                action: 'APPROVE_USER_ROLE',
                details: { approvedUserId: userId, role: updatedUser.role }
            });
            return res.json({ message: `Đã xác thực thành công vai trò cho ${updatedUser.fullName}` });
        } else {
            await User.findByIdAndDelete(userId);
            return res.json({ message: 'Đã từ chối và xóa tài khoản đăng ký không hợp lệ.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};