// models/ActivityLog.js
const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Ai là người thực hiện hành động này?
        required: true 
    },
    action: { 
        type: String, 
        required: true // Ví dụ: 'CREATE_ENCOUNTER', 'UPDATE_PROFILE', 'DISPENSE_DRUG'
    },
    details: { 
        type: mongoose.Schema.Types.Mixed // Lưu data linh hoạt (JSON). Ví dụ lưu lại nội dung đơn thuốc vừa kê, hoặc data trước/sau khi sửa.
    },
    ipAddress: {
        type: String // (Tùy chọn) Lưu IP để tăng cường bảo mật
    }
}, { timestamps: true }); // Tự động có trường createdAt để biết thời gian thao tác

module.exports = mongoose.model('ActivityLog', activityLogSchema);