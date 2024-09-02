const Student = require('../models/studentModel');

const createStudent = async (req, res) => {
    try{
        const { name, lastname, email, password } = req.body;
        const student = await Student.create({name, lastname, email, password});
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
}

module.exports = {
    createStudent,
    getStudentById
}