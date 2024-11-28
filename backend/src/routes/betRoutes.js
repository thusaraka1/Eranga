//betRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { encrypt, decrypt } = require('../utils/encryption');
const { encryptData, decryptData } = require('../utils/cryptoUtils');
const CryptoJS = require("crypto-js");
const cors = require("cors");
const secretKey = "qFKDR0tGwqxFhUdc3j2Zh91OOZOQiN3QGvAB4ltypniLIXz7MaDEyrcGEOkz/5rcJ5hpf9EsRepvWFgTzl/Oo6J26wcylMeQHDp8eYRWmKC7TWGJ5PPuhv+hqt2ePft7mVCkgEFf+OLnLbMxu5JwnAA868BoGo/3gUEmxg4tiePsGkUfidxW7QSOgSHRpNs2wsFuAcaLZhGqzC53tE2SWbcIi4o0o5GYWYt3juyXQd4EPfmMbGlTM29uJ8XdfecR1jpj4vcyEEj/v22+jlJBF0OnJLFTXev38LH8oV6Hhq5VxmUbLp4qA7UcIgLuKpj7htCrVY/zfOxQUoJmUlphko3JX3nri26zkIv/5QSFD4Q=";
router.use(cors());

router.post('/', (req, res) => {
    console.log('req.body', req.body);
    //decrypt the data req.body req.body
    const data = decryptData(req.body.encryptedData);
    console.log('data', data);
    const { encryptedData, aesKey, iv } = encrypt(data);

    db.query('INSERT INTO bets (encrypted_data, aes_key, iv) VALUES (?, ?, ?)', [encryptedData, aesKey, iv], (err, result) => {
        if (err) return res.status(500).send(err);
        res.send({ message: 'Bet placed successfully', success: true });
    });
});

router.get('/', (req, res) => {
    let bets = [];
    db.query('SELECT * FROM bets', (err, results) => {
        if (err) return res.status(500).send(err);

        bets = results.map(bet => decrypt(bet.encrypted_data, bet.aes_key, bet.iv));

        console.log('bets', bets);

        // Initialize a counter to track completed queries
        let completedQueries = 0;

        // Match userID with user_details table USER_ID and Send NAME also as a userName
        for (let i = 0; i < bets.length; i++) {
            db.query('SELECT NAME FROM user_details WHERE USER_ID = ?', [bets[i].userId], (err, result) => {
                if (err) {
                    res.status(500).send(err);
                    return;
                }
                bets[i].userName = result.length > 0 ? CryptoJS.AES.decrypt(result[0].NAME, secretKey).toString(CryptoJS.enc.Utf8) : 'Unknown';

                // Increment counter and send response when all queries are done
                completedQueries++;
                if (completedQueries === bets.length) {
                    const encryptedData = bets.map(bet => encryptData(bet));
                    console.log('encryptedData', encryptedData);
                    res.send({ success: true, result: encryptedData });
                }
            });
        }

    });
});


module.exports = router;
