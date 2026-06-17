// models/Drug.js
const mongoose = require('mongoose');

const drugSchema = new mongoose.Schema({
    drugCode: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { 
        type: String, 
        required: true 
    },
    activeIngredient: { // Hoạt chất chính (rất quan trọng để check tương tác thuốc)
        type: String 
    },
    unit: { // Đơn vị tính
        type: String, 
        enum: ['Vỉ', 'Hộp', 'Viên', 'Chai', 'Ống'],
        required: true
    },
    stockQuantity: { // Số lượng tồn kho hiện tại
        type: Number, 
        default: 0 
    },
    price: { 
        type: Number 
    }
}, { timestamps: true });

module.exports = mongoose.model('Drug', drugSchema);