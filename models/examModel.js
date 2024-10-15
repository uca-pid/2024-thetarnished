const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Teacher = require('./teacherModel');
const Subject = require('./subjectModel');
const Reservation = require('./reservationModel'); 
const ExamQuestion = require('./examQuestionModel');

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
  },
  subject_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Subject,
      key: 'subjectid',
    },
  },
  reservation_id: {  
    type: DataTypes.BIGINT,
    allowNull: true,  
    references: {
      model: Reservation,
      key: 'id',
    },
    onDelete: 'SET NULL', 
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
