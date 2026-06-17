const mongoose = require('mongoose');

const encounterSchema = new mongoose.Schema({
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    // Admin phân công bác sĩ sau, mặc định lúc đầu là null
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null 
    },
    symptoms: { type: String },
    diagnosis: { type: String, default: '' },
    status: { 
        type: String, 
        enum: ['Pending_Assignment', 'Pending', 'In-Progress', 'Completed', 'Cancelled'],
        default: 'Pending_Assignment' 
    },
    encounterDate: { 
        type: Date, 
        default: Date.now 
    },
    followUpDate: { type: Date, default: null },
    followUpNotes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Encounter', encounterSchema);