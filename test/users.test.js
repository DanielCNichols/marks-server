const app = require('../src/app');
// const config = require('../src/config');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = mongoose.model('User');

const testUser = {
  username: 'testface',
  password: 'Pass123',
  confirmPass: 'Pass123',
};

describe('User endpoints', () => {
  // const { testUsers } = helpers.makeFixtures();
  // const testUser = testUsers[0];

  after('disconnect from db', async () => {
    mongoose.connection.close();
  });

  afterEach('cleanup', async () => {
    console.log('running cleanup');
    // await mongoose.connection.collections['users'].drop();
    await User.remove({});
  });

  describe(`POST /api/users/register`, () => {
    it('responds with 200 when valid user is registered', () => {
      return supertest(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(200);
    });

    const requiredFields = ['username', 'password', 'confirmPass'];
    requiredFields.forEach((field) => {
      it('responds with 400 if fields are missing', () => {
        let attempt = {
          username: testUser.username,
          password: testUser.password,
          confirmPass: testUser.confirmPass,
        };

        delete attempt[field];

        return supertest(app)
          .post('/api/users/register')
          .send(attempt)
          .expect(400);
      });
    });
  });
});
