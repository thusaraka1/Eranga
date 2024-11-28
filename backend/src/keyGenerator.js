const NodeRSA = require('node-rsa');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const key = new NodeRSA({b: 2048});

const privateKey = key.exportKey('private');
const publicKey = key.exportKey('public');

fs.writeFileSync(path.resolve(process.env.PRIVATE_KEY_PATH), privateKey);
fs.writeFileSync(path.resolve(process.env.PUBLIC_KEY_PATH), publicKey);
console.log('Keys generated successfully.');
