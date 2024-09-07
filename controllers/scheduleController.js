const Schedule = require('../models/scheduleModel');
const Teacher = require('../models/teacherModel');
const { Op } = require('sequelize');


const createSchedule = async (req, res) => {
  const { start_time, end_time, teacherid, dayofweek } = req.body;

  try {

    const existingSchedule = await Schedule.findOne({
      where: {
        teacherid,
        dayofweek,
        start_time,
      }
    });

    if (existingSchedule) {
      return res.status(400).json({ message: 'Schedule conflict: this time slot is already taken.' });
    }


    const newSchedule = await Schedule.create({
      start_time,
      end_time,
      teacherid,
      dayofweek
    });
    
    return res.status(201).json(newSchedule);
  } catch (error) {
    return res.status(500).json({ message: 'Error creating schedule', error });
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
      where: { teacherid },
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


const updateSchedule = async (req, res) => {
    const { id } = req.params;
    const { start_time, end_time, teacherid, dayofweek } = req.body;

    try {
      
      if (!teacherid || !start_time || !end_time || !dayofweek) {
        return res.status(400).json({ message: 'Missing required fields: teacherid, start_time, end_time, and dayofweek are required' });
      }
    
      const schedule = await Schedule.findByPk(id);
      
      if (!schedule) {
        return res.status(404).json({ message: 'Schedule not found' });
      }
  
      
      const conflictingSchedule = await Schedule.findOne({
        where: {
          teacherid,
          dayofweek,
          start_time,
          scheduleid: { [Op.ne]: id },  
        }
      });
  
      if (conflictingSchedule) {
        return res.status(400).json({ message: 'Schedule conflict: this time slot is already taken.' });
      }
  
 
      schedule.start_time = start_time;
      schedule.end_time = end_time;
      schedule.teacherid = teacherid;
      schedule.dayofweek = dayofweek;
  
      await schedule.save();
      return res.status(200).json(schedule);
    } catch (error) {
      console.error('Error updating schedule:', error);  
      return res.status(500).json({ message: 'Error updating schedule', error });
    }
  };
  
  
const deleteSchedule = async (req, res) => {
  const { id } = req.params;

  try {
    const schedule = await Schedule.findByPk(id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    await schedule.destroy();
    return res.status(200).json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting schedule', error });
  }
};

module.exports = {
  createSchedule,
  getAllSchedules,
  getScheduleByTeacher,
  updateSchedule,
  deleteSchedule
};
