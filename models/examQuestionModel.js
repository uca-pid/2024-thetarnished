const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ExamQuestion = sequelize.define('ExamQuestion', {
  question_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  exam_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Exams',
      key: 'exam_id',
    },
    onDelete: 'CASCADE',
  },
  question_text: {
    type: DataTypes.STRING(255),
    allowNull: false,
  }
}, {
  tableName: 'questions',
  timestamps: false,
});

module.exports = ExamQuestion;
