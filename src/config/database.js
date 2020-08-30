require('dotenv').config();
const mongoose = require('mongoose');
let connectString;

process.env.NODE_ENV === 'test'
  ? (connectString = process.env.TEST_DATABASE_URL)
  : (connectString = process.env.DATABASE_URL);

console.log(connectString);

mongoose.connect(connectString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on('connected', () => {
  console.log('Database Connected');
});
