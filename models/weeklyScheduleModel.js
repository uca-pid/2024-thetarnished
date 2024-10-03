const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WeeklySchedule = sequelize.define('WeeklySchedule', {
  weeklyscheduleid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: false,
    defaultValue: sequelize.literal('unique_rowid()')
  },
  start_time: {
    type: DataTypes.TIME,
    allowNull: false
  },
  end_time: {
    type: DataTypes.TIME,
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
  dayofweek: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 1,
      max: 7
    }
  },
  maxstudents: {
    type: DataTypes.BIGINT,
    allowNull: false,
    defaultValue: 1
  }
}, {
  tableName: 'weeklyschedule',
  timestamps: false
});

module.exports = WeeklySchedule;
