const mongoose = require('mongoose');

const rechargeTransactionSchema = new mongoose.Schema({
    transactionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    orderId: {
        type: String,
        required: true,
        index: true
    },
    circleCode: {
        type: String,
        required: true
    },
    operatorCode: {
        type: String,
        required: true
    },
    number: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'SUCCESS', 'FAILED', 'PROCESSING'],
        default: 'PENDING'
    },
    operatorId: {
        type: String,
        default: null
    },
    format: {
        type: String,
        enum: ['json', 'csv', 'xml'],
        default: 'json'
    },
    value1: {
        type: String,
        default: null
    },
    value2: {
        type: String,
        default: null
    },
    response: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    lastChecked: {
        type: Date,
        default: Date.now
    },
    callbackUrl: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes for better query performance
rechargeTransactionSchema.index({ createdAt: -1 });
rechargeTransactionSchema.index({ status: 1 });
rechargeTransactionSchema.index({ userId: 1 });
rechargeTransactionSchema.index({ operatorCode: 1 });

// Virtual for formatted amount
rechargeTransactionSchema.virtual('formattedAmount').get(function() {
    return `₹${this.amount}`;
});

// Virtual for service type based on operator code
rechargeTransactionSchema.virtual('serviceType').get(function() {
    const mobileCodes = ['A', 'V', 'BT', 'RC', 'I', 'BR'];
    const dthCodes = ['ATV', 'STV', 'TTV', 'VTV', 'DTV'];
    const postpaidCodes = ['PAT', 'IP', 'VP', 'DP', 'BP', 'LBS', 'LMT', 'LAT', 'JPP'];
    const electricityCodes = ['NBE', 'JBVNL', 'APDCLR', 'MESCOMR', 'APDCLN', 'MESCOMNR', 'BSES', 'BSESY', 'TPD', 'TPDM', 'HESCOM', 'SBE', 'BEST', 'AJV', 'BESCOM', 'CESC', 'JVV', 'JDVV', 'MKV', 'MSEDC', 'NP', 'PKV', 'SPA', 'SPT', 'TRP', 'APCPDCL', 'ARPDOP', 'WESCO', 'PGVCL', 'BHES', 'MVV', 'MGVCL', 'MEPDCL', 'KEDL', 'DGVCL', 'WBSEDCL', 'SNDL', 'BESL', 'IPWB', 'BMESTU', 'APEPDCL', 'TNEB', 'UPPCLU', 'UPPCLR', 'DHBVN', 'TSNPDCL', 'DDCL', 'GESCL', 'IPCL', 'JUSCL', 'CSPDCL', 'GOAELC', 'UGVCL', 'TORRENTSUR', 'TORRENTAHM', 'GPCL', 'HPSEBL', 'JKPDD', 'CESCOM', 'NDPL', 'MCG', 'PSPCL', 'TSECL', 'UHBV', 'UKPCL', 'KSEB', 'KDHPCPL', 'LED', 'MPPKVVCLPU', 'MPPKVVCLMR', 'MPPKVVCL', 'RELIANCE', 'TORRENTSHI', 'TORRENTBHI', 'AEML', 'MSPDCLPR', 'MPED', 'NDOP', 'NDMC', 'NESCO', 'SOUTHCO', 'TPCODL', 'PGPED', 'TPADL', 'SPR', 'SPU', 'KESCO', 'TORRENTDAH'];
    const gasCodes = ['MG', 'AG', 'GG', 'IG', 'HPCLGC'];
    const insuranceCodes = ['ICP', 'TAI'];
    const datacardCodes = ['RNET', 'RNET3', 'RNETP', 'TPW', 'TPP', 'MTM', 'MTBR'];
    const fastagCodes = ['JKF', 'KMF', 'INDF', 'IHMCF', 'IFF', 'ICF', 'HDF', 'EFF', 'BBF', 'AXF', 'FDF', 'PTF', 'APB', 'IBF', 'SBF'];
    const otherCodes = ['GLF', 'BS', 'MTR', 'MTT', 'RI', 'IMPS', 'PMF'];

    if (mobileCodes.includes(this.operatorCode)) return 'mobile';
    if (dthCodes.includes(this.operatorCode)) return 'dth';
    if (postpaidCodes.includes(this.operatorCode)) return 'postpaid';
    if (electricityCodes.includes(this.operatorCode)) return 'electricity';
    if (gasCodes.includes(this.operatorCode)) return 'gas';
    if (insuranceCodes.includes(this.operatorCode)) return 'insurance';
    if (datacardCodes.includes(this.operatorCode)) return 'datacard';
    if (fastagCodes.includes(this.operatorCode)) return 'fastag';
    if (otherCodes.includes(this.operatorCode)) return 'other';
    
    return 'unknown';
});

// Method to update status
rechargeTransactionSchema.methods.updateStatus = function(newStatus, operatorId = null) {
    this.status = newStatus;
    if (operatorId) {
        this.operatorId = operatorId;
    }
    this.lastChecked = new Date();
    return this.save();
};

// Method to get formatted response
rechargeTransactionSchema.methods.getFormattedResponse = function() {
    return {
        transactionId: this.transactionId,
        orderId: this.orderId,
        circleCode: this.circleCode,
        operatorCode: this.operatorCode,
        number: this.number,
        amount: this.amount,
        formattedAmount: this.formattedAmount,
        status: this.status,
        operatorId: this.operatorId,
        serviceType: this.serviceType,
        format: this.format,
        value1: this.value1,
        value2: this.value2,
        response: this.response,
        lastChecked: this.lastChecked,
        callbackUrl: this.callbackUrl,
        userId: this.userId,
        metadata: this.metadata,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

// Static method to get statistics
rechargeTransactionSchema.statics.getStatistics = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    const serviceTypeStats = await this.aggregate([
        {
            $group: {
                _id: '$serviceType',
                count: { $sum: 1 },
                totalAmount: { $sum: '$amount' }
            }
        }
    ]);

    return {
        statusStats: stats,
        serviceTypeStats: serviceTypeStats
    };
};

module.exports = mongoose.model('RechargeTransaction', rechargeTransactionSchema); 