// models/Encounter.js
const mongoose = require('mongoose');

const encounterSchema = new mongoose.Schema({
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Bệnh nhân là một User có role='patient'
        required: true 
    },
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Bác sĩ là một User có role='doctor'
        required: true 
    },
    symptoms: { 
        type: String 
    },
    diagnosis: { 
        type: String 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'In-Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    encounterDate: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model('Encounter', encounterSchema);