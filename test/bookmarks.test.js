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
    __v: 0,
    _id: '5f4ce2f90cab770e8c2da014',
    userId: '5f4cd7b8253939168c917b4b',
    title: 'test title',
    desc: 'test description',
    rating: 3,
    url: 'https://www.reddit.com',
  },
  {
    __v: 0,
    _id: '5f4ce2f90cab770e8c2da015',
    userId: '5f4cd7b8253939168c917b4b',
    title: 'another test title',
    desc: 'test description',
    rating: 3,
    url: 'https://www.reddit.com',
  },
  {
    __v: 0,
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

      let res = await supertest(app)
        .get('/api/bookmarks')
        .set('authorization', makeAuthHeader(testUser));

      expect(res.status).to.eql(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.eql([]);
    });

    it('responds with a list of bookmarks if present', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      let res = await supertest(app)
        .get('/api/bookmarks')
        .set('authorization', makeAuthHeader(testUser));

      expect(res.status).to.eql(200);
      expect(res.body).to.be.an('array');
      expect(res.body).to.eql(testBookmarks.slice(0, -1));
    });

    it('rejects when user is not logged in', async () => {
      let res = await supertest(app).get('/api/bookmarks');

      expect(res.status).to.eql(401);
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

      let res = await supertest(app)
        .post('/api/bookmarks')
        .set('authorization', makeAuthHeader(testUser))
        .send({ bookmark });

      expect(res.status).to.eql(200);
      expect(res.body).to.be.an('object');
      expect(res.body.userId).to.eql(bookmark.userId);
      expect(res.body.title).to.eql(bookmark.title);
      expect(res.body.desc).to.eql(bookmark.desc);
      expect(res.body.rating).to.eql(bookmark.rating);
      expect(res.body.url).to.eql(bookmark.url);
    });

    let requiredFields = ['url', 'title', 'rating'];

    requiredFields.forEach(field => {
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

        let res = await supertest(app)
          .post('/api/bookmarks')
          .set('authorization', makeAuthHeader(testUser))
          .send({ bookmark });

        expect(res.status).to.eql(400);
        expect(res.body.error).to.eql('Title, url, and rating are required');
      });
    });

    it('removes XSS content', async () => {
      await Bookmark.remove({});
      await User.remove({});
      await User.create(testUser);

      let bookmark = {
        title: 'A Foul Name <script>alert("xss");</script>',
        url: 'https://www.anasty<script>alert("watchOut")</script>site.com',
        rating: 2,
        desc: 'The horror. The horror.',
      };

      let res = await supertest(app)
        .post(`/api/bookmarks`)
        .set('authorization', makeAuthHeader(testUser))
        .send({ bookmark });

      expect(res.status).to.eql(200);
      expect(res.body.title).to.eql(
        'A Foul Name &lt;script&gt;alert("xss");&lt;/script&gt;'
      );
      expect(res.body.url).to.eql(
        'https://www.anasty&lt;script&gt;alert("watchOut")&lt;/script&gt;site.com'
      );
      expect(res.body.rating).to.eql(bookmark.rating);
      expect(res.body.desc).to.eql(bookmark.desc);
    });
  });

  describe('DELETE /api/bookmarks/:id', () => {
    it('rejects if the id is invalid', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      let res = await supertest(app)
        .delete('/api/bookmarks/sdf')
        .set('authorization', makeAuthHeader(testUser));

      expect(res.status).to.eql(404);
      expect(res.body.error).to.eql('Bookmark not found');
    });

    it('rejects if user not logged in', async () => {
      let res = await supertest(app).delete(
        `/api/bookmarks/${testBookmarks[1]._id}`
      );

      expect(res.status).to.eql(401);
    });

    it('successfully deletes the bookmark responding 204', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      let res = await supertest(app)
        .delete(`/api/bookmarks/${testBookmarks[0]._id}`)
        .set('Authorization', makeAuthHeader(testUser));

      expect(res.status).to.eql(204);
    });
  });

  describe('Patch /api/bookmarks/:id', async () => {
    it('updates the bookmark successfully', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);
      let updated = {
        _id: '5f4ce2f90cab770e8c2da014',
        userId: '5f4cd7b8253939168c917b4b',
        title: 'be updated',
        desc: 'get updated',
        rating: 4,
        url: 'https://www.updates4dayzzz.com',
      };

      let res = await supertest(app)
        .patch(`/api/bookmarks/${updated._id}`)
        .set('authorization', makeAuthHeader(testUser))
        .send({ updated });

      expect(res.status).to.eql(200);
      expect(res.body._id).to.eql(updated._id);
      expect(res.body.title).to.eql(updated.title);
      expect(res.body.desc).to.eql(updated.desc);
      expect(res.body.rating).to.eql(updated.rating);
      expect(res.body.url).to.eql(updated.url);
    });

    const requiredFields = ['title', 'url', 'rating'];

    requiredFields.forEach(field => {
      it('rejects with 400 if required fields missing', async () => {
        await User.remove({});
        await Bookmark.remove({});
        await User.create(testUser);
        await Bookmark.insertMany(testBookmarks);

        let updated = {
          _id: '5f4ce2f90cab770e8c2da014',
          userId: '5f4cd7b8253939168c917b4b',
          title: 'be updated',
          desc: 'get updated',
          rating: 4,
          url: 'https://www.updates4dayzzz.com',
        };

        delete updated[field];

        let res = await supertest(app)
          .patch(`/api/bookmarks/${updated._id}`)
          .set('authorization', makeAuthHeader(testUser))
          .send({ updated });

        expect(res.status).to.eql(400);
        expect(res.body.error).to.eql('Title, url, and rating are required');
      });
    });

    it('rejects with 401 if invalid credentials', async () => {
      return supertest(app)
        .patch(`/api/bookmarks/${testBookmarks[0]._id}`)
        .expect(401);
    });
    it('rejects with 404 if invalid object id', async () => {
      await User.remove({});
      await Bookmark.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      let res = await supertest(app)
        .patch(`/api/bookmarks/1234`)
        .set('authorization', makeAuthHeader(testUser));

      expect(res.status).to.eql(404);
      expect(res.body.error).to.eql('Invalid ID. Bookmark not found');
    });

    it('removes xss content', async () => {
      await Bookmark.remove({});
      await User.remove({});
      await User.create(testUser);
      await Bookmark.insertMany(testBookmarks);

      let updated = {
        _id: '5f4ce2f90cab770e8c2da014',
        userId: '5f4cd7b8253939168c917b4b',
        title: 'A Foul Name <script>alert("xss");</script>',
        url: 'https://www.anasty<script>alert("watchOut")</script>site.com',
        rating: 2,
        desc: 'The horror. The horror.',
      };

      let res = await supertest(app)
        .patch(`/api/bookmarks/${updated._id}`)
        .set('authorization', makeAuthHeader(testUser))
        .send({ updated });

      expect(res.status).to.eql(200);
      expect(res.body.title).to.eql(
        'A Foul Name &lt;script&gt;alert("xss");&lt;/script&gt;'
      );
      expect(res.body.url).to.eql(
        'https://www.anasty&lt;script&gt;alert("watchOut")&lt;/script&gt;site.com'
      );
      expect(res.body.rating).to.eql(updated.rating);
      expect(res.body.desc).to.eql(updated.desc);
      expect(res.body.userId).to.eql(updated.userId);
      expect(res.body._id).to.eql(updated._id);
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

  return token;
}
