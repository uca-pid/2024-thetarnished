const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const autenthicationRoutes = require('./routes/authenticationRoutes');

const app = express();

app.use(express.json());
app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);
app.use('/authentication', autenthicationRoutes);

module.exports = app;