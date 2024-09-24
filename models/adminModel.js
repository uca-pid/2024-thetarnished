// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/database');

// const Admin = sequelize.define('Admin', {
//   adminid: {
//     type: DataTypes.BIGINT,
//     primaryKey: true,
//     autoIncrement: false,
//     defaultValue: sequelize.literal('unique_rowid()')
//   },
//   firstname: {
//     type: DataTypes.STRING(255),
//     allowNull: false
//   },
//   lastname: {
//     type: DataTypes.STRING(255),
//     allowNull: false
//   },
//   email: {
//     type: DataTypes.STRING(255),
//     allowNull: false,
//     unique: true
//   },
//   password: {
//     type: DataTypes.STRING(255),
//     allowNull: false
//   }
// }, {
//   tableName: 'admins',
//   timestamps: false,
//   indexes: [
//     {
//       unique: true,
//       fields: ['email']
//     }
//   ]
// });

// module.exports = Admin;
