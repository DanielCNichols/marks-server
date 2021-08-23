const mongoose = require('mongoose');
const { NODE_ENV, DATABASE_URL, TEST_DATABASE_URL } = require('./config');
let connectString;

NODE_ENV === 'development'
  ? (connectString = TEST_DATABASE_URL)
  : (connectString = DATABASE_URL);

console.log(connectString);

mongoose.connect(connectString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
  console.log('Database Connected');
});
