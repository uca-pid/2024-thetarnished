const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MonthlySchedule = sequelize.define('MonthlySchedule', {
  monthlyscheduleid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: false,
    defaultValue: sequelize.literal('unique_rowid()')
  },
  datetime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  teacherid: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: 'teachers',
      key: 'teacherid'
    },
    onDelete: 'CASCADE'
  },
  maxstudents: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 1
  },
  currentstudents: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 0
  },
  istaken: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
}, {
  tableName: 'monthlyschedule',
  timestamps: false
});

module.exports = MonthlySchedule;
