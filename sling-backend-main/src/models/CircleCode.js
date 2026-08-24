const mongoose = require('mongoose');

const circleCodeSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    },
    region: {
        type: String,
        enum: ['north', 'south', 'east', 'west', 'central', 'northeast'],
        default: 'north'
    }
}, {
    timestamps: true
});

// Index for efficient queries
circleCodeSchema.index({ code: 1 });
circleCodeSchema.index({ state: 1 });
circleCodeSchema.index({ isActive: 1 });
circleCodeSchema.index({ region: 1 });

module.exports = mongoose.model('CircleCode', circleCodeSchema); 