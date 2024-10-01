const Teacher = require('../models/teacherModel');
const SubjectTeacher = require('../models/subjectTeacherModel');
const Subject = require('../models/subjectModel');
const Reservation = require('../models/reservationModel');
const sequelize = require('../config/database');
const { Op } = require('sequelize');
const moment = require('moment');
const { Sequelize } = require('sequelize');


const getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    return res.status(200).json(teachers);
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error getting teachers: ${error.message}` });
  }
};

const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id);
    
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    return res.status(200).json(teacher);
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error getting teacher: ${error.message}` });
  }
};

const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname  } = req.body;
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    teacher.firstname = firstname;
    teacher.lastname = lastname;
    await teacher.save();
    return res.status(200).json(teacher);
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error updating teacher: ${error.message}` });
  }
};

const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the teacher by ID
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check if the teacher has any reservations
    const reservationsCount = await Reservation.count({
      where: {
        teacher_id: id,
        datetime: {
          [Op.gt]: moment().toDate() 
        }
      }
    });

    if (reservationsCount > 0) {
      return res.status(400).json({ message: 'Cannot delete teacher with existing reservations' });
    }

    // If no reservations, delete the teacher
    await teacher.destroy();
    return res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error deleting teacher: ${error.message}` });
  }
};

const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherid } = req.params; 
    const { subjectid } = req.body; 

    const bigIntSubjectId = BigInt(subjectid);
    
    const teacher = await Teacher.findByPk(teacherid);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    
    const subject = await Subject.findByPk(bigIntSubjectId);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    
    await SubjectTeacher.create({ teacherid: teacherid, subjectid: bigIntSubjectId });

    return res.status(201).json({ message: 'Subject assigned to teacher successfully' });
  } catch (error) {
   
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error assigning subject to teacher: ${error.message}` });
  }
};

const removeSubjectFromTeacher = async (req, res) => {
  try {
    const { teacherid } = req.params;
    const { subjectid } = req.body;
    const teacher = await Teacher.findByPk(teacherid);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    const subject = await Subject.findByPk(subjectid);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    await SubjectTeacher.destroy({ where: { teacherid, subjectid } });
    return res.status(200).json({ message: 'Subject removed from teacher successfully' });
  } catch(error){
    /* istanbul ignore next */
     return res.status(400).json({ message: `Error deleting subject from teacher: ${error.message}` });
  }
};

  const getAllTeachersDictatingASubjectById = async (req, res) => {
    try {
      const { subjectid } = req.params;
      const [teachers] = await sequelize.query(`
        SELECT DISTINCT teachers.teacherid, firstname, lastname, email, subjectid  
        FROM teachers 
        JOIN subjectteacher 
        ON teachers.teacherid = subjectteacher.teacherid 
        JOIN monthlyschedule 
        ON teachers.teacherid = monthlyschedule.teacherid 
        WHERE subjectid = :subjectid 
        AND istaken = 'false' 
        ORDER BY firstname ASC, lastname ASC`
      , {

        replacements: { subjectid: subjectid },
      });

      return res.status(200).json(teachers);
    
    } catch (error) {
      /* istanbul ignore next */
      return res.status(500).json({ message: `Error getting teachers: ${error.message}` });
    }
  };

  const updateTeacherSubjects = async (email, subjects) => {
      try {
          if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
              throw new Error('Invalid subjects data');
          }

          const teacher = await Teacher.findOne({where: {email: email}});
          if (!teacher) {
              throw new Error('Teacher not found');
          }

          await SubjectTeacher.destroy({ where: { teacherid: teacher.teacherid } });

          const newRelations = subjects.map(subjectId => ({
              teacherid: teacher.teacherid,
              subjectid: subjectId
          }));
          await SubjectTeacher.bulkCreate(newRelations);
      } catch (error) {
          throw error;
      }
  };

module.exports = {
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignSubjectToTeacher,
  removeSubjectFromTeacher,
  getAllTeachers,
  getAllTeachersDictatingASubjectById,
  updateTeacherSubjects
};
