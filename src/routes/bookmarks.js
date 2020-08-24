const mongoose = require('mongoose');
const express = require('express');
const BookmarkRouter = express.Router();
const Bookmark = mongoose.model('Bookmark');
const passport = require('passport');
require('../config/passport')(passport);

BookmarkRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    let bookmarks = await Bookmark.find({ userId: req.user }).exec();
    res.send(bookmarks);
  }
);

BookmarkRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    let { bookmark } = req.body;
    bookmark.userId = req.user;
    const newBookmark = new Bookmark(bookmark);

    newBookmark.save();
    res.send('ok');
  }
);

BookmarkRouter.route('/:id')
  .all(passport.authenticate('jwt', { session: false }))
  .get(async (req, res, next) => {
    let bookmark = await Bookmark.findById(req.params.id);
    res.send(bookmark);
  })
  .delete(async (req, res, next) => {
    await Bookmark.findByIdAndDelete(req.params.id);

    res.send('ok');
  })
  .patch(async (req, res, next) => {
    let { bookmark } = req.body;

    await Bookmark.findByIdAndUpdate(req.params.id, bookmark);

    res.send('ok');
  });

module.exports = BookmarkRouter;
