const app = require('../src/app');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = mongoose.model('User');
const { expect } = require('chai');
const helpers = require('./test-helpers');

describe('User endpoints', () => {
  describe(`POST /api/users/register`, () => {
    beforeEach('cleanup users', async () => {
      await User.remove({});
    });

    afterEach('cleanup users', async () => {
      await User.remove({});
    });

    it('responds with 200 when valid user is registered', async () => {
      let regUser = helpers.makeUserRegistration();
      let res = await supertest(app)
        .post('/api/users/register')
        .send(regUser);

      expect(res.status).to.eql(200);
      expect(res.body.username).to.eql(regUser.username);
    });

    const requiredFields = ['username', 'password', 'confirmPass'];
    requiredFields.forEach(field => {
      it('responds with 400 if fields are missing', async () => {
        let attempt = helpers.makeUserRegistration();

        delete attempt[field];

        let res = await supertest(app)
          .post('/api/users/register')
          .send(attempt);

        expect(res.status).to.eql(400);
      });
    });

    it('rejects if the username already exists', async () => {
      let testUser = helpers.makeUserRegistration();
      await User.create(testUser);

      let res = await supertest(app)
        .post('/api/users/register')
        .send(testUser);

      expect(res.status).to.eql(400);
    });

    it('removes xss content', async () => {
      await User.remove({});

      let maliciousAttempt = helpers.makeMaliciousUser();

      let res = await supertest(app)
        .post('/api/users/register')
        .send(maliciousAttempt);

      expect(res.status).to.eql(200);
      expect(res.body.username).to.eql(
        'Whata&lt;script&gt;alert(naughty)&lt;/script&gt;name'
      );
    });
  });

  describe('POST /api/users/login', () => {
    let testUser = helpers.makeTestUser();
    beforeEach('before the login', async () => {
      await User.create(testUser);
    });
    afterEach('after login', async () => {
      await User.remove({});
    });

    it('returns 200 with a valid login and token', async () => {
      let login = {
        username: testUser.username,
        password: 'Pass123',
      };

      let res = await supertest(app)
        .post('/api/users/login')
        .send(login);

      expect(res.status).to.eql(200);
      expect(res.body).to.haveOwnProperty('token');
    });

    let requiredFields = ['username', 'password'];

    requiredFields.forEach(field => {
      it('rejects if credentials are missing', async () => {
        let login = {
          username: testUser.username,
          password: 'Pass123',
        };
        delete login[field];

        let res = await supertest(app)
          .post('/api/users/login')
          .send(login);

        expect(res.status).to.eql(400);
      });
    });

    it('rejects if username does not exist', async () => {
      let login = {
        username: 'IdontevenknowwhoIamanymore',
        password: 'notImportantanyway',
      };

      let res = await supertest(app)
        .post('/api/users/login')
        .send(login);

      expect(res.status).to.eql(400);
      expect(res.body.error).to.eql('Invalid username or password');
    });

    it('rejects if invalid password', async () => {
      let login = {
        username: testUser.username,
        password: 'urongdoe',
      };

      let res = await supertest(app)
        .post('/api/users/login')
        .send(login);

      expect(res.status).to.eql(400);
      expect(res.body.error).to.eql('Invalid username or password');
    });
  });
});
