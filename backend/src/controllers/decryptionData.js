const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const forge = require("node-forge");
const CryptoJS = require("node-cryptojs-aes").CryptoJS;
const NodeRSA = require('node-rsa');
const express = require("express");
const app = express();

let hp_pvt_key = Buffer.from("");

try {
  const keysDir = path.join(__dirname, "../../keys");
  const pvtPath = path.join(keysDir, "slingneo.p8");

  if (fs.existsSync(pvtPath)) {
    hp_pvt_key = fs.readFileSync(pvtPath, "hex");
  } else if (fs.existsSync("./keys/slingneo.p8")) {
    hp_pvt_key = fs.readFileSync("./keys/slingneo.p8", "hex");
  }
} catch (err) {
  console.warn("⚠️ Decryption key load notice:", err.message);
}


function decryptData(encryptedData, sessionKey, messageRefNo) {
    // convert base64-encoded string back to buffer
    const encryptedBuffer = Buffer.from(encryptedData, "base64");
    
    // split encrypted data and authentication tag
    const data = encryptedBuffer
    .subarray(0, encryptedBuffer.length - 16)
    .toString("hex");
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
    
    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        sessionKey,
        messageRefNo
        );
        decipher.setAuthTag(authTag);
        let decrypted = decipher.update(data, "hex", "utf8");
        decrypted += decipher.final("utf8");
  return decrypted;
}

function decryptKey(encryptedKey) {
    const key = new NodeRSA();
    key.importKey(Buffer.from(hp_pvt_key, 'hex'), 'pkcs8-private-der');
    const privateKey1 = key.exportKey();

  const privateKey = forge.pki.privateKeyFromPem(privateKey1);
  const decryptedKey = privateKey.decrypt(forge.util.decode64(encryptedKey), "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  return Buffer.from(forge.util.bytesToHex(decryptedKey), "hex");
}


  function decryptionData (response){
    response=JSON.parse(response);
    console.log("response",response)
    const symmkey = decryptKey(response.headers.key);
    console.log("decrypt response ",decryptData(response.body, symmkey, Buffer.from(response.headers.refNo)))
    console.log("-----------------reqeust end---------------------");
    return(decryptData(response.body, symmkey, Buffer.from(response.headers.refNo)));
  }

module.exports = {
   
  decryptionData
};
