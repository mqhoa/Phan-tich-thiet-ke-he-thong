const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(403).json({ message: 'Missing Token!' });

        // Token giả lập có dạng: "Bearer mock-token-{role}-{username}"
        const tokenParts = authHeader.split(' ')[1].split('-');
        const userRole = tokenParts[2];
        const username = tokenParts[3];

        if (!requiredRoles.includes(userRole)) {
            return res.status(401).json({ message: `Access Denied! Required roles: ${requiredRoles.join(', ')}` });
        }

        // Truyền thông tin user vào request để các route sau dùng
        req.user = { role: userRole, username };
        next();
    };
};

module.exports = { checkRole };