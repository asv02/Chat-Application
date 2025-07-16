const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.cookies['access_token'];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }
        let temp;
        try {
            temp = jwt.verify(token, 'Akash@123');
        } catch (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        const contact = temp.contact;
        const user = await User.findOne({ where: { ContactNumber: contact } });
        if (!user) {
            return res.status(400).json({ message: 'No user found.' });
        }
        req.user = user;
        next();
    } catch (err) {
        res.status(500).json({ message: 'Authentication failed', error: err.message });
    }
}

module.exports = auth;