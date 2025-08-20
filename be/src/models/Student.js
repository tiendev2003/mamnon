const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    enrollmentInfo: {
        enrollmentDate: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'pending'],
            default: 'pending'
        },
        previousSchool: String,
        documents: [{
            name: String,
            submitted: Boolean
        }]
    },
    address: {
        street: String,
        city: String,
        district: String,
        province: String
    },
    contactInfo: {
        parentName: String,
        relationship: String,
        phoneNumber: {
            type: String,
            match: [/^[0-9]{10,15}$/, 'Please add a valid phone number']
        },
        email: {
            type: String,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/, 'Please add a valid email'],
            lowercase: true,
            trim: true
        }
    },
    therapyStatus: {
        isInTherapy: {
            type: Boolean,
            default: false
        },
        condition: String,
        notes: String
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class'
    },
    therapyHistory: [{
        date: Date,
        description: String,
        therapist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        },
        progress: String,
        notes: String
    }],
    academicProgress: [{
        term: String,
        year: String,
        evaluation: String,
        comments: String,
        evaluatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher'
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
