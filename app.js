const express = require('express');
const studentRoutes = require('./routes/studentRoutes');
//Aca tendriamos que importar el archivo de configuracion de la base de datos posta, yo use una solo para los primeros tests
const sequelize = require('./config/databaseTest');

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('Hello World');
});

app.use('/students', studentRoutes);

sequelize.sync()
  .then(() => {
    console.log('BD on');
  })
  .catch((err) => {
    console.error('Error:', err);
  });

module.exports = app;
