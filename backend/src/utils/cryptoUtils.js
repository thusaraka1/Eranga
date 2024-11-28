const CryptoJS = require('crypto-js');
const secretKey = "qFKDR0tGwqxFhUdc3j2Zh91OOZOQiN3QGvAB4ltypniLIXz7MaDEyrcGEOkz/5rcJ5hpf9EsRepvWFgTzl/Oo6J26wcylMeQHDp8eYRWmKC7TWGJ5PPuhv+hqt2ePft7mVCkgEFf+OLnLbMxu5JwnAA868BoGo/3gUEmxg4tiePsGkUfidxW7QSOgSHRpNs2wsFuAcaLZhGqzC53tE2SWbcIi4o0o5GYWYt3juyXQd4EPfmMbGlTM29uJ8XdfecR1jpj4vcyEEj/v22+jlJBF0OnJLFTXev38LH8oV6Hhq5VxmUbLp4qA7UcIgLuKpj7htCrVY/zfOxQUoJmUlphko3JX3nri26zkIv/5QSFD4Q=";

function encryptData(data) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
}

function decryptData(encryptedData) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
}

module.exports = {
    encryptData,
    decryptData
};
