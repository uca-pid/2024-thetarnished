const bcrypt = require('bcrypt');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');

const loginUser = async (req, res) => {
    try{
        const {email, password} = req.body;
        let user =  await Student.findOne({where: {email}});
        let role;

        if(!user){
            user = await Teacher.findOne({where: {email}});
            role = 'TEACHER';
        } else{
            role = 'STUDENT';
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid password'});
        }

        return res.status(200).json({
            message: 'Login successful',
            user: {
              id: user.id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              role: role
            }
          });
    }catch (error){
        "istambul ignore next";
        return res.status(500).json({message: 'Internal server error'});
    }
};

module.exports = {loginUser};