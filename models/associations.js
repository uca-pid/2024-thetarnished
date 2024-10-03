const Teacher = require('./teacherModel');
const Schedule = require('./weeklyScheduleModel');

const defineAssociations = () => {

  Teacher.hasMany(Schedule, { foreignKey: 'teacherid' });
  Schedule.belongsTo(Teacher, { foreignKey: 'teacherid' });
};

module.exports = defineAssociations;
