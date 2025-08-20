const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    specialization: {
        type: String,
        required: true
    },
    qualifications: [{
        degree: String,
        institution: String,
        year: Number
    }],
    contactInfo: {
        phoneNumber: {
            type: String,
            required: true,
            match: [/^[0-9]{10,15}$/, 'Please add a valid phone number']
        },
        email: {
            type: String,
            required: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Please add a valid email'],
            lowercase: true,
            trim: true
        },
        address: String
    },
    assignedClasses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
