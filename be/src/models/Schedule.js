const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    slots: [{
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        activity: {
            type: String,
            enum: ['class', 'therapy', 'break', 'meeting', 'other'],
            required: true
        },
        relatedTo: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'slots.refModel'
        },
        refModel: {
            type: String,
            enum: ['Class', 'TherapySession']
        },
        notes: String
    }],
    isHoliday: {
        type: Boolean,
        default: false
    },
    holidayReason: String
}, {
    timestamps: true
});

// Composite index to ensure unique schedules per teacher per date
scheduleSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
