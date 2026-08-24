const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const forge = require("node-forge");
const CryptoJS = require("node-cryptojs-aes").CryptoJS;

const request = require("request");
const express = require("express");
const app = express();

const entity = "TCSLINGNEO";

const m2p_pubkey = fs.readFileSync(
  path.join("./keys/", "m2psolutions_pub.cer")
);
const hp_pvt_key = fs.readFileSync(path.join("./keys/", "slingneo.p8"));

function generateKey() {
  return crypto.randomBytes(32);
}

function encryptData(requestData, sessionKey, messageRefNo) {
  const cipher = crypto.createCipheriv("aes-256-gcm", sessionKey, messageRefNo);
  let encrypted = cipher.update(requestData, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  const cipherText = Buffer.from(encrypted + authTag, "hex");
  return cipherText.toString("base64");
}

function generateMessageRefNo() {
  let digits = "";
  digits += Math.floor(Math.random() * 9) + 1;
  for (let i = 1; i < 16; i++) {
    digits += Math.floor(Math.random() * 10);
  }
  return digits;
}

function generateDigitalSignedToken(requestData) {
  const sign = crypto.createSign("SHA256");
  sign.update(requestData);
  sign.end();
  const signature = sign.sign({
    key: hp_pvt_key,
    type: "pkcs8",
    format: "der",
  });
  return signature.toString("base64");
}

function generateEntity(entityId) {
  const publickey = forge.pki.publicKeyFromPem(m2p_pubkey.toString("binary"));
  const encrypted = publickey.encrypt(entityId.toString("binary"), "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  return Buffer.from(encrypted, "binary").toString("base64");
}

function generateSymmetricKey(symKey) {
  const publickey = forge.pki.publicKeyFromPem(m2p_pubkey.toString("binary"));
  const encrypted = publickey.encrypt(symKey.toString("binary"), "RSA-OAEP", {
    md: forge.md.sha256.create(),
    mgf1: {
      md: forge.md.sha256.create(),
    },
  });
  return Buffer.from(encrypted, "binary").toString("base64");
}

function encryptionData(jsonData) {
  var symmetricKey = generateKey();
  var genRefNo = generateMessageRefNo();
  var reqbody = {
    token: generateDigitalSignedToken(JSON.stringify(jsonData)),
    body: encryptData(
      JSON.stringify(jsonData),
      symmetricKey,
      Buffer.from(genRefNo)
    ),
    key: generateSymmetricKey(symmetricKey),
    entity: generateEntity(Buffer.from(entity)),
    refNo: genRefNo,
  };
  return reqbody;
}

module.exports = {
  encryptionData,
};
