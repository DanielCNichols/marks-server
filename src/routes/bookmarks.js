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
    try {
      let { bookmark } = req.body;

      if (!bookmark.title || !bookmark.url || !bookmark.rating) {
        return res
          .status(400)
          .send({ error: 'Title, url, and rating are reqiured' });
      }
      bookmark.userId = req.user;
      const newBookmark = new Bookmark(bookmark);

      let mark = await newBookmark.save();
      console.log(mark);
      res.send(mark);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

BookmarkRouter.route('/:id')
  .all(passport.authenticate('jwt', { session: false }))
  .delete(async (req, res, next) => {
    try {
      if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).send({ error: 'Bookmark not found' });
      } else {
        let deleted = await Bookmark.findByIdAndDelete(req.params.id);

        if (deleted === null) {
          res.status(404).send({ error: 'Bookmark not found' });
        }

        res.status(204).end();
      }
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
