const bcrypt = require('bcrypt');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const { google } = require('googleapis');
const sequelize = require('../config/database');
const { QueryTypes } = require('sequelize');
const SubjectTeacher = require('../models/subjectTeacherModel');
require('dotenv').config()
const nodemailer = require('nodemailer')
const validator = require('validator');
const Schedule = require('../models/scheduleModel');
const Subject = require('../models/subjectModel');

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URI = process.env.REDIRECT_URI
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN})

const createUser = async (req, res) => {
    try{
        const {firstname, lastname, email, password, subjects = [], role} = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if(!validator.isEmail(email)){
            return res.status(400).json({message: 'Invalid email'});
        }
        const query = `
            SELECT * FROM (
            SELECT studentid, firstname, lastname, email, 'STUDENT' as role FROM students
            UNION ALL
            SELECT teacherid, firstname, lastname, email, 'TEACHER' as role FROM teachers
            ) as users
            WHERE email = ? LIMIT 1;
        `;
          
          const [user] = await sequelize.query(query, {
              replacements: [email],
              type: QueryTypes.SELECT
          });
        if(user){
            return res.status(400).json({message: 'User already exists'})
        }

        const bigIntSubjects = subjects.map(id => BigInt(id));

        if(role === 'STUDENT'){
            const user = await Student.create({
                firstname,
                lastname,
                email,
                password: hashedPassword,
            });
            return res.status(201).json({message: 'User created successfully', user});
        }
        else{
            const user = await Teacher.create({
                firstname,
                lastname,
                email,
                password: hashedPassword,
            });
            for(let subject of bigIntSubjects) {
                await SubjectTeacher.create({ teacherid: user.teacherid, subjectid: subject });
            }
            return res.status(201).json({message: 'User created successfully', user});
        }
    } catch (error){
        /*istanbul ignore next*/
        return res.status(500).json({message: 'Internal server error'});
    }
};

const findUser = async (email) => {
    let user = await Student.findOne({ where: { email } });
    if (!user) {
        user = await Teacher.findOne({ where: { email } });
    }
    return user;
};

const getSubjectsForTeacher = async (teacherId) => {
    const subjectIds = await SubjectTeacher.findAll({
        attributes: ['subjectid'],
        where: { teacherid: teacherId }
    });
    const subjectIdsArray = subjectIds.map(record => record.subjectid);

    if (subjectIdsArray.length) {
        return await Subject.findAll({
            where: { subjectid: subjectIdsArray }
        });
    }
    return [];
};

const getScheduleForTeacher = async (teacherId) => {
    const schedule = await Schedule.findAll({
        where: { teacherid: teacherId },
        include: {
            model: Teacher,
            attributes: ['firstname', 'lastname', 'email']
        }
    });

    if (schedule.length) {
        return schedule.map(sch => ({
            start_time: sch.start_time,
            end_time: sch.end_time,
            teacherid: sch.teacherid,
            dayofweek: sch.dayofweek
        }));
    }
    return [];
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await findUser(email);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        let role;
        let userid;
        let formattedSchedule = [];
        let subjects = [];
        
        if (user instanceof Teacher) {
            role = 'TEACHER';
            userid = user.teacherid;
            subjects = await getSubjectsForTeacher(userid);
            formattedSchedule = await getScheduleForTeacher(userid);
        } else {
            role = 'STUDENT';
            userid = user.studentid;
            formattedSchedule = [];
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        return res.status(200).json({
            message: 'Login successful',
            user: {
                id: userid,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                role: role,
                schedule: formattedSchedule,
                subjects: subjects
            }
        });
    } catch (error) {
        /* istanbul ignore next */
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const changeUserPassword = async (req, res) => {
    try{
        const {oldPassword, newPassword, email} = req.body;

        const student = await Student.findOne({where: {email}});
        const teacher = await Teacher.findOne({where: {email}});
        if(!student && !teacher){
            return res.status(404).json({message: 'User not found'});
        }
        const foundUser = student ? student : teacher;
        const isPasswordValid = await bcrypt.compare(oldPassword, foundUser.password);
        if(!isPasswordValid){
            return res.status(401).json({message: 'Invalid password'});
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        student ? await Student.update({ password: hashedPassword }, { where: { email: email } }) : await Teacher.update({ password: hashedPassword }, { where: { email: email } });
        return res.status(200).json({message: 'Password changed successfully'});

    }catch(error){
        /* istanbul ignore next */
        return res.status(500).json({message: 'Internal server error'});
    }
}

const sendEmailToUser = async (req, res) => {
    
    const email = req.body.email    

    try {
        const query = `
            SELECT * FROM (
            SELECT studentid, firstname, lastname, email, 'STUDENT' as role FROM students
            UNION ALL
            SELECT teacherid, firstname, lastname, email, 'TEACHER' as role FROM teachers
            ) as users
            WHERE email = ? LIMIT 1;
        `;
          
          const [user] = await sequelize.query(query, {
              replacements: [email],
              type: QueryTypes.SELECT
          });
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        
        const accessToken = await oAuth2Client.getAccessToken()
        
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'Oauth2',
                user: 'linkandlearnonline@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken
            }
        })

        const mailOptions = {
            from: 'Link and Learn <linkandlearnonline@gmail.com>',
            to: email,
            subject: 'Hello from Gmail using API',
            text: 'Hello from gmail email using API',
            html: '<h1>Hello from gmail email using API</h1>',
        };

        const result = await transport.sendMail(mailOptions)
        return res.status(200).json({ message: result });
    } catch(error) {
        /* istanbul ignore next */
        return res.status(500).json({message: 'Internal server error'}); 
    }
};

const editProfile = async (req, res) => {
    try{
        const {newFirstname, newLastname, email} = req.body;
        const student = await Student.findOne({where: {email}});
        const teacher = await Teacher.findOne({where: {email}});
        if(!student && !teacher){
            return res.status(404).json({message: 'User not found'});
        }
        const foundUser = student ? student : teacher;
        student ? await Student.update({ firstname: newFirstname, lastname: newLastname }, { where: { email: email } }) : await Teacher.update({ firstname: newFirstname, lastname: newLastname }, { where: { email: email } });
        return res.status(200).json({message: 'Profile updated successfully'});
    }catch(error){
        /* istanbul ignore next */
        return res.status(500).json({message: 'Internal server error'});
    }
}

module.exports = {loginUser, sendEmailToUser, createUser, changeUserPassword, editProfile};