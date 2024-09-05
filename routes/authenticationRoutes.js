const express = require('express');
const { loginUser, createUser, sendEmailToUser } = require('../controllers/authenticationController');

const router = express.Router();

router.post('/login', loginUser);
router.post('/register', createUser);
router.post('/send-email', sendEmailToUser)

module.exports = router;