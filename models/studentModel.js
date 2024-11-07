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
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  tableName: 'students', 
  timestamps: false 
});

module.exports = Student;
