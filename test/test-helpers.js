const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function makeTestUser() {
  return {
    _id: '5f4cd7b8253939168c917b4b',
    username: 'testface',
    password: bcrypt.hashSync('Pass123'),
    confirmPass: 'Pass123',
  };
}

function makeMaliciousUser() {
  return {
    username: 'Whata<script>alert(naughty)</script>name',
    password: 'Pass123',
    confirmPass: 'Pass123',
  };
}

function makeUserRegistration() {
  return {
    username: 'testface',
    password: 'Pass123',
    confirmPass: 'Pass123',
  };
}

function makeTestBookmarks() {
  return [
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
}

function makeMaliciousBookmark() {
  return {
    title: 'A Foul Name <script>alert("xss");</script>',
    url: 'https://www.anasty<script>alert("watchOut")</script>site.com',
    rating: 2,
    desc: 'The horror. The horror.',
  };
}

function makeMaliciousUpdatedBookmark() {
  return {
    _id: '5f4ce2f90cab770e8c2da014',
    userId: '5f4cd7b8253939168c917b4b',
    title: 'A Foul Name <script>alert("xss");</script>',
    url: 'https://www.anasty<script>alert("watchOut")</script>site.com',
    rating: 2,
    desc: 'The horror. The horror.',
  };
}

function makeUpdatedBookmark() {
  return {
    _id: '5f4ce2f90cab770e8c2da014',
    userId: '5f4cd7b8253939168c917b4b',
    title: 'be updated',
    desc: 'get updated',
    rating: 4,
    url: 'https://www.updates4dayzzz.com',
  };
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ id: user._id, username: user.username }, 'secret', {
    expiresIn: 13800,
  });

  return token;
}

module.exports = {
  makeAuthHeader,
  makeMaliciousBookmark,
  makeTestBookmarks,
  makeTestUser,
  makeUpdatedBookmark,
  makeUserRegistration,
  makeMaliciousUser,
  makeMaliciousUpdatedBookmark,
};
