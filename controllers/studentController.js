const Student = require('../models/studentModel');
const sequelize = require('../config/database');
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

  const getPreviousTeachers = async (req, res) => {
    try {
      const { id } = req.params;
  
      if (!id) {
        return res.status(400).json({ message: "Student ID is required." });
      }
  
      const [teachers] = await sequelize.query(`
        SELECT DISTINCT teachers.teacherid, teachers.firstname, teachers.lastname, teachers.email
        FROM teachers
        JOIN reservations
        ON teachers.teacherid = reservations.teacher_id
        WHERE reservations.student_id = :studentid
        ORDER BY reservations.reservation_id DESC
        LIMIT 3;
      `, {
        replacements: { studentid: id }, 
      });
  
      return res.status(200).json(teachers);
  
    } catch (error) {
      /* istanbul ignore next */
      return res.status(500).json({ message: `Error getting previous teachers: ${error.message}` });
    }
  };
  

module.exports = {
    getStudentById,
    updateStudent,
    deleteStudent,
    getPreviousTeachers
}