const Teacher = require('../models/teacherModel');

const createTeacher = async (req, res) => {
  try {
    const { name, lastname, email, password, subjects } = req.body;
    const role = 'teacher';
    const subjectsString = JSON.stringify(subjects);
    const teacher = await Teacher.create({ name, lastname, email, password, subjects: subjectsString, role });

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
    teacher.subjects = JSON.parse(teacher.subjects);
    return res.status(200).json(teacher);
  } catch (error) {
    /* istanbul ignore next */
    return res.status(400).json({ message: `Error getting teacher: ${error.message}` });
  }
};

module.exports = {
  createTeacher,
  getTeacherById,
};
