const Subject = require('../models/subjectModel');

const getAllSubjects = async (req, res) =>{
    const response = await Subject.findAll();
    return res.status(200).json(response);
}

const getSubjectById = async (req, res) =>{
    const response = await Subject.findByPk(req.params.id);
    return res.status(200).json(response);
}

const createSubject = async (req, res) =>{
    try{
        const subjectAlreadyExists = await Subject.findOne({
        where: {
            subjectname: req.body.subjectname
        }
    });
    if(subjectAlreadyExists){
        return res.status(400).json({
            message: "Subject already exists"
        });
    }
    const response = await Subject.create(req.body);
    return res.status(200).json(response);
    }catch(error){
        return res.status(500).json({
            message: "Error creating subject"
        });
    }
}

module.exports = {
    getAllSubjects,
    getSubjectById,
    createSubject
};