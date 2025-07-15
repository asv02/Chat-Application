const { DataTypes } = require('sequelize');
const sequelize = require('../utils/database');

const User = sequelize.define('User', {
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  ContactNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      is: /^[0-9+\-() ]+$/,
      notEmpty: true,
    },
  },
  Password:
  {
    type:DataTypes.STRING,
    allowNull:false,
  },
  gender: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['male', 'female', 'others']],
    },
  },
  refresh_token:
  {
    type:DataTypes.STRING,
  }
}, {
  timestamps: true,
});

module.exports = User; 