const mongoose = require('mongoose');

const therapySessionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    therapist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    dateTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    type: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: {
        beforeSession: String,
        duringSession: String,
        followUp: String
    },
    progress: {
        rating: Number,
        comments: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TherapySession', therapySessionSchema);
