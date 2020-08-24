const mongoose = require('mongoose');
const Bookmark = require('./Bookmark');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
mongoose.model('User', userSchema);
