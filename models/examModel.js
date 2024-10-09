const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Teacher = require('./teacherModel');

const Exam = sequelize.define('Exam', {
  exam_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  teacher_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Teacher,
      key: 'teacherid',
    },
    onDelete: 'CASCADE',
  },
  exam_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  }
}, {
  tableName: 'exams',
  timestamps: false,
});

module.exports = Exam;
