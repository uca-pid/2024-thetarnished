const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
  subjectid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  subjectname: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'subjects',
  timestamps: false
});

module.exports = Subject;
