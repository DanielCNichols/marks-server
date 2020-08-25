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
    try {
      //Check to see if the value is the right type
      if (mongoose.Types.ObjectId.isValid(req.params.id) !== true) {
        throw new Error('Not a valid Object Id');
      }

      let bookmark = await Bookmark.findById(req.params.id);

      if (bookmark === null) {
        throw new Error('Bookmark not found');
      }
      res.send(bookmark);
    } catch (error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Not a valid Object Id');
      }

      let deleted = await Bookmark.findByIdAndDelete(req.params.id);

      if (deleted === null) {
        throw new Error('Bookmark not found');
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  })
  .patch(async (req, res, next) => {
    try {
      let { bookmark } = req.body;
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Not a valid object id');
      }

      let updated = await Bookmark.findByIdAndUpdate(req.params.id, bookmark, {
        new: true,
      });

      if (!updated) {
        throw new Error('Bookmark not found');
      }

      res.send(updated);
    } catch (error) {
      next(error);
    }
  });

module.exports = BookmarkRouter;
