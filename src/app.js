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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('common'));
app.use(helmet());
app.use(cors());
app.use('/api/users', UserRouter);
app.use('/api/bookmarks', BookmarksRouter);

app.get('/', (req, res) => {
  res.send('Hello, World!');
});

let NODE_ENV = 'test';

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
