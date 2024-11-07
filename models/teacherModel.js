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
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true, 
    defaultValue: null,
    validate: {
        min: 0.0,
        max: 5.0
    }
},
total_ratings: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 0,
  validate: {
      min: 0
  }
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
