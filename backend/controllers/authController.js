const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, password, role, fullName, phone } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const finalRole = role || 'patient';
        const rolePrefix = finalRole === 'doctor' ? 'BS'
            : finalRole === 'pharmacy' ? 'DS'
            : finalRole === 'admin' ? 'AD'
            : 'BN';
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        const accountId = `${rolePrefix}-${randomNum}`;

        const newUser = new User({
            accountId, fullName, phone, username,
            password: hashedPassword, role: finalRole
        });
        await newUser.save();

        res.status(201).json({ message: 'Tạo tài khoản thành công!', accountId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });

        const token = jwt.sign(
            { id: user._id, accountId: user.accountId, username: user.username, role: user.role, fullName: user.fullName },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Đăng nhập thành công', token,
            user: { accountId: user.accountId, fullName: user.fullName, username: user.username, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};