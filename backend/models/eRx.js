// models/eRx.js
const mongoose = require('mongoose');

const prescriptionItemSchema = new mongoose.Schema({
    drugId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Drug',
        required: true 
    },
    quantity: { 
        type: Number, 
        required: true 
    },
    dosage: { 
        type: String, 
        required: true 
    },
    instructions: { 
        type: String, 
        required: true 
    }
}, { _id: false });

const eRxSchema = new mongoose.Schema({
    encounterId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Encounter', 
        required: true 
    },
    doctorId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    },
    patientId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Bệnh nhân là một User có role='patient'
        required: true 
    },
    drugs: [prescriptionItemSchema],
    status: { 
        type: String, 
        enum: ['Pending', 'Dispensed', 'Cancelled'],
        default: 'Pending' 
    },
    note: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('eRx', eRxSchema);