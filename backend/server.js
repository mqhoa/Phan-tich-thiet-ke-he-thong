require('dotenv').config(); // load env trước tiên

const express = require('express');
const cors = require('cors');

// 1. Import hàm kết nối Database
const connectDB = require('./config/db');

// 2. Import các file định tuyến (Routes)
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const encounterRoutes = require('./routes/encounterRoutes');
const erxRoutes = require('./routes/erxRoutes');

const app = express();

// 3. Cấu hình Middleware cơ bản
app.use(cors());
app.use(express.json());

// 4. Thực thi kết nối tới MongoDB
connectDB();

// 5. Khai báo sử dụng Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);          // mới: trước đây chưa được mount
app.use('/api/encounters', encounterRoutes); // mới: trước đây chưa được mount
app.use('/api', erxRoutes);

// 6. Khởi chạy Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Backend đang chạy tại port ${PORT}`);
});