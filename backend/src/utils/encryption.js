const CryptoJS = require('crypto-js');
const NodeRSA = require('node-rsa');
const fs = require('fs');
require('dotenv').config();

const privateKey = new NodeRSA(fs.readFileSync(process.env.PRIVATE_KEY_PATH));
const publicKey = new NodeRSA(fs.readFileSync(process.env.PUBLIC_KEY_PATH));

function encrypt(data) {
    const aesKey = CryptoJS.lib.WordArray.random(128/8);  // This is already a WordArray
    const iv = CryptoJS.lib.WordArray.random(128/8);      // This is also a WordArray

    // Make sure to convert aesKey to a string if using it in another context where a string is needed
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), aesKey, { iv: iv }).toString();
    const encryptedAesKey = publicKey.encrypt(aesKey.toString(CryptoJS.enc.Base64), 'base64');

    return {
        encryptedData: encryptedData,
        aesKey: encryptedAesKey,
        iv: iv.toString(CryptoJS.enc.Hex)
    };
}

function decrypt(encryptedData, encryptedAesKey, iv) {
    const aesKeyDecrypted = privateKey.decrypt(encryptedAesKey, 'utf8');
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, CryptoJS.enc.Base64.parse(aesKeyDecrypted), {
        iv: CryptoJS.enc.Hex.parse(iv)
    }).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
}

module.exports = {
    encrypt,
    decrypt
};
