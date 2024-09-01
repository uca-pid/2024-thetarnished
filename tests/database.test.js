const sequelize = require('../config/databaseTest');
const request = require('supertest')
const app = require('../app');

describe('Database Sync Error', () => {
    it('should handle errors during database sync', async () => {
      const originalSync = sequelize.sync;
      sequelize.sync = jest.fn(() => Promise.reject(new Error('Sync Error')));
      
      await request(app)
        .get('/teachers/1')
        .expect(400);
  
      sequelize.sync = originalSync;
    });
  });