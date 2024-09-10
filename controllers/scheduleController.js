const Schedule = require('../models/scheduleModel');
const Teacher = require('../models/teacherModel');
const { Op } = require('sequelize');


const createSchedule = async (req, res) => {
  const { schedule } = req.body;
  const { teacherid } = req.params;
  
  try {
    const createdSchedules = [];

    const teacherSchedules = await Schedule.findAll({ where: { teacherid: teacherid } });

    if (teacherSchedules.length !== 0) {
      await Schedule.destroy({ where: { teacherid } });
    }

    for (const entry of schedule) {
      const { start_time, end_time, dayofweek } = entry;
      const newSchedule = await Schedule.create({
        start_time: start_time,
        end_time: end_time,
        teacherid: teacherid,
        dayofweek: dayofweek
      });

      createdSchedules.push(newSchedule);
    }
    return res.status(201).json(createdSchedules);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating schedules', error });
  }
};


const getAllSchedules = async (req, res) => {
    try {
      const schedules = await Schedule.findAll({
        include: {
          model: Teacher, 
          attributes: ['firstname', 'lastname', 'email']
        }
      });
      return res.status(200).json(schedules);
    } catch (error) {
      console.error('Error fetching schedules:', error); 
      return res.status(500).json({ message: 'Error fetching schedules', error });
    }
  };
  ;


const getScheduleByTeacher = async (req, res) => {
  const { teacherid } = req.params;

  try {
    const schedules = await Schedule.findAll({
      where: { teacherid: teacherid },
      include: {
        model: Teacher,
        attributes: ['firstname', 'lastname', 'email']
      }
    });

    if (!schedules.length) {
      return res.status(404).json({ message: 'No schedules found for this teacher.' });
    }

    return res.status(200).json(schedules);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving schedules', error });
  }
};


module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleByTeacher,
};
