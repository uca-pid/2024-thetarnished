const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subject = sequelize.define('Subject', {
    subjectid: {
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
        defaultValue: sequelize.literal('unique_rowid()')
    },
    subjectname: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'subjects',
    timestamps: false
});

module.exports = Subject;
