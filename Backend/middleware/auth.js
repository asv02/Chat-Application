const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
    const authHeader = req.headers['authorization'];
    console.log('authHeader->', authHeader)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // console.log('varifying user.....')
        // console.log('decoded->');
        // console.log("secret key->",process.env.JWT_SECRET_KEY)
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        // console.log('decoded->',decoded);
        req.user = await User.findOne({ where: { ContactNumber: decoded.contact } });
        if (!req.user) {
            return res.status(401).json({ message: 'Invalid token: user not found' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ message: `Invalid token ${err.message}` });
    }
};