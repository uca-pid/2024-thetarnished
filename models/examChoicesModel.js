const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Question = require('./questionModel');

const Choice = sequelize.define('Choice', {
  choice_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  question_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Question,
      key: 'question_id',
    },
    onDelete: 'CASCADE',
  },
  choice_text: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  tableName: 'choices',
  timestamps: false,
});

module.exports = Choice;
