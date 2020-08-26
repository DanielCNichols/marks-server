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
    console.log('cleared');
    console.log(req.user);
    let bookmarks = await Bookmark.find({ userId: req.user }).exec();
    res.send(bookmarks);
  }
);

BookmarkRouter.post(
  '/',
  passport.authenticate('jwt', { session: false }),
  async (req, res, next) => {
    console.log('in the route');
    console.log(req.body);
    let { bookmark } = req.body;
    bookmark.userId = req.user;
    const newBookmark = new Bookmark(bookmark);

    let mark = await newBookmark.save();
    res.send(mark);
  }
);

BookmarkRouter.route('/:id')
  .all(passport.authenticate('jwt', { session: false }))
  .get(async (req, res, next) => {
    try {
      //Check to see if the value is the right type
      if (mongoose.Types.ObjectId.isValid(req.params.id) !== true) {
        throw new Error('Item not found: Invalid ID');
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
        throw new Error('Item not found: Invalid ID');
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
      let { updated } = req.body;
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        throw new Error('Item not found:Invalid ID');
      }

      let newBookmark = await Bookmark.findByIdAndUpdate(
        req.params.id,
        updated,
        {
          new: true,
        }
      );

      if (!newBookmark) {
        throw new Error('Bookmark not found');
      }

      res.send(newBookmark);
    } catch (error) {
      next(error);
    }
  });

module.exports = BookmarkRouter;
