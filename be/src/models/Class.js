const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['regular', 'therapy', 'mixed'],
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        enum: ['1', '2', 'summer'],
        required: true
    },
    teachers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    }],
    students: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    }],
    maxCapacity: {
        type: Number,
        required: true
    },
    currentCapacity: {
        type: Number,
        default: 0
    },
     slots: [{
        dayOfWeek: { type: String },
        date: { type: Date },
        startTime: { type: String },
        endTime: { type: String },
        location: { type: String },
        activity: { type: String, enum: ['class', 'therapy', 'other'], default: 'class' }
    }],
    description: String,
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Validate slots: HH:mm format, start < end, optional dayOfWeek whitelist
const HM_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const ALLOWED_DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

classSchema.path('slots').validate(function(slots) {
    if (!slots) return true;
    if (!Array.isArray(slots)) return false;
    for (const s of slots) {
        if (!s.startTime || !s.endTime) return false;
        if (!HM_REGEX.test(s.startTime) || !HM_REGEX.test(s.endTime)) return false;
        if (s.startTime >= s.endTime) return false;
        if (s.dayOfWeek && !ALLOWED_DAYS.includes(s.dayOfWeek)) return false;
    }
    return true;
}, 'Invalid slots format');

 
module.exports = mongoose.model('Class', classSchema);
