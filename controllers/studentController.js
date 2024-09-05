const Student = require('../models/studentModel');
const bcrypt = require('bcrypt');

const createStudent = async (req, res) => {
    try{
        const { firstname, lastname, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const student = await Student.create({firstname, lastname, email, password: hashedPassword});
        return res.status(201).json(student);
    } catch(error){
        return res.status(400).json({error: error.message});
    }
}

const getStudentById = async (req, res) => {
    try{
        const { id } = req.params;
        const student = await Student.findByPk(id);
        if(!student){
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.status(200).json(student);
    }
    catch(error){
        /* istanbul ignore next */
        return res.status(400).json({error: error.message});
    }
};

const updateStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const { firstname, lastname } = req.body;
      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      student.firstname = firstname;
      student.lastname = lastname;
      await student.save();
      return res.status(200).json(student);
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({ message: `Error updating student: ${error.message}` });
    }
  };

  const deleteStudent = async (req, res) => {
    try {
      const { id } = req.params;
      const student = await Student.findByPk(id);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }
      await student.destroy();
      return res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
      /* istanbul ignore next */
      return res.status(400).json({ message: `Error deleting student: ${error.message}` });
    }
  };

module.exports = {
    createStudent,
    getStudentById,
    updateStudent,
    deleteStudent
}