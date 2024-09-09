const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');  // Assuming you have set up the Sequelize instance

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
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
      model: 'subjects', // Name of the table
      key: 'subjectid',   // Foreign key referencing subjectid in subjects table
    },
    onDelete: 'CASCADE',
  },
  date: {
    type: DataTypes.DATEONLY,
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
