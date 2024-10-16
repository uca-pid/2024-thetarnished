const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
//const Exam = require('./examModel');


const Teacher = sequelize.define('Teacher', {
  teacherid: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_active: { 
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false  
  },
  on_vacation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'teachers',
  timestamps: false
});
//Teacher.hasMany(Exam, { foreignKey: 'teacher_id' });
//Exam.belongsTo(Teacher, { foreignKey: 'teacher_id' });
module.exports = Teacher;
