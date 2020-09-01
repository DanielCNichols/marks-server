require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
require('./config/database');
require('./models/User');
require('./models/Bookmark');
const BookmarksRouter = require('./routes/bookmarks');
const UserRouter = require('./routes/users');

const app = express();

const { CLIENT_ORIGIN } = require('./config/config');

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';

console.log(CLIENT_ORIGIN);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(morganSetting));
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);
app.use('/api/users', UserRouter);
app.use('/api/bookmarks', BookmarksRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (process.env.NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
