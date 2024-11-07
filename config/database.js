require('dotenv').config();
const { Sequelize } = require('sequelize');

//LO HARDCODEO XQ NO LO ESTA TOMANDO DE  .ENV
const sequelize = new Sequelize("postgresql://db-user:NEdcKVk7NYQB7DMb-lPLMg@linkandlearn-15961.7tt.aws-us-east-1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full", {
    logging: false,
});
// const sequelize = new Sequelize(process.env.CONNECTION_STRING, {
//     logging: false,
// });

module.exports = sequelize;