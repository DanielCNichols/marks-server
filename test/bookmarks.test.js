require('dotenv').config();
const app = require('../src/app');
const mongoose = require('mongoose');
const supertest = require('supertest');
const User = mongoose.model('User');
const Bookmark = mongoose.model('Bookmark');
const bcrypt = require('bcryptjs');
const { expect } = require('chai');
const jwt = require('jsonwebtoken');

const testUser = {
  _id: '5f4cd7b8253939168c917b4b',
  username: 'testface',
  password: bcrypt.hashSync('Pass123'),
  confirmPass: 'Pass123',
};

const testBookmarks = [
  {
    _id: '5f4ce2f90cab770e8c2da014',
    userId: '5f4cd7b8253939168c917b4b',
    title: 'test title',
    desc: 'test description',
    rating: 3,
    url: 'https://www.reddit.com',
  },
  {
    _id: '5f4ce2f90cab770e8c2da015',
    userId: '5f4cd7b8253939168c917b4b',
    title: 'another test title',
    desc: 'test description',
    rating: 3,
    url: 'https://www.reddit.com',
  },
  {
    _id: '5f4ce2f90cab770e8c2da016',
    userId: '5f4cd7b8253939168d917b4b',
    title: 'shouldnt see this title',
    desc: 'hope we dont see this description',
    rating: 3,
    url: 'https://www.nope.com',
  },
];

describe('Bookmark endpoints', () => {
  describe('GET /api/bookmarks/', () => {
    it('responds with 200 and a empty array when user logged in and no bookmarks', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);

      supertest(app)
        .get('/api/bookmarks')
        .set('authorization', makeAuthHeader(testUser))
        .expect(200)
        .then((res) => {
          expect(res.body).to.be.an('array');
          expect(res.body).to.eql([]);
        });
    });

    it('responds with a list of bookmarks if present', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      return supertest(app)
        .get('/api/bookmarks')
        .set('authorization', makeAuthHeader(testUser))
        .expect(200)
        .then((res) => {
          expect(res.body).to.be.an('array');
          // expect(res.body).to.eql([]);
        });
    });

    it('rejects when user is not logged in', () => {
      return supertest(app).get('/api/bookmarks').expect(401);
    });
  });

  describe('POST /api/bookmarks', () => {
    let bookmark = {
      userId: '5f4cd7b8253939168c917b4b',
      title: 'new title',
      desc: 'new desc',
      rating: 5,
      url: 'https://www.new.com',
    };
    it('responds with new bookmark if correctly entered', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      return supertest(app)
        .post('/api/bookmarks')
        .set('authorization', makeAuthHeader(testUser))
        .send({ bookmark })
        .expect(200)
        .then((res) => {
          expect(res.body).to.be.an('object');
          expect(res.body.userId).to.eql(bookmark.userId);
          expect(res.body.title).to.eql(bookmark.title);
          expect(res.body.desc).to.eql(bookmark.desc);
          expect(res.body.rating).to.eql(bookmark.rating);
          expect(res.body.url).to.eql(bookmark.url);
        });
    });

    let requiredFields = ['url', 'title', 'rating'];

    requiredFields.forEach((field) => {
      it('rejects if title, url, or rating is missing', async () => {
        await User.remove({});
        await Bookmark.remove({});
        await User.create(testUser);
        await Bookmark.insertMany(testBookmarks);
        let bookmark = {
          userId: '5f4cd7b8253939168c917b4b',
          title: 'an abject failure',
          desc: 'new desc',
          rating: 5,
          url: 'https://www.new.com',
        };

        delete bookmark[field];

        return supertest(app)
          .post('/api/bookmarks')
          .set('authorization', makeAuthHeader(testUser))
          .send({ bookmark })
          .expect(400);
      });
    });
  });

  describe('DELETE /api/bookmarks/:id', () => {
    it('rejects if the id is invalid', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);
      return supertest(app)
        .delete('/api/bookmarks/sdf')
        .set('authorization', makeAuthHeader(testUser))
        .expect(404)
        .then((res) => {
          expect(res.body.error).to.eql('Bookmark not found');
        });
    });

    it('rejects if user not logged in', () => {
      return supertest(app)
        .delete(`/api/bookmarks/${testBookmarks[1]._id}`)
        .expect(401);
    });

    it('successfully deletes the bookmark responding 204', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      return supertest(app)
        .delete(`/api/bookmarks/${testBookmarks[0]._id}`)
        .set('Authorization', makeAuthHeader(testUser))
        .expect(204);
    });
  });
});

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign(
    { id: testUser._id, username: testUser.username },
    secret,
    {
      subject: user.username,
      algorithm: 'HS256',
    }
  );
  console.log('this is the token', token);
  return token;
}

// const token =
//   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVmNGNkN2I4MjUzOTM5MTY4YzkxN2I0YiIsInVzZXJuYW1lIjoidGVzdGZhY2UiLCJpYXQiOjE1OTg4NzgxMDEsInN1YiI6InRlc3RmYWNlIn0.ZuUKL8MKb4xlnm4psYxHi5xYrFohdvzVf7qhGBm33nA';
