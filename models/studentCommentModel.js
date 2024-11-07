const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); 
const Student = require('./studentModel'); 

const StudentComments = sequelize.define('StudentComment', {
    comment_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    student_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
            model: Student,
            key: 'studentid',
        },
        onDelete: 'CASCADE',
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    commenter_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    tableName: 'student_comments',
    timestamps: false,
});

// Student.hasMany(StudentComments, { foreignKey: 'student_id' });
// StudentComments.belongsTo(Student, { foreignKey: 'student_id' });

module.exports = StudentComments;
