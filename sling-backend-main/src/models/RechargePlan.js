const mongoose = require('mongoose');

const rechargePlanSchema = new mongoose.Schema({
    planId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    operatorCode: {
        type: String,
        required: true,
        trim: true
    },
    operatorName: {
        type: String,
        required: true,
        trim: true
    },
    planType: {
        type: String,
        required: true,
        enum: ['prepaid', 'postpaid', 'dth', 'electricity', 'gas', 'insurance', 'datacard', 'fastag', 'other'],
        default: 'prepaid'
    },
    planCategory: {
        type: String,
        required: true,
        enum: ['voice', 'data', 'combo', 'sms', 'roaming', 'international', 'special', 'topup', 'recharge', 'bill_payment'],
        default: 'recharge'
    },
    planName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    validity: {
        type: Number, // in days
        required: true,
        min: 0
    },
    validityType: {
        type: String,
        enum: ['days', 'months', 'years'],
        default: 'days'
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    talktime: {
        type: Number, // in minutes
        default: 0,
        min: 0
    },
    data: {
        type: Number, // in MB/GB
        default: 0,
        min: 0
    },
    dataUnit: {
        type: String,
        enum: ['MB', 'GB', 'TB'],
        default: 'MB'
    },
    sms: {
        type: Number,
        default: 0,
        min: 0
    },
    features: [{
        type: String,
        trim: true
    }],
    benefits: [{
        type: String,
        trim: true
    }],
    isPopular: {
        type: Boolean,
        default: false
    },
    isBestSeller: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isSpecialOffer: {
        type: Boolean,
        default: false
    },
    offerDescription: {
        type: String,
        trim: true
    },
    offerValidTill: {
        type: Date
    },
    commission: {
        type: Number,
        default: 0,
        min: 0
    },
    commissionType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
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
    },
    terms: [{
        type: String,
        trim: true
    }],
    conditions: [{
        type: String,
        trim: true
    }],
    tags: [{
        type: String,
        trim: true
    }],
    priority: {
        type: Number,
        default: 0,
        min: 0
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for efficient queries
rechargePlanSchema.index({ planId: 1 });
rechargePlanSchema.index({ operatorCode: 1 });
rechargePlanSchema.index({ circleCode: 1 });
rechargePlanSchema.index({ planType: 1 });
rechargePlanSchema.index({ planCategory: 1 });
rechargePlanSchema.index({ isActive: 1 });
rechargePlanSchema.index({ isPopular: 1 });
rechargePlanSchema.index({ isBestSeller: 1 });
rechargePlanSchema.index({ amount: 1 });
rechargePlanSchema.index({ validity: 1 });
rechargePlanSchema.index({ operatorCode: 1, circleCode: 1 });
rechargePlanSchema.index({ operatorCode: 1, circleCode: 1, isActive: 1 });

// Virtual for formatted data
rechargePlanSchema.virtual('formattedData').get(function() {
    if (this.dataUnit === 'GB') {
        return `${this.data} GB`;
    } else if (this.dataUnit === 'TB') {
        return `${this.data} TB`;
    } else {
        return `${this.data} MB`;
    }
});

// Virtual for formatted validity
rechargePlanSchema.virtual('formattedValidity').get(function() {
    if (this.validityType === 'months') {
        return `${this.validity} months`;
    } else if (this.validityType === 'years') {
        return `${this.validity} years`;
    } else {
        return `${this.validity} days`;
    }
});

// Method to get formatted response
rechargePlanSchema.methods.getFormattedResponse = function() {
    return {
        planId: this.planId,
        operatorCode: this.operatorCode,
        operatorName: this.operatorName,
        circleCode: this.circleCode,
        circleName: this.circleName,
        planType: this.planType,
        planCategory: this.planCategory,
        planName: this.planName,
        description: this.description,
        validity: this.validity,
        validityType: this.validityType,
        formattedValidity: this.formattedValidity,
        amount: this.amount,
        talktime: this.talktime,
        data: this.data,
        dataUnit: this.dataUnit,
        formattedData: this.formattedData,
        sms: this.sms,
        features: this.features,
        benefits: this.benefits,
        isPopular: this.isPopular,
        isBestSeller: this.isBestSeller,
        isActive: this.isActive,
        isSpecialOffer: this.isSpecialOffer,
        offerDescription: this.offerDescription,
        offerValidTill: this.offerValidTill,
        commission: this.commission,
        commissionType: this.commissionType,
        minAmount: this.minAmount,
        maxAmount: this.maxAmount,
        terms: this.terms,
        conditions: this.conditions,
        tags: this.tags,
        priority: this.priority,
        sortOrder: this.sortOrder,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

module.exports = mongoose.model('RechargePlan', rechargePlanSchema); 