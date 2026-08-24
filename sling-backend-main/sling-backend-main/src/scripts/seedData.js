const mongoose = require('mongoose');
const config = require('../config/config');
const Operator = require('../models/Operator');
const CircleCode = require('../models/CircleCode');

// Initial operators data
const operatorsData = [
    // Mobile operators
    { code: 'A', name: 'Airtel', category: 'mobile', isActive: true },
    { code: 'V', name: 'Vodafone', category: 'mobile', isActive: true },
    { code: 'BT', name: 'BSNL - TOPUP', category: 'mobile', isActive: true },
    { code: 'RC', name: 'RELIANCE - JIO', category: 'mobile', isActive: true },
    { code: 'I', name: 'Idea', category: 'mobile', isActive: true },
    { code: 'BR', name: 'BSNL - STV', category: 'mobile', isActive: true },
    
    // DTH operators
    { code: 'ATV', name: 'Airtel Digital DTH TV', category: 'dth', isActive: true },
    { code: 'STV', name: 'SUNDIRECT DTH TV', category: 'dth', isActive: true },
    { code: 'TTV', name: 'TATASKY DTH TV', category: 'dth', isActive: true },
    { code: 'VTV', name: 'VIDEOCON DTH TV', category: 'dth', isActive: true },
    { code: 'DTV', name: 'DISH TV', category: 'dth', isActive: true },
    
    // Postpaid operators
    { code: 'PAT', name: 'Airtel Postpaid', category: 'postpaid', isActive: true },
    { code: 'IP', name: 'Idea Postpaid', category: 'postpaid', isActive: true },
    { code: 'VP', name: 'Vodafone Postpaid', category: 'postpaid', isActive: true },
    { code: 'DP', name: 'Tata Docomo Postpaid', category: 'postpaid', isActive: true },
    { code: 'BP', name: 'BSNL Postpaid', category: 'postpaid', isActive: true },
    { code: 'LBS', name: 'Bsnl Landline', category: 'postpaid', isActive: true },
    { code: 'LMT', name: 'MTNL Delhi Landline', category: 'postpaid', isActive: true },
    { code: 'LAT', name: 'Airtel Landline', category: 'postpaid', isActive: true },
    { code: 'JPP', name: 'JIO POSTPAID', category: 'postpaid', isActive: true },
    
    // Electricity operators
    { code: 'NBE', name: 'North Bihar Electricity', category: 'electricity', isActive: true },
    { code: 'JBVNL', name: 'JBVNL - JHARKHAND', category: 'electricity', isActive: true },
    { code: 'APDCLR', name: 'Assam Power Distribution Company Ltd (RAPDR)', category: 'electricity', isActive: true },
    { code: 'MESCOMR', name: 'Mangalore Electricity Supply Co. Ltd (MESCOM) - RAPDR', category: 'electricity', isActive: true },
    { code: 'APDCLN', name: 'APDCL (Non-RAPDR) - ASSAM', category: 'electricity', isActive: true },
    { code: 'MESCOMNR', name: 'Mangalore Electricity Supply Co. Ltd (Non) - RAPDR', category: 'electricity', isActive: true },
    { code: 'BSES', name: 'BSES Rajdhani Power Limited - Delhi', category: 'electricity', isActive: true },
    { code: 'BSESY', name: 'BSES Yamuna Power Limited - Delhi', category: 'electricity', isActive: true },
    { code: 'TPD', name: 'Tata Power Delhi Limited - Delhi', category: 'electricity', isActive: true },
    { code: 'TPDM', name: 'Tata Power - MUMBAI', category: 'electricity', isActive: true },
    { code: 'HESCOM', name: 'Hubli Electricity Supply Company Ltd. (HESCOM)', category: 'electricity', isActive: true },
    { code: 'SBE', name: 'South Bihar Electricity', category: 'electricity', isActive: true },
    { code: 'BEST', name: 'BEST Mumbai', category: 'electricity', isActive: true },
    { code: 'AJV', name: 'Ajmer Vidyut Vitran Nigam - RAJASTHAN', category: 'electricity', isActive: true },
    { code: 'BESCOM', name: 'Bangalore ElectricitySupply Company', category: 'electricity', isActive: true },
    { code: 'CESC', name: 'CESC - WEST BENGAL', category: 'electricity', isActive: true },
    { code: 'JVV', name: 'Jaipur Vidyut Vitran Nigam - RAJASTHAN', category: 'electricity', isActive: true },
    { code: 'JDVV', name: 'Jodhpur Vidyut Vitran Nigam - RAJASTHAN', category: 'electricity', isActive: true },
    { code: 'MKV', name: 'MP Madhaya Kshetra Vidyut Vitaran -Urban', category: 'electricity', isActive: true },
    { code: 'MSEDC', name: 'MSEDC - MAHARASHTRA', category: 'electricity', isActive: true },
    { code: 'NP', name: 'Noida Power - NOIDA', category: 'electricity', isActive: true },
    { code: 'PKV', name: 'Paschim Kshetra Vitaran - MADHYA PRADESH', category: 'electricity', isActive: true },
    { code: 'SPA', name: 'Southern Power - ANDHRA PRADESH', category: 'electricity', isActive: true },
    { code: 'SPT', name: 'Southern Power - TELANGANA', category: 'electricity', isActive: true },
    { code: 'TRP', name: 'Torrent Power agra', category: 'electricity', isActive: true },
    { code: 'APCPDCL', name: 'Central Power Distribution Company of Andhra Pradesh Ltd', category: 'electricity', isActive: true },
    { code: 'ARPDOP', name: 'Department of Power Arunachal Pradesh', category: 'electricity', isActive: true },
    { code: 'WESCO', name: 'Western Electricity supply co. Of orissa ltd.', category: 'electricity', isActive: true },
    { code: 'PGVCL', name: 'Paschim Gujarat Vij Company Ltd', category: 'electricity', isActive: true },
    { code: 'BHES', name: 'BharatpurElectricityServicesLtd', category: 'electricity', isActive: true },
    { code: 'MVV', name: 'Muzaffarpur Vidyut Vitran', category: 'electricity', isActive: true },
    { code: 'MGVCL', name: 'Madhya Gujarat Vij Company Ltd', category: 'electricity', isActive: true },
    { code: 'MEPDCL', name: 'MEPDCL - MEGHALAYA', category: 'electricity', isActive: true },
    { code: 'KEDL', name: 'KEDL - KOTA', category: 'electricity', isActive: true },
    { code: 'DGVCL', name: 'Dakshin Gujarat Vij Company Ltd', category: 'electricity', isActive: true },
    { code: 'WBSEDCL', name: 'WBSEDCL - WEST BENGAL', category: 'electricity', isActive: true },
    { code: 'SNDL', name: 'SNDL Power - NAGPUR', category: 'electricity', isActive: true },
    { code: 'BESL', name: 'Bikaner Electricity Supply Limited', category: 'electricity', isActive: true },
    { code: 'IPWB', name: 'India Power - WEST BENGAL', category: 'electricity', isActive: true },
    { code: 'BMESTU', name: 'BrihanMumbaiElectricSupplyandTransportUndertaking', category: 'electricity', isActive: true },
    { code: 'APEPDCL', name: 'APEPDCL - ANDHRA PRADESH', category: 'electricity', isActive: true },
    { code: 'TNEB', name: 'TNEB - TAMIL NADU', category: 'electricity', isActive: true },
    { code: 'UPPCLU', name: 'UPPCL (URBAN) - UTTAR PRADESH', category: 'electricity', isActive: true },
    { code: 'UPPCLR', name: 'Uttar Pradesh Power Corporation Limited(Rular)', category: 'electricity', isActive: true },
    { code: 'DHBVN', name: 'DakshinHaryanaBijliVitranNigam', category: 'electricity', isActive: true },
    { code: 'TSNPDCL', name: 'TSNPDCL Telangana northern power', category: 'electricity', isActive: true },
    { code: 'DDCL', name: 'DNHPowerDistributionCompanyLimited', category: 'electricity', isActive: true },
    { code: 'GESCL', name: 'GulbargaElectricitySupplyCompanyLimited', category: 'electricity', isActive: true },
    { code: 'IPCL', name: 'IndiaPowerCorporationLimited', category: 'electricity', isActive: true },
    { code: 'JUSCL', name: 'JamshedpurUtilitiesandServicesCompanyLimited', category: 'electricity', isActive: true },
    { code: 'CSPDCL', name: 'Chhattisgarh State Power Distribution Company Ltd. (CSPDCL)', category: 'electricity', isActive: true },
    { code: 'GOAELC', name: 'Goa Electricity', category: 'electricity', isActive: true },
    { code: 'UGVCL', name: 'UttarGujarat Vij Company Ltd', category: 'electricity', isActive: true },
    { code: 'TORRENTSUR', name: 'Torrent Power Surat', category: 'electricity', isActive: true },
    { code: 'TORRENTAHM', name: 'Torrent Power Ahemdabad', category: 'electricity', isActive: true },
    { code: 'GPCL', name: 'Gift Power Company Limited', category: 'electricity', isActive: true },
    { code: 'HPSEBL', name: 'Himachal Pradesh State Electricity Board Ltd', category: 'electricity', isActive: true },
    { code: 'JKPDD', name: 'Jammu & Kashmir power Development department', category: 'electricity', isActive: true },
    { code: 'CESCOM', name: 'Chamundeshwari Electricity Supply Corporation Ltd. (Cesc,Mysore)', category: 'electricity', isActive: true },
    { code: 'NDPL', name: 'NorthDelhiPowerLimited', category: 'electricity', isActive: true },
    { code: 'MCG', name: 'MUNICIPALCORPORATIONOFGURUGRAM', category: 'electricity', isActive: true },
    { code: 'PSPCL', name: 'Punjab State Power Corporation Limted', category: 'electricity', isActive: true },
    { code: 'TSECL', name: 'TripuraStateElectricityCorporationLtd', category: 'electricity', isActive: true },
    { code: 'UHBV', name: 'UttarHaryanaBijliVitranNigam', category: 'electricity', isActive: true },
    { code: 'UKPCL', name: 'UttarakhandPowerCorporationLimited', category: 'electricity', isActive: true },
    { code: 'KSEB', name: 'Kerala State Electricity Board Ltd.', category: 'electricity', isActive: true },
    { code: 'KDHPCPL', name: 'kannan devan hills power', category: 'electricity', isActive: true },
    { code: 'LED', name: 'Lakshadweep Electricity Department', category: 'electricity', isActive: true },
    { code: 'MPPKVVCLPU', name: 'MP Poorv Kshetra Vidyut Vitaran - Jabalpur', category: 'electricity', isActive: true },
    { code: 'MPPKVVCLMR', name: 'Madhya Pradesh Poorv Kshetra Vidyut Vitaran- RURAL', category: 'electricity', isActive: true },
    { code: 'MPPKVVCL', name: 'Madhya Pradesh Poorv Kshetra Vidyut Vitaran-URBAN', category: 'electricity', isActive: true },
    { code: 'RELIANCE', name: 'Reliance Energy', category: 'electricity', isActive: true },
    { code: 'TORRENTSHI', name: 'Torrent Power SHIL', category: 'electricity', isActive: true },
    { code: 'TORRENTBHI', name: 'Torrent Power Bhivandi', category: 'electricity', isActive: true },
    { code: 'AEML', name: 'Adani power', category: 'electricity', isActive: true },
    { code: 'MSPDCLPR', name: 'Manipur State Power Distribution Company Limited (Prepaid)', category: 'electricity', isActive: true },
    { code: 'MPED', name: 'Power & Electricity Department - Mizoram', category: 'electricity', isActive: true },
    { code: 'NDOP', name: 'Department of Power, Nagaland', category: 'electricity', isActive: true },
    { code: 'NDMC', name: 'New Delhi Municipal Council (NDMC) - Electricity', category: 'electricity', isActive: true },
    { code: 'NESCO', name: 'NESCO Odisha', category: 'electricity', isActive: true },
    { code: 'SOUTHCO', name: 'SOUTHCO Odisha', category: 'electricity', isActive: true },
    { code: 'TPCODL', name: 'TP central odisha distribution limited', category: 'electricity', isActive: true },
    { code: 'PGPED', name: 'Government of Puducherry Electricity Department', category: 'electricity', isActive: true },
    { code: 'TPADL', name: 'TP Ajmer Distribution Ltd', category: 'electricity', isActive: true },
    { code: 'SPR', name: 'Sikkim Power Rural', category: 'electricity', isActive: true },
    { code: 'SPU', name: 'Sikkim Power Urban', category: 'electricity', isActive: true },
    { code: 'KESCO', name: 'Kanpur Electricity Supply Company', category: 'electricity', isActive: true },
    { code: 'TORRENTDAH', name: 'Torrent Power Dahej', category: 'electricity', isActive: true },
    
    // Gas operators
    { code: 'MG', name: 'Mahanagar Gas', category: 'gas', isActive: true },
    { code: 'AG', name: 'Adani Gas', category: 'gas', isActive: true },
    { code: 'GG', name: 'Gujarat Gas', category: 'gas', isActive: true },
    { code: 'IG', name: 'Indraprastha Gas', category: 'gas', isActive: true },
    { code: 'HPCLGC', name: 'Hindustan Petroleum Corporation Ltd', category: 'gas', isActive: true },
    
    // Insurance operators
    { code: 'ICP', name: 'ICICI Prudential Insurance', category: 'insurance', isActive: true },
    { code: 'TAI', name: 'Tata AIA Insurance', category: 'insurance', isActive: true },
    
    // Datacard operators
    { code: 'RNET', name: 'Reliance NetConnect 1X', category: 'datacard', isActive: true },
    { code: 'RNET3', name: 'Reliance NetConnect 3G', category: 'datacard', isActive: true },
    { code: 'RNETP', name: 'Reliance NetConnect+', category: 'datacard', isActive: true },
    { code: 'TPW', name: 'Tata Photon Whiz', category: 'datacard', isActive: true },
    { code: 'TPP', name: 'Tata Photon+', category: 'datacard', isActive: true },
    { code: 'MTM', name: 'MTS Mblaze', category: 'datacard', isActive: true },
    { code: 'MTBR', name: 'MTS Mbrowse', category: 'datacard', isActive: true },
    
    // Fastag operators
    { code: 'JKF', name: 'Jammu And Kashmir Bank Fastag', category: 'fastag', isActive: true },
    { code: 'KMF', name: 'Kotak Mahindra Bank - Fastag', category: 'fastag', isActive: true },
    { code: 'INDF', name: 'Indusind Bank Fastag', category: 'fastag', isActive: true },
    { code: 'IHMCF', name: 'Indian Highways Management Company Ltd Fastag', category: 'fastag', isActive: true },
    { code: 'IFF', name: 'Idfc First Bank- Fastag', category: 'fastag', isActive: true },
    { code: 'ICF', name: 'Icici Bank Fastag', category: 'fastag', isActive: true },
    { code: 'HDF', name: 'Hdfc Bank - Fastag', category: 'fastag', isActive: true },
    { code: 'EFF', name: 'Equitas Fastag Recharge', category: 'fastag', isActive: true },
    { code: 'BBF', name: 'Bank Of Baroda - Fastag', category: 'fastag', isActive: true },
    { code: 'AXF', name: 'Axis Bank Fastag', category: 'fastag', isActive: true },
    { code: 'FDF', name: 'Federal Bank - Fastag', category: 'fastag', isActive: true },
    { code: 'PTF', name: 'Paytm Payments Bank Fastag', category: 'fastag', isActive: true },
    { code: 'APB', name: 'Airtel Payments Bank', category: 'fastag', isActive: true },
    { code: 'IBF', name: 'Idbi Bank Fastag', category: 'fastag', isActive: true },
    { code: 'SBF', name: 'Sbi Bank Fastag', category: 'fastag', isActive: true },
    
    // Other operators
    { code: 'GLF', name: 'Google Play', category: 'other', isActive: true },
    { code: 'BS', name: 'BSNL Recharge', category: 'other', isActive: true },
    { code: 'MTR', name: 'MTNL - Recharge', category: 'other', isActive: true },
    { code: 'MTT', name: 'MTNL – TOPUP', category: 'other', isActive: true },
    { code: 'RI', name: 'Idea Lapu', category: 'other', isActive: true },
    { code: 'IMPS', name: 'IMPS', category: 'other', isActive: true },
    { code: 'PMF', name: 'Paul Merchants', category: 'other', isActive: true }
];

// Initial circle codes data
const circleCodesData = [
    { code: '1', name: 'Punjab', state: 'Punjab', region: 'north', isActive: true },
    { code: '2', name: 'West Bengal', state: 'West Bengal', region: 'east', isActive: true },
    { code: '3', name: 'Mumbai', state: 'Maharashtra', region: 'west', isActive: true },
    { code: '4', name: 'Maharashtra', state: 'Maharashtra', region: 'west', isActive: true },
    { code: '5', name: 'Delhi', state: 'Delhi', region: 'north', isActive: true },
    { code: '6', name: 'Kolkata', state: 'West Bengal', region: 'east', isActive: true },
    { code: '7', name: 'CHENNAI', state: 'Tamil Nadu', region: 'south', isActive: true },
    { code: '8', name: 'Tamil Nadu', state: 'Tamil Nadu', region: 'south', isActive: true },
    { code: '9', name: 'Karnataka', state: 'Karnataka', region: 'south', isActive: true },
    { code: '10', name: 'Uttar Pradesh East', state: 'Uttar Pradesh', region: 'north', isActive: true },
    { code: '11', name: 'Uttar Pradesh West', state: 'Uttar Pradesh', region: 'north', isActive: true },
    { code: '12', name: 'Gujarat', state: 'Gujarat', region: 'west', isActive: true },
    { code: '13', name: 'Andhra Pradesh', state: 'Andhra Pradesh', region: 'south', isActive: true },
    { code: '14', name: 'Kerala', state: 'Kerala', region: 'south', isActive: true },
    { code: '16', name: 'Madhya Pradesh', state: 'Madhya Pradesh', region: 'central', isActive: true },
    { code: '17', name: 'Bihar', state: 'Bihar', region: 'east', isActive: true },
    { code: '18', name: 'Rajasthan', state: 'Rajasthan', region: 'north', isActive: true },
    { code: '20', name: 'Haryana', state: 'Haryana', region: 'north', isActive: true },
    { code: '21', name: 'Himachal Pradesh', state: 'Himachal Pradesh', region: 'north', isActive: true },
    { code: '22', name: 'Jharkhand', state: 'Jharkhand', region: 'east', isActive: true },
    { code: '23', name: 'Orissa', state: 'Odisha', region: 'east', isActive: true },
    { code: '24', name: 'Assam', state: 'Assam', region: 'northeast', isActive: true },
    { code: '25', name: 'Jammu And Kashmir', state: 'Jammu and Kashmir', region: 'north', isActive: true },
    { code: '26', name: 'NORTH EAST', state: 'North East', region: 'northeast', isActive: true },
    { code: '27', name: 'Chandigarh', state: 'Chandigarh', region: 'north', isActive: true }
];

async function seedData() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.mongodb.uri);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Operator.deleteMany({});
        await CircleCode.deleteMany({});
        console.log('Cleared existing data');

        // Insert operators
        const operators = await Operator.insertMany(operatorsData);
        console.log(`Inserted ${operators.length} operators`);

        // Insert circle codes
        const circleCodes = await CircleCode.insertMany(circleCodesData);
        console.log(`Inserted ${circleCodes.length} circle codes`);

        console.log('Data seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

// Run the seeding function
seedData(); 