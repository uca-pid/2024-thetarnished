const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const sequelize = require('./config/databaseTest');

const app = express();

app.use(express.json());

app.use('/students', studentRoutes);
app.use('/teachers', teacherRoutes);

sequelize.sync()
  .then(() => {
    console.log('BD on');
  })
  .catch((err) => {
    /* istanbul ignore next */
    console.error('Error:', err);
  });

module.exports = app;
