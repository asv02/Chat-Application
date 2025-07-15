const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('chatApp', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;