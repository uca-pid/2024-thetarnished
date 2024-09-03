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
    primaryKey: true
  },
  subjectid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'subjectid'
    },
    primaryKey: true 
  }
}, {
  tableName: 'subjectteacher',
  timestamps: false,

  id: false,
});

module.exports = SubjectTeacher;
