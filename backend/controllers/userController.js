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
      {
        fullName,
        phone,
        citizenId,
        patientCode,
        dateOfBirth,
        gender,
        bloodType,
        allergies,
        address,
        isProfileComplete: true
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }

    await ActivityLog.create({
      userId: userId,
      action: 'UPDATE_PROFILE',
      details: {
        message: 'Người dùng cập nhật hồ sơ cá nhân lần đầu',
        changedData: { fullName, phone, citizenId, patientCode, dateOfBirth, gender, bloodType, allergies, address }
      },
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Cập nhật thông tin và ghi nhận lịch sử thành công!',
      user: updatedUser
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Số điện thoại, CCCD hoặc Mã bệnh nhân đã tồn tại trên hệ thống!' });
    }
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};