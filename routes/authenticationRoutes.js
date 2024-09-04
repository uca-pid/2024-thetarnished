const express = require('express');
const { loginUser } = require('../controllers/authenticationController');

const router = express.Router();

router.post('/login', loginUser);

module.exports = router;