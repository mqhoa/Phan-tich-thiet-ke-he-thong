const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    accountId: { type: String, unique: true },
    fullName: { type: String, required: true },
    phone: { type: String, unique: true, sparse: true },
    citizenId: { type: String, unique: true, sparse: true },
    patientCode: { type: String, unique: true, sparse: true },
    isProfileComplete: { type: Boolean, default: false },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['patient', 'doctor', 'pharmacy', 'admin'], default: 'patient' },

    // Thông tin y tế - chủ yếu áp dụng cho role 'patient'
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    bloodType: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    allergies: [{ type: String }],
    address: { type: String }
});

module.exports = mongoose.model('User', UserSchema);