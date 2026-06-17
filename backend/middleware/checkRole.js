const jwt = require('jsonwebtoken');

const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(403).json({ message: 'Không tìm thấy Token truy cập!' });

        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            if (!requiredRoles.includes(decoded.role)) {
                return res.status(401).json({ message: 'Truy cập bị từ chối! Sai quyền hạn.' });
            }
            req.user = decoded; 
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
        }
    };
};

module.exports = { checkRole };