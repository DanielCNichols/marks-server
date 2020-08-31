const app = require('../src/app');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const loginValidator = require('../src/utils/loginValidator');

const testUser = {
  username: 'testface',
  password: bcrypt.hashSync('Pass123'),
  confirmPass: 'Pass123',
};

const regUser = {
  username: 'testface',
  password: 'Pass123',
  confirmPass: 'Pass123',
};

describe('User endpoints', () => {
  // after('disconnect from db', async () => {
  //   mongoose.connection.close();
  // });
  describe(`POST /api/users/register`, () => {
    beforeEach('before registter', async () => {
      await User.remove({});
    });

    afterEach('after registter', async () => {
      await User.remove({});
    });

    it('responds with 200 when valid user is registered', () => {
      return supertest(app)
        .post('/api/users/register')
        .send(regUser)
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

    it('rejects if the username already exists', async () => {
      await User.create(testUser);

      return supertest(app)
        .post('/api/users/register')
        .send(testUser)
        .expect(400);
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach('before the login', async () => {
      await User.create(testUser);
    });
    afterEach('after login', async () => {
      await User.remove({});
    });

    it('returns 200 with a valid login', async () => {
      let login = {
        username: testUser.username,
        password: 'Pass123',
      };

      return supertest(app).post('/api/users/login').send(login).expect(200);
    });

    let requiredFields = ['username', 'password'];

    requiredFields.forEach((field) => {
      it('rejects if credentials are missing', () => {
        let login = {
          username: testUser.username,
          password: 'Pass123',
        };
        delete login[field];

        supertest(app).post('/api/users/login').send(login).expect(400);
      });
    });

    it('rejects if username does not exist', () => {
      let login = {
        username: 'IdontevenknowwhoIamanymore',
        password: 'notImportantanyway',
      };

      supertest(app).post('/api/users/login').send(login).expect(400);
    });

    it('rejects if invalid password', () => {
      let login = {
        username: testUser.username,
        password: 'urongdoe',
      };

      supertest(app).post('/api/users/login').send(login).expect(400);
    });
  });
});
