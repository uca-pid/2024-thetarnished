const { Op } = require('sequelize');
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

const assignVacation = async (req, res) => {
  try {

    const { teacherid, startdate, enddate } = req.body;

    const startDate = moment(startdate).startOf('day').toDate();
    const endDate = moment(enddate).endOf('day').toDate();


    const schedules = await MonthlySchedule.findAll({
      where: {
        teacherid: teacherid, 
        datetime: {
          [Op.between]: [startDate, endDate]
        },
        istaken: false 
      }
    });

    if (schedules.length > 0) {
      await MonthlySchedule.update(
        { istaken: true },
        {
          where: {
            monthlyscheduleid: {
              [Op.in]: schedules.map(schedule => schedule.monthlyscheduleid)
            }
          }
        }
      );
      const updatedSchedules = schedules.map(schedule => ({
        ...schedule.toJSON(),
        istaken: true
      }));
      console.log(`Assigned vacation to teacher ${teacherid} for the period from ${startdate} to ${enddate}.`);
      res.status(200).json(updatedSchedules);
    } else {
      console.log(`No available schedules found for teacher ${teacherid} in the specified date range.`);
      res.status(404).send('Schedules not found');
    }
  } catch (error) {
    /*istanbul ignore next*/
    res.status(500).send('Server error');
  }
};
module.exports = {
  getIndividualClasses,
  getGroupClasses,
  createMonthlySchedule,
  assignVacation,
};
