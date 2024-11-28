const express = require('express');
const router = express.Router();
const cors = require('cors');
const db = require('../config/db');
const { encryptData, decryptData } = require('../utils/cryptoUtils');
const CryptoJS = require('crypto-js');
const secretKey = "qFKDR0tGwqxFhUdc3j2Zh91OOZOQiN3QGvAB4ltypniLIXz7MaDEyrcGEOkz/5rcJ5hpf9EsRepvWFgTzl/Oo6J26wcylMeQHDp8eYRWmKC7TWGJ5PPuhv+hqt2ePft7mVCkgEFf+OLnLbMxu5JwnAA868BoGo/3gUEmxg4tiePsGkUfidxW7QSOgSHRpNs2wsFuAcaLZhGqzC53tE2SWbcIi4o0o5GYWYt3juyXQd4EPfmMbGlTM29uJ8XdfecR1jpj4vcyEEj/v22+jlJBF0OnJLFTXev38LH8oV6Hhq5VxmUbLp4qA7UcIgLuKpj7htCrVY/zfOxQUoJmUlphko3JX3nri26zkIv/5QSFD4Q=";


router.use(cors());


// Login route
router.post('/api/login', async (req, res) => {
    const { encryptedData } = req.body;
    try {
        const { user, password } = decryptData(encryptedData);

        console.log('user:', user);

        //want to match encrypted username with database

        const queryPromise = new Promise((resolve, reject) => {
            db.query('SELECT PASSWORD, USER_ID, NAME, ROLE FROM user_details WHERE USERNAME = ? AND IS_ACTIVE = 1', [user], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });

        const result = await queryPromise;

        // console.log('result:', result);

        if (result.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        const decryptedPassword = CryptoJS.AES.decrypt(result[0].PASSWORD, secretKey).toString(CryptoJS.enc.Utf8);

        if (password !== decryptedPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        result[0].NAME = CryptoJS.AES.decrypt(result[0].NAME, secretKey).toString(CryptoJS.enc.Utf8);


        const { PASSWORD, ...userDetails } = result[0];
        const encryptedUserDetails = encryptData(userDetails);
        res.status(200).json({ encryptedData: encryptedUserDetails });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


router.post('/api/addUser', async (req, res) => {
    if (!db) {
        return res.status(500).json({ message: 'Internal server error' });
    }

    try {
        //decrypt data comming from client
        const { encryptedData1 } = req.body;
        const { PASSWORD, ...restOfDetails } = decryptData(encryptedData1);

        const encryptedPassword = CryptoJS.AES.encrypt(PASSWORD, secretKey).toString();
        const encryptedName = CryptoJS.AES.encrypt(restOfDetails.NAME, secretKey).toString();

        const userObject = { ...restOfDetails, PASSWORD: encryptedPassword, NAME: encryptedName };
        console.log('userObject:', userObject);

        const queryPromise = new Promise((resolve, reject) => {
            db.query('INSERT INTO user_details SET ?', userObject, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }
        );

        const result = await queryPromise;
        if (result.affectedRows > 0) {
            res.status(200).json({ success: true });
        } else {
            throw new Error('Failed to add user');
        }
    } catch (error) {
        console.error('Error adding user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.post('/api/checkEmailUsername', async (req, res) => {
    const { encryptedData } = req.body;
    if (!db) {
        return res.status(500).json({ message: 'Internal server error' });
    }
    //decrypt data comming from client
    const { USERNAME } = decryptData(encryptedData);

    try {

        const queryPromise = new Promise((resolve, reject) => {
            db.query('SELECT COUNT(*) as count FROM user_details WHERE USERNAME = ? AND IS_ACTIVE=1', [USERNAME], (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }

        );

        const result = await queryPromise;
        res.status(200).json({ used: result[0].count > 0 });

    } catch (error) {
        console.error('Error checking email and username:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
//
// router.post('/api/updateProfile', async (req, res) => {
//     if (!db) {
//         return res.status(500).json({ message: 'Internal server error' });
//     }
//
//     try {
//         const { PASSWORD, ...restOfDetails } = req.body;
//         const encryptedPassword = CryptoJS.AES.encrypt(PASSWORD, secretKey).toString();
//         const encryptedUsername = CryptoJS.AES.encrypt(restOfDetails.USERNAME, secretKey).toString();
//         const encryptedName = CryptoJS.AES.encrypt(restOfDetails.NAME, secretKey).toString();
//
//         const userObject = { ...restOfDetails, PASSWORD: encryptedPassword, USERNAME: encryptedUsername, NAME: encryptedName };
//         const result = await db.query('UPDATE user_details SET ? WHERE USER_ID = ?', [userObject, req.body.USER_ID]);
//
//         if (result.affectedRows > 0) {
//             res.status(200).json({ message: 'User updated successfully' });
//         } else {
//             throw new Error('Failed to update user');
//         }
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

module.exports = router;
