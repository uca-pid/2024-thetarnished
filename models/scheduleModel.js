const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const moment = require('moment');

const Schedule = sequelize.define('Schedule', {
  scheduleid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: false,
    defaultValue: sequelize.literal('unique_rowid()')
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isTaken: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  teacherid: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'teacherid'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'schedule',
  timestamps: false,
  hooks: {
    beforeCreate: (schedule) => {
      const date = moment(schedule.date);
      schedule.start_time = date.format('HH:mm:ss');
      schedule.end_time = date.add(1, 'hours').format('HH:mm:ss');
      schedule.dayofweek = date.isoWeekday(); 
    }
  }
});

module.exports = Schedule;
