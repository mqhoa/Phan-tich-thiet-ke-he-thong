const jwt = require('jsonwebtoken');
const User = require('../models/User');

const checkRole = (requiredRoles) => {
    return async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];
            if (!authHeader) return res.status(403).json({ message: 'Không tìm thấy Token truy cập!' });

            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Tìm tài khoản trong DB để đảm bảo dữ liệu là thật và đã kích hoạt
            const userCheck = await User.findById(decoded.id);
            if (!userCheck) {
                return res.status(404).json({ message: 'Tài khoản không tồn tại trên hệ thống dữ liệu!' });
            }

            if (!userCheck.isActive) {
                return res.status(403).json({ message: 'Tài khoản của bạn chưa được Admin phê duyệt kích hoạt!' });
            }

            if (!requiredRoles.includes(userCheck.role)) {
                return res.status(401).json({ message: 'Truy cập bị từ chối! Sai quyền hạn vai trò.' });
            }

            req.user = decoded; // Gán thông tin đã giải mã vào req.user
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
        }
    };
};

module.exports = { checkRole };