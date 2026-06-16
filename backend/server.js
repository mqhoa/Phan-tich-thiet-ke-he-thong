require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Chuỗi bí mật để tạo Token (JWT)
const JWT_SECRET = process.env.JWT_SECRET;

// ==========================================
// 1. KẾT NỐI MONGODB THẬT (Đã xóa options cũ)
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Đã kết nối thành công với MongoDB'))
    .catch((err) => console.error('❌ Lỗi kết nối MongoDB:', err));

// ==========================================
// 2. KHAI BÁO CẤU TRÚC BẢNG DỮ LIỆU (SCHEMAS)
// ==========================================
const UserSchema = new mongoose.Schema({
    accountId: { type: String, unique: true }, // Mã định danh tự sinh
    fullName: { type: String, required: true }, // Tên thật của người dùng
    phone: { type: String }, // Số điện thoại
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'pharmacy', 'admin'], default: 'patient' }
});
const User = mongoose.model('User', UserSchema);

const PrescriptionSchema = new mongoose.Schema({
    patient: String,
    meds: String,
    status: { type: String, default: 'Pending' },
    createdBy: String
});
const Prescription = mongoose.model('Prescription', PrescriptionSchema);

const AuditLogSchema = new mongoose.Schema({
    time: { type: Date, default: Date.now },
    action: String,
    user: String
});
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

// Hàm ghi log vào Database thật
const logAction = async (action, username) => {
    await new AuditLog({ action, user: username }).save();
};

// ==========================================
// 3. MIDDLEWARE PHÂN QUYỀN VỚI JWT THẬT
// ==========================================
const checkRole = (requiredRoles) => {
    return (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) return res.status(403).json({ message: 'Không tìm thấy Token truy cập!' });

        const token = authHeader.split(' ')[1];
        try {
            // Giải mã Token để lấy thông tin user
            const decoded = jwt.verify(token, JWT_SECRET);
            
            if (!requiredRoles.includes(decoded.role)) {
                return res.status(401).json({ message: 'Truy cập bị từ chối! Sai quyền hạn.' });
            }
            req.user = decoded; // Lưu lại { id, username, role } để các API bên dưới dùng
            next();
        } catch (err) {
            return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
        }
    };
};

// ==========================================
// 4. API TẠO TÀI KHOẢN & ĐĂNG NHẬP
// ==========================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password, role, fullName, phone } = req.body;
        
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Logic sinh Mã số tài khoản tự động (Ví dụ: BN-58291)
        const rolePrefix = role === 'patient' ? 'BN' : role === 'doctor' ? 'BS' : role === 'pharmacy' ? 'DS' : 'AD';
        const randomNum = Math.floor(10000 + Math.random() * 90000); // Tạo số ngẫu nhiên 5 chữ số
        const accountId = `${rolePrefix}-${randomNum}`;

        const newUser = new User({ 
            accountId, 
            fullName, 
            phone,
            username, 
            password: hashedPassword, 
            role: role || 'patient' 
        });
        await newUser.save();
        
        res.status(201).json({ message: 'Tạo tài khoản thành công!', accountId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Sai tên đăng nhập hoặc mật khẩu' });

        // Đưa thêm accountId và fullName vào Token
        const token = jwt.sign(
            { id: user._id, accountId: user.accountId, username: user.username, role: user.role, fullName: user.fullName }, 
            JWT_SECRET, 
            { expiresIn: '1d' }
        );
        
        res.json({ 
            message: 'Đăng nhập thành công', 
            token, 
            user: { 
                accountId: user.accountId,
                fullName: user.fullName,
                username: user.username, 
                role: user.role 
            } 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==========================================
// 5. CÁC API NGHIỆP VỤ (ĐÃ CHUYỂN SANG MONGODB)
// ==========================================

// 1. API Lấy toàn bộ đơn thuốc (Lấy từ MongoDB)
app.get('/api/erx', checkRole(['admin', 'pharmacy', 'doctor']), async (req, res) => {
    const rxList = await Prescription.find();
    res.json(rxList);
});

// 2. API Lấy đơn thuốc cá nhân
app.get('/api/erx/my', checkRole(['patient']), async (req, res) => {
    const myRx = await Prescription.find({ patient: req.user.username });
    res.json(myRx);
});

// 3. API Bác sĩ kê đơn (Lưu vào MongoDB)
app.post('/api/erx', checkRole(['doctor']), async (req, res) => {
    const { patient, meds } = req.body;
    const newRx = new Prescription({ patient, meds, createdBy: req.user.username });
    
    await newRx.save();
    await logAction(`Created Rx for ${patient}`, req.user.username); // Ghi log
    
    res.status(201).json(newRx);
});

// 4. API Dược sĩ cấp phát thuốc
app.put('/api/erx/:id/dispense', checkRole(['pharmacy']), async (req, res) => {
    const rx = await Prescription.findById(req.params.id);
    if (!rx) return res.status(404).json({ message: 'Not Found' });

    if (rx.status === 'Dispensed') {
        return res.status(400).json({ message: 'Đơn thuốc này đã được cấp phát trước đó!' });
    }

    rx.status = 'Dispensed';
    await rx.save();
    await logAction(`Dispensed Rx ${rx._id}`, req.user.username);
    
    res.json(rx);
});

// 5. API Lấy Audit Logs
app.get('/api/logs', checkRole(['admin']), async (req, res) => {
    const logs = await AuditLog.find().sort({ time: -1 }); // Sắp xếp log mới nhất lên đầu
    res.json(logs);
});

// Mock API: Cảnh báo tương tác thuốc (Giữ nguyên vì không dùng DB)
app.post('/api/check-interaction', (req, res) => {
    const { meds } = req.body;
    const medsLower = meds.toLowerCase();
    
    if (medsLower.includes('aspirin') && medsLower.includes('ibuprofen')) {
        return res.json({ 
            hasWarning: true, 
            message: 'CẢNH BÁO Y KHOA: Nguy cơ xuất huyết dạ dày cao khi dùng chung Aspirin và Ibuprofen!' 
        });
    }
    
    res.json({ hasWarning: false });
});

// Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));