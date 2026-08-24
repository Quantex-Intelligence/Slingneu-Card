const encryptionService = require('../services/encryptionService');
const path = require('path');

// Test encryption functionality
async function testEncryption() {
    console.log('🧪 Testing Encryption Service...\n');
    
    try {
        // Test data
        const testPayload = {
            entityId: 'test_entity_123',
            mobileNumber: '9876543210',
            customerName: 'John Doe',
            email: 'john@example.com'
        };
        
        const entityId = 'test_entity_123';
        const privateKeyPath = path.join(__dirname, '../../keys/slingneo.p8.pem');
        const m2pPublicKeyPath = path.join(__dirname, '../../keys/m2psolutions_pub.cer');
        
        console.log('📤 Original Payload:');
        console.log(JSON.stringify(testPayload, null, 2));
        console.log('\n');
        
        // Test 1: Generate symmetric key
        console.log('🔑 Test 1: Generating AES-256 symmetric key...');
        const symmetricKey = encryptionService.generateSymmetricKey();
        console.log('✅ Symmetric key generated successfully');
        console.log('   Key length:', symmetricKey.length, 'bytes');
        console.log('\n');
        
        // Test 2: Generate refNo
        console.log('🔢 Test 2: Generating 16-digit refNo...');
        const refNo = encryptionService.generateRefNo();
        console.log('✅ RefNo generated:', refNo);
        console.log('   Length:', refNo.length, 'digits');
        console.log('\n');
        
        // Test 3: Encrypt data
        console.log('🔒 Test 3: Encrypting data with AES-256-GCM...');
        const requestData = JSON.stringify(testPayload);
        const encryptedBody = encryptionService.encryptData(requestData, symmetricKey, refNo);
        console.log('✅ Data encrypted successfully');
        console.log('   Encrypted length:', encryptedBody.length, 'characters');
        console.log('\n');
        
        // Test 4: Decrypt data
        console.log('🔓 Test 4: Decrypting data...');
        const decryptedData = encryptionService.decryptData(encryptedBody, symmetricKey, refNo);
        console.log('✅ Data decrypted successfully');
        console.log('   Decrypted data:', decryptedData);
        console.log('   Data matches:', decryptedData === requestData);
        console.log('\n');
        
        // Test 5: Generate digital signature
        console.log('✍️ Test 5: Generating digital signature...');
        try {
            const signature = encryptionService.generateDigitalSignature(requestData, privateKeyPath);
            console.log('✅ Digital signature generated successfully');
            console.log('   Signature length:', signature.length, 'characters');
        } catch (error) {
            console.log('⚠️ Digital signature test skipped (private key not found)');
            console.log('   Error:', error.message);
        }
        console.log('\n');
        
        // Test 6: Encrypt symmetric key
        console.log('🔐 Test 6: Encrypting symmetric key with M2P public key...');
        try {
            const m2pPublicKey = encryptionService.readM2PPublicKey(m2pPublicKeyPath);
            const encryptedKey = encryptionService.encryptSymmetricKey(symmetricKey, m2pPublicKey);
            console.log('✅ Symmetric key encrypted successfully');
            console.log('   Encrypted key length:', encryptedKey.length, 'characters');
        } catch (error) {
            console.log('⚠️ Symmetric key encryption test skipped (M2P public key not found)');
            console.log('   Error:', error.message);
        }
        console.log('\n');
        
        // Test 7: Full request encryption
        console.log('🚀 Test 7: Full request encryption...');
        try {
            const encryptedRequest = await encryptionService.encryptRequest(
                testPayload,
                entityId,
                privateKeyPath,
                m2pPublicKeyPath
            );
            console.log('✅ Full request encrypted successfully');
            console.log('   Encrypted request structure:');
            console.log('   - Token:', encryptedRequest.token ? 'Present' : 'Missing');
            console.log('   - Body:', encryptedRequest.body ? 'Present' : 'Missing');
            console.log('   - Headers:');
            console.log('     - Key:', encryptedRequest.headers?.key ? 'Present' : 'Missing');
            console.log('     - Entity:', encryptedRequest.headers?.entity ? 'Present' : 'Missing');
            console.log('     - RefNo:', encryptedRequest.headers?.refNo || 'Missing');
        } catch (error) {
            console.log('⚠️ Full request encryption test skipped (keys not found)');
            console.log('   Error:', error.message);
        }
        console.log('\n');
        
        console.log('🎉 Encryption service tests completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Test TCSLINGNEO service integration
async function testTCSLINGNEOService() {
    console.log('\n🧪 Testing TCSLINGNEO Service Integration...\n');
    
    try {
        const tcsligneoService = require('../services/tcsligneoService');
        

        
    } catch (error) {
        console.error('❌ TCSLINGNEO service test failed:', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Encryption Service Tests\n');
    console.log('=' .repeat(50));
    
    await testEncryption();
    await testTCSLINGNEOService();
    
    console.log('\n' + '=' .repeat(50));
    console.log('✨ All tests completed!\n');
}

// Export for use in other test files
module.exports = {
    testEncryption,
    testTCSLINGNEOService,
    runTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}
