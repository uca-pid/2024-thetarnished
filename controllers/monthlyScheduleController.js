const { Sequelize } = require('sequelize');
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

const getIndividualClasses = async (req, res) => {
  try {
      const allClasses = await MonthlySchedule.findAll({
          where: {
              maxstudents: 1,
              istaken: false,
          },
      });

      const filteredClasses = allClasses.filter(
          (classItem) => classItem.currentstudents < classItem.maxstudents
      );

      if (filteredClasses.length === 0) {
          return res.status(404).json({ message: 'No individual classes found' });
      }

      res.status(200).json(filteredClasses);
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
};

const getGroupClasses = async (req, res) => {
  try {
      const allClasses = await MonthlySchedule.findAll({
          where: {
              istaken: false,
          },
      });

      const filteredClasses = allClasses.filter(
          (classItem) => classItem.currentstudents < classItem.maxstudents
      );

      const refilteredClasses = filteredClasses.filter(
        (classItem) => classItem.maxstudents > 1
      );

      if (refilteredClasses.length === 0) {
          return res.status(404).json({ message: 'No group classes found' });
      }

      res.status(200).json(refilteredClasses);
      
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
};

module.exports = {
  getIndividualClasses,
  getGroupClasses,
  createMonthlySchedule
};
