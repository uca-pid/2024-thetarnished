const  DataTypes  = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  studentid: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastname: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'students', // Explicitly set the table name
  timestamps: false // Disables createdAt and updatedAt
});

module.exports = Student;
