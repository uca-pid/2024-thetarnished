const MonthlySchedule = require('../models/monthlyScheduleModel');
const moment = require('moment'); 

const createMonthlySchedule = async (datetime, teacherid, maxstudents, currentstudents, weeklyscheduleid) => {
  try {

    for (let i = 0; i < 4; i++) {
      const scheduleDate = moment(datetime).add(i * 7, 'days').format('YYYY-MM-DD HH:mm:ss');

      await MonthlySchedule.create({
        datetime: scheduleDate,
        teacherid: teacherid,
        maxstudents: maxstudents,
        currentstudents: currentstudents,
        weeklyscheduleid: weeklyscheduleid,
      });
    }
  } catch (error) {
    /* istanbul ignore next */
    throw error;
  }
};

module.exports = {
    createMonthlySchedule
};
