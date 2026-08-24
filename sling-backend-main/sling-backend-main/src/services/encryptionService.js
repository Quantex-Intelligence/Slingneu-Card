const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class EncryptionService {
    constructor() {
        this.symmetricAlgorithm = 'aes-256-gcm';
        this.asymmetricAlgorithm = 'RSA/ECB/OAEPWITHSHA-256ANDMGF1PADDING';
        this.digitalSignatureAlgorithm = 'SHA256withRSA';
        this.keySize = 256;
        this.refNoLength = 16;
        this.privateKeyPassphrase = process.env.PRIVATE_KEY_PASSPHRASE || null;
    }

    // Generate AES-256 symmetric key
    generateSymmetricKey() {
        try {
            const key = crypto.randomBytes(this.keySize / 8);
            return key;
        } catch (error) {
            throw new Error(`Failed to generate symmetric key: ${error.message}`);
        }
    }

    // Generate 16-digit random refNo (unique for the day)
    generateRefNo() {
        try {
            const random = crypto.randomBytes(8);
            let refNo = '';
            for (let i = 0; i < this.refNoLength; i++) {
                refNo += (random[i] % 10).toString();
            }
            return refNo;
        } catch (error) {
            throw new Error(`Failed to generate refNo: ${error.message}`);
        }
    }

    // Encrypt data using AES-256-GCM with refNo as IV
    encryptData(requestData, symmetricKey, refNo) {
        try {
            const iv = Buffer.from(refNo.padEnd(16, '0').substring(0, 16), 'hex');
            const cipher = crypto.createCipher(this.symmetricAlgorithm, symmetricKey);
            cipher.setAAD(Buffer.from(refNo));
            
            let encrypted = cipher.update(requestData, 'utf8', 'base64');
            encrypted += cipher.final('base64');
            
            return encrypted;
        } catch (error) {
            throw new Error(`Failed to encrypt data: ${error.message}`);
        }
    }

    // Decrypt data using AES-256-GCM
    decryptData(encryptedData, symmetricKey, refNo) {
        try {
            const iv = Buffer.from(refNo.padEnd(16, '0').substring(0, 16), 'hex');
            const decipher = crypto.createDecipher(this.symmetricAlgorithm, symmetricKey);
            decipher.setAAD(Buffer.from(refNo));
            
            let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
            decrypted += decipher.final('utf8');
            
            return decrypted;
        } catch (error) {
            throw new Error(`Failed to decrypt data: ${error.message}`);
        }
    }

    // Generate digital signature using private key
    generateDigitalSignature(requestData, privateKeyPath) {
        try {
            const privateKey = this.readPrivateKeyFromFile(privateKeyPath);
            const sign = crypto.createSign('RSA-SHA256');
            sign.update(requestData);
            const signature = sign.sign(privateKey, 'base64');
            return signature;
        } catch (error) {
            throw new Error(`Failed to generate digital signature: ${error.message}`);
        }
    }

    // Verify digital signature using public key
    verifyDigitalSignature(data, signature, publicKey) {
        try {
            const verify = crypto.createVerify('RSA-SHA256');
            verify.update(data);
            const isValid = verify.verify(publicKey, signature, 'base64');
            return isValid;
        } catch (error) {
            throw new Error(`Failed to verify digital signature: ${error.message}`);
        }
    }

    // Encrypt symmetric key using M2P's public key
    encryptSymmetricKey(symmetricKey, m2pPublicKey) {
        try {
            const encrypted = crypto.publicEncrypt(
                {
                    key: m2pPublicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                symmetricKey
            );
            return encrypted.toString('base64');
        } catch (error) {
            throw new Error(`Failed to encrypt symmetric key: ${error.message}`);
        }
    }

    // Decrypt symmetric key using business private key
    decryptSymmetricKey(encryptedKey, privateKeyPath) {
        try {
            const privateKey = this.readPrivateKeyFromFile(privateKeyPath);
            const decrypted = crypto.privateDecrypt(
                {
                    key: privateKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                Buffer.from(encryptedKey, 'base64')
            );
            return decrypted;
        } catch (error) {
            throw new Error(`Failed to decrypt symmetric key: ${error.message}`);
        }
    }

    // Encrypt entity ID using M2P's public key
    encryptEntityId(entityId, m2pPublicKey) {
        try {
            const encrypted = crypto.publicEncrypt(
                {
                    key: m2pPublicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                    oaepHash: 'sha256'
                },
                Buffer.from(entityId, 'utf8')
            );
            return encrypted.toString('base64');
        } catch (error) {
            throw new Error(`Failed to encrypt entity ID: ${error.message}`);
        }
    }

    // Read private key from file
    readPrivateKeyFromFile(privateKeyPath) {
        try {
            const privateKey = fs.readFileSync(privateKeyPath, 'utf8');
            
            // Check if it's an encrypted private key
            if (privateKey.includes('-----BEGIN ENCRYPTED PRIVATE KEY-----')) {
                if (!this.privateKeyPassphrase) {
                    throw new Error('Encrypted private key detected but no passphrase provided. Set PRIVATE_KEY_PASSPHRASE environment variable.');
                }
                
                // Create key object with passphrase
                const keyObject = {
                    key: privateKey,
                    passphrase: this.privateKeyPassphrase
                };
                return keyObject;
            }
            
            return privateKey;
        } catch (error) {
            throw new Error(`Failed to read private key: ${error.message}`);
        }
    }

    // Read M2P public key from file
    readM2PPublicKey(publicKeyPath) {
        try {
            const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
            return publicKey;
        } catch (error) {
            throw new Error(`Failed to read M2P public key: ${error.message}`);
        }
    }

    // Read business public key from file
    readBusinessPublicKey(publicKeyPath) {
        try {
            const publicKey = fs.readFileSync(publicKeyPath, 'utf8');
            return publicKey;
        } catch (error) {
            throw new Error(`Failed to read business public key: ${error.message}`);
        }
    }

    // Encrypt request payload according to M2P specifications
    encryptRequest(payload, entityId, privateKeyPath, m2pPublicKeyPath) {
        try {
            // Step 1: Generate symmetric key
            const symmetricKey = this.generateSymmetricKey();
            
            // Step 2: Generate refNo (IV)
            const refNo = this.generateRefNo();
            
            // Step 3: Encrypt payload using symmetric key and refNo
            const requestData = JSON.stringify(payload);
            const encryptedBody = this.encryptData(requestData, symmetricKey, refNo);
            
            // Step 4: Encrypt symmetric key using M2P's public key
            const m2pPublicKey = this.readM2PPublicKey(m2pPublicKeyPath);
            const encryptedKey = this.encryptSymmetricKey(symmetricKey, m2pPublicKey);
            
            // Step 5: Generate digital signature
            const token = this.generateDigitalSignature(requestData, privateKeyPath);
            
            // Step 6: Encrypt entity ID using M2P's public key
            const encryptedEntity = this.encryptEntityId(entityId, m2pPublicKey);
            
            // Construct encrypted request
            const encryptedRequest = {
                token: token,
                body: encryptedBody,
                headers: {
                    key: encryptedKey,
                    entity: encryptedEntity,
                    refNo: refNo
                }
            };
            
            return encryptedRequest;
        } catch (error) {
            throw new Error(`Failed to encrypt request: ${error.message}`);
        }
    }

    // Decrypt response from M2P
    decryptResponse(encryptedResponse, privateKeyPath, m2pPublicKeyPath) {
        try {
            const { body, headers } = encryptedResponse;
            const { key: encryptedKey, entity: encryptedEntity, refNo } = headers;
            
            // Step 1: Decrypt symmetric key using business private key
            const symmetricKey = this.decryptSymmetricKey(encryptedKey, privateKeyPath);
            
            // Step 2: Decrypt response data using symmetric key
            const decryptedData = this.decryptData(body, symmetricKey, refNo);
            
            // Step 3: Verify digital signature (if present)
            if (encryptedResponse.token) {
                const m2pPublicKey = this.readM2PPublicKey(m2pPublicKeyPath);
                const isValidSignature = this.verifyDigitalSignature(decryptedData, encryptedResponse.token, m2pPublicKey);
                if (!isValidSignature) {
                    throw new Error('Digital signature verification failed');
                }
            }
            
            return JSON.parse(decryptedData);
        } catch (error) {
            throw new Error(`Failed to decrypt response: ${error.message}`);
        }
    }
}

module.exports = new EncryptionService();
