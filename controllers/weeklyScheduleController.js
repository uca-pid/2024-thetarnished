const Schedule = require('../models/weeklyScheduleModel');
const MonthlySchedule = require('../models/monthlyScheduleModel');
const Teacher = require('../models/teacherModel');
const {createMonthlySchedule} = require('../controllers/monthlyScheduleController');
const moment = require('moment');




const createSchedule = async (req, res) => {
  const { schedule } = req.body;
  const { teacherid } = req.params;
  
  try {
    const createdSchedules = [];
    

    const teacherSchedules = await Schedule.findAll({ where: { teacherid: teacherid } });

    if (teacherSchedules.length !== 0) {
      await Schedule.destroy({ where: { teacherid } });
      await MonthlySchedule.destroy({ where: { teacherid } });
    }

    for (const entry of schedule) {
      const { start_time, end_time, dayofweek, maxstudents } = entry;
      const newSchedule = await Schedule.create({
        start_time: start_time,
        end_time: end_time,
        teacherid: teacherid,
        dayofweek: dayofweek,
        maxstudents: maxstudents,
      });
      const datecreada = createDate(start_time, dayofweek);

      createdSchedules.push(newSchedule);
      await createMonthlySchedule(datecreada, teacherid, maxstudents, 0, newSchedule.weeklyscheduleid);

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
      return res.status(500).json({ message: 'Error fetching schedules', error });
    }
  };
  
function createDate(start_time, dayofweek) {
    
    const baseDate = moment().startOf('week').add(dayofweek, 'days');

    
    const date = moment(baseDate).set({
        hour: moment(start_time, 'HH:mm:ss').hours(),
        minute: moment(start_time, 'HH:mm:ss').minutes(),
        second: moment(start_time, 'HH:mm:ss').seconds()
    });

    return date.format('YYYY-MM-DD HH:mm:ss');
}

const getScheduleByTeacher = async (req, res) => {
  const { teacherid } = req.params;

  try {
    const schedules = await Schedule.findAll({
      // where: { teacherid: teacherid, istaken: false }, istaken no esta mas en en el modelo de Weekly Schedule
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
