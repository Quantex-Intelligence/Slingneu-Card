const mongoose = require('mongoose');

const operatorSchema = new mongoose.Schema({
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
    category: {
        type: String,
        required: true,
        enum: ['mobile', 'dth', 'postpaid', 'electricity', 'gas', 'insurance', 'datacard', 'fastag', 'other'],
        default: 'mobile'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    description: {
        type: String,
        trim: true
    },
    commission: {
        type: Number,
        default: 0,
        min: 0
    },
    minAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    maxAmount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
operatorSchema.index({ code: 1 });
operatorSchema.index({ category: 1 });
operatorSchema.index({ isActive: 1 });

module.exports = mongoose.model('Operator', operatorSchema); 