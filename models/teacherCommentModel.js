const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path to your database config
const Teacher = require('./teacherModel'); // Adjust the path to your teacher model

const TeacherComments = sequelize.define('TeacherComment', {
    comment_id: {
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
    tableName: 'teacher_comments',
    timestamps: false,
});

// Teacher.hasMany(TeacherComments, { foreignKey: 'teacher_id' });
// TeacherComments.belongsTo(Teacher, { foreignKey: 'teacher_id' });

module.exports = TeacherComments;
