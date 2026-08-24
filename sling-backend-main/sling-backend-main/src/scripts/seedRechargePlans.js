const mongoose = require('mongoose');
const config = require('../config/config');
const RechargePlan = require('../models/RechargePlan');
const Operator = require('../models/Operator');
const CircleCode = require('../models/CircleCode');

// Sample recharge plans data
const samplePlans = [
    // Airtel Prepaid Plans
    {
        planId: 'AIR_49_28D',
        operatorCode: 'A',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Airtel Rs. 49 Plan',
        description: '28 days validity with unlimited calls and 1GB data per day',
        validity: 28,
        validityType: 'days',
        amount: 49,
        talktime: 0, // Unlimited
        data: 28, // 1GB per day for 28 days
        dataUnit: 'GB',
        sms: 100,
        features: ['Unlimited Calls', '1GB Data/Day', '100 SMS', '28 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free Wynk Music'],
        isPopular: true,
        isActive: true,
        commission: 2.5,
        commissionType: 'percentage',
        tags: ['airtel', 'prepaid', 'combo', 'popular'],
        priority: 10,
        sortOrder: 1
    },
    {
        planId: 'AIR_99_56D',
        operatorCode: 'A',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Airtel Rs. 99 Plan',
        description: '56 days validity with unlimited calls and 2GB data per day',
        validity: 56,
        validityType: 'days',
        amount: 99,
        talktime: 0, // Unlimited
        data: 112, // 2GB per day for 56 days
        dataUnit: 'GB',
        sms: 300,
        features: ['Unlimited Calls', '2GB Data/Day', '300 SMS', '56 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free Wynk Music', 'Free Disney+ Hotstar'],
        isBestSeller: true,
        isActive: true,
        commission: 3.0,
        commissionType: 'percentage',
        tags: ['airtel', 'prepaid', 'combo', 'bestseller'],
        priority: 15,
        sortOrder: 2
    },
    {
        planId: 'AIR_199_84D',
        operatorCode: 'A',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Airtel Rs. 199 Plan',
        description: '84 days validity with unlimited calls and 3GB data per day',
        validity: 84,
        validityType: 'days',
        amount: 199,
        talktime: 0, // Unlimited
        data: 252, // 3GB per day for 84 days
        dataUnit: 'GB',
        sms: 500,
        features: ['Unlimited Calls', '3GB Data/Day', '500 SMS', '84 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free Wynk Music', 'Free Disney+ Hotstar', 'Free Zee5'],
        isActive: true,
        commission: 3.5,
        commissionType: 'percentage',
        tags: ['airtel', 'prepaid', 'combo'],
        priority: 5,
        sortOrder: 3
    },

    // Jio Prepaid Plans
    {
        planId: 'JIO_49_28D',
        operatorCode: 'RC',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Jio Rs. 49 Plan',
        description: '28 days validity with unlimited calls and 1GB data per day',
        validity: 28,
        validityType: 'days',
        amount: 49,
        talktime: 0, // Unlimited
        data: 28, // 1GB per day for 28 days
        dataUnit: 'GB',
        sms: 100,
        features: ['Unlimited Calls', '1GB Data/Day', '100 SMS', '28 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free JioCinema', 'Free JioTV'],
        isPopular: true,
        isActive: true,
        commission: 2.0,
        commissionType: 'percentage',
        tags: ['jio', 'prepaid', 'combo', 'popular'],
        priority: 12,
        sortOrder: 4
    },
    {
        planId: 'JIO_99_56D',
        operatorCode: 'RC',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Jio Rs. 99 Plan',
        description: '56 days validity with unlimited calls and 2GB data per day',
        validity: 56,
        validityType: 'days',
        amount: 99,
        talktime: 0, // Unlimited
        data: 112, // 2GB per day for 56 days
        dataUnit: 'GB',
        sms: 300,
        features: ['Unlimited Calls', '2GB Data/Day', '300 SMS', '56 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free JioCinema', 'Free JioTV', 'Free Disney+ Hotstar'],
        isBestSeller: true,
        isActive: true,
        commission: 2.5,
        commissionType: 'percentage',
        tags: ['jio', 'prepaid', 'combo', 'bestseller'],
        priority: 18,
        sortOrder: 5
    },

    // Vodafone Prepaid Plans
    {
        planId: 'VOD_49_28D',
        operatorCode: 'V',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Vodafone Rs. 49 Plan',
        description: '28 days validity with unlimited calls and 1GB data per day',
        validity: 28,
        validityType: 'days',
        amount: 49,
        talktime: 0, // Unlimited
        data: 28, // 1GB per day for 28 days
        dataUnit: 'GB',
        sms: 100,
        features: ['Unlimited Calls', '1GB Data/Day', '100 SMS', '28 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free Vodafone Play'],
        isActive: true,
        commission: 2.8,
        commissionType: 'percentage',
        tags: ['vodafone', 'prepaid', 'combo'],
        priority: 8,
        sortOrder: 6
    },

    // Special Offers
    {
        planId: 'AIR_SPECIAL_79',
        operatorCode: 'A',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Airtel Special Rs. 79 Plan',
        description: 'Special offer: 40 days validity with unlimited calls and 1.5GB data per day',
        validity: 40,
        validityType: 'days',
        amount: 79,
        talktime: 0, // Unlimited
        data: 60, // 1.5GB per day for 40 days
        dataUnit: 'GB',
        sms: 200,
        features: ['Unlimited Calls', '1.5GB Data/Day', '200 SMS', '40 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free Wynk Music'],
        isSpecialOffer: true,
        isActive: true,
        offerDescription: 'Limited time offer! Get extra 12 days validity',
        offerValidTill: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        commission: 3.2,
        commissionType: 'percentage',
        tags: ['airtel', 'prepaid', 'combo', 'special', 'offer'],
        priority: 20,
        sortOrder: 7
    },

    // Data Only Plans
    {
        planId: 'JIO_DATA_19',
        operatorCode: 'RC',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'data',
        planName: 'Jio Data Rs. 19 Plan',
        description: 'Data only plan with 1GB data for 1 day',
        validity: 1,
        validityType: 'days',
        amount: 19,
        talktime: 0,
        data: 1,
        dataUnit: 'GB',
        sms: 0,
        features: ['1GB Data', '1 Day Validity'],
        benefits: ['High Speed Data'],
        isActive: true,
        commission: 1.5,
        commissionType: 'percentage',
        tags: ['jio', 'prepaid', 'data'],
        priority: 3,
        sortOrder: 8
    },

    // Voice Only Plans
    {
        planId: 'AIR_VOICE_23',
        operatorCode: 'A',
        circleCode: '5', // Delhi
        planType: 'prepaid',
        planCategory: 'voice',
        planName: 'Airtel Voice Rs. 23 Plan',
        description: 'Voice only plan with unlimited calls for 1 day',
        validity: 1,
        validityType: 'days',
        amount: 23,
        talktime: 0, // Unlimited
        data: 0,
        dataUnit: 'MB',
        sms: 0,
        features: ['Unlimited Calls', '1 Day Validity'],
        benefits: ['Unlimited Local Calls'],
        isActive: true,
        commission: 2.0,
        commissionType: 'percentage',
        tags: ['airtel', 'prepaid', 'voice'],
        priority: 2,
        sortOrder: 9
    },

    // Mumbai Plans
    {
        planId: 'AIR_49_MUM_28D',
        operatorCode: 'A',
        circleCode: '3', // Mumbai
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Airtel Rs. 49 Plan - Mumbai',
        description: '28 days validity with unlimited calls and 1GB data per day',
        validity: 28,
        validityType: 'days',
        amount: 49,
        talktime: 0, // Unlimited
        data: 28, // 1GB per day for 28 days
        dataUnit: 'GB',
        sms: 100,
        features: ['Unlimited Calls', '1GB Data/Day', '100 SMS', '28 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free Wynk Music'],
        isPopular: true,
        isActive: true,
        commission: 2.5,
        commissionType: 'percentage',
        tags: ['airtel', 'prepaid', 'combo', 'popular', 'mumbai'],
        priority: 10,
        sortOrder: 10
    },

    // Karnataka Plans
    {
        planId: 'JIO_49_KA_28D',
        operatorCode: 'RC',
        circleCode: '9', // Karnataka
        planType: 'prepaid',
        planCategory: 'combo',
        planName: 'Jio Rs. 49 Plan - Karnataka',
        description: '28 days validity with unlimited calls and 1GB data per day',
        validity: 28,
        validityType: 'days',
        amount: 49,
        talktime: 0, // Unlimited
        data: 28, // 1GB per day for 28 days
        dataUnit: 'GB',
        sms: 100,
        features: ['Unlimited Calls', '1GB Data/Day', '100 SMS', '28 Days Validity'],
        benefits: ['Free Netflix', 'Free Amazon Prime', 'Free JioCinema', 'Free JioTV'],
        isActive: true,
        commission: 2.0,
        commissionType: 'percentage',
        tags: ['jio', 'prepaid', 'combo', 'karnataka'],
        priority: 6,
        sortOrder: 11
    }
];

async function seedRechargePlans() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongodb.uri);
        console.log('Connected to MongoDB');

        // Check if operators and circle codes exist
        const operatorCount = await Operator.countDocuments();
        const circleCodeCount = await CircleCode.countDocuments();

        if (operatorCount === 0) {
            console.log('Please run "npm run seed" first to populate operators and circle codes');
            process.exit(1);
        }

        if (circleCodeCount === 0) {
            console.log('Please run "npm run seed" first to populate operators and circle codes');
            process.exit(1);
        }

        // Clear existing plans
        await RechargePlan.deleteMany({});
        console.log('Cleared existing recharge plans');

        // Insert plans
        const plans = await RechargePlan.insertMany(samplePlans);
        console.log(`Inserted ${plans.length} recharge plans`);

        console.log('Recharge plans seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding recharge plans:', error);
        process.exit(1);
    }
}

// Run the seeding function
seedRechargePlans(); 