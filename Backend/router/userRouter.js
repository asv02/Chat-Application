const User = require('../models/user');
const express = require('express');
const router = express.Router();
const OTP = require('../Modals/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

router.post('/auth/signup', async (req, res) => {
    try {
        const { firstname, lastname, gender, Password, ContactNumber } = req.body;
        if (!firstname || !lastname || !ContactNumber || !Password) {
            return res.status(400).json({ message: 'Required Fields are absent' });
        }
        const hashedPass = await bcrypt.hash(Password, 10)
        console.log(hashedPass)
        const user = await User.create({
            firstname,
            lastname,
            gender: gender.toLowerCase(),
            Password: hashedPass,
            ContactNumber
        });
        res.status(201).json({ message: 'User Saved Successfully', user });
    } catch (err) {
        res.status(400).json({ message: err.message || 'Something went wrong with saving user' });
    }
});

router.post('/auth/send-otp', async (req, res) => {
    try {
        const { ContactNumber } = req.body;
        if (!ContactNumber) {
            return res.status(400).json({ message: 'ContactNumber is required' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 
        const hashedOtp = await bcrypt.hash(otp, 10);
        await OTP.create({ ContactNumber, otp: hashedOtp, expiresAt });
        res.status(200).json({ message: 'OTP sent successfully', otp });
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to store OTP', error: err.message });
    }
});

router.post('/auth/verify-otp', async (req, res) => {
    const { otp, ContactNumber } = req.body;
    if (!otp || !ContactNumber) {
        return res.status(400).json({ message: 'OTP and ContactNumber are required' });
    }
    try {
        const expectedOtp = await OTP.findOne({
            where: { ContactNumber },
            order: [['createdAt', 'DESC']]
        });
        if (!expectedOtp) {
            return res.status(400).json({ message: 'No OTP found' });
        }
        if (expectedOtp.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }
        const compareOtp = await bcrypt.compare(otp, expectedOtp.otp);
        if (!compareOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        const user =await User.findOne(
            {
                where: { ContactNumber }
            })
        // I have stated mobile number to be unique so passing that for uniqueness.
        const access_token = await jwt.sign({ contact: ContactNumber }, "Akash@123", { expiresIn: '1h' })
        const refresh_token = await jwt.sign({ contact: ContactNumber }, "Akash@123", {
            expiresIn: '1d'
        })
        user.refresh_token = refresh_token
        await user.save();
        res.cookie('access_token', access_token)
        res.cookie('refresh_token', refresh_token)
        res.status(200).json({ message: 'OTP verified' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to verify OTP', error: err.message });
    }
});

router.post('/auth/forgot-password', async (req, res) => {
    const { ContactNumber, otp, newPassword } = req.body;
    if (!ContactNumber || !otp || !newPassword) {
        return res.status(400).json({ message: 'ContactNumber, otp, and newPassword are required' });
    }
    try {
        const expectedOtp = await OTP.findOne({
            where: { ContactNumber },
            order: [['createdAt', 'DESC']]
        });
        if (!expectedOtp) {
            return res.status(400).json({ message: 'No OTP found' });
        }
        if (expectedOtp.expiresAt < new Date()) {
            return res.status(400).json({ message: 'OTP expired' });
        }
        const compareOtp = await bcrypt.compare(otp, expectedOtp.otp);
        if (!compareOtp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }
        const hashedPass = await bcrypt.hash(newPassword, 10);
        const [updated] = await User.update(
            { Password: hashedPass },
            { where: { ContactNumber } }
        );
        if (!updated) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
});

module.exports = router;