const sequelize = require('./config/database');
const app = require('./app');

sequelize.sync()
  .then(() => {
    const port = process.env.PORT || 3000;
    app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));
    console.log('BD on');
  })
  .catch((err) => {
    console.error('Error:', err);
  });