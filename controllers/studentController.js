const Student = require('../models/studentModel');

const createStudent = async (req, res) => {
    try{
        const { email, password } = req.body;
        const student = await Student.create({email, password});
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
            return res.status(404).json({error: 'Student not found'});
        }
        return res.status(200).json(student);
    }
    catch(error){
        return res.status(400).json({error: error.message});
    }
}

module.exports = {
    createStudent,
    getStudentById
}