const express = require('express');
const { postForgotPassword, getResetPassword, postResetPassword} = require('../controllers/resetController');
const app = express();
app.use(express.json()); 

const router = express.Router();

router.post('/forgot-password', postForgotPassword);
router.get('/reset-password/:id/:token', getResetPassword);
router.post('/reset-password/:id/:token', postResetPassword);

module.exports = router;