const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SubjectTeacher = sequelize.define('SubjectTeacher', {
  teacherid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'teachers',
      key: 'teacherid'
    },
    primaryKey: true,
    onDelete: 'CASCADE'
  },
  subjectid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'subjectid'
    },
    primaryKey: true,
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'subjectteacher',
  timestamps: false,

  id: false,
});

module.exports = SubjectTeacher;
