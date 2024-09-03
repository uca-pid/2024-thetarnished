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
    primaryKey: true // Mark teacherid as part of the composite primary key
  },
  subjectid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'subjectid'
    },
    primaryKey: true // Mark subjectid as part of the composite primary key
  }
}, {
  tableName: 'subjectteacher',
  timestamps: false,
  // Disable the default 'id' field creation
  id: false,
});

module.exports = SubjectTeacher;
