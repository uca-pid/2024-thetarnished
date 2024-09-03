const Teacher = require('../models/teacherModel');
const SubjectTeacher = require('../models/subjectTeacherModel');
const Subject = require('../models/subjectModel');


const createTeacher = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const teacher = await Teacher.create({ firstname, lastname, email, password});
    return res.status(201).json(teacher);
  } catch (error) {
    return res.status(400).json({ message: `Error creating teacher: ${error.message}` });
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
    const teacher = await Teacher.findByPk(id);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }
    await teacher.destroy();
    return res.status(200).json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error deleting teacher: ${error.message}` });
  }
};


// THIS IS ASSIGN SUBJECT TO TEACHER


const assignSubjectToTeacher = async (req, res) => {
  try {
    const { teacherid } = req.params; 
    const { subjectid } = req.body; 

    console.log(`Assigning subject ${subjectid} to teacher ${teacherid}`);

    
    const teacher = await Teacher.findByPk(teacherid);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    
    const subject = await Subject.findByPk(subjectid);
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    await SubjectTeacher.create({ teacherid, subjectid });

    return res.status(201).json({ message: 'Subject assigned to teacher successfully' });
  } catch (error) {
    /* istanbul ignore next */
    console.error('Error assigning subject to teacher:', error);
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error assigning subject to teacher: ${error.message}` });
  }
};




module.exports = {
  createTeacher,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  assignSubjectToTeacher,
};
