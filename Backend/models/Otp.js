const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const OTP = sequelize.define('OTP', {
  ContactNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
}, {
  timestamps: true,
});

module.exports = OTP; 