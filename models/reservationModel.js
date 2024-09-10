const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true, // Use autoIncrement for identity columns
  },
  student_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'students',
      key: 'studentid',
    },
    onDelete: 'CASCADE',
  },
  schedule_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'schedule',
      key: 'scheduleid',
    },
    onDelete: 'CASCADE',
  },
  subject_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'subjectid',
    },
    onDelete: 'CASCADE',
  },
  datetime: {
    type: DataTypes.DATE,  
    allowNull: false,
  },
  teacher_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'teacherid',
    },
    onDelete: 'CASCADE',
  },
}, {
  tableName: 'reservations',
  timestamps: false,
});

module.exports = Reservation;
