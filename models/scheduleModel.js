const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Schedule = sequelize.define('Schedule', {
  scheduleid: {
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
    allowNull: false, 
    references: {
      model: 'teachers', 
      key: 'teacherid'
    },
    onDelete: 'CASCADE'
  },
  dayofweek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 7
    }
  },
  istaken: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'schedule',
  timestamps: false
});

module.exports = Schedule;
