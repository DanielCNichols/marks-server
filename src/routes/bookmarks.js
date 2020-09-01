const mongoose = require('mongoose');
const express = require('express');
const BookmarkRouter = express.Router();
const Bookmark = mongoose.model('Bookmark');
const passport = require('passport');
const xss = require('xss');
require('../config/passport')(passport);

BookmarkRouter.get(
  '/',
  passport.authenticate('jwt', { session: false }),

  async (req, res, next) => {
    try {
      let bookmarks = await Bookmark.find({ userId: req.user }).exec();
      res.send(bookmarks);
    } catch (error) {
      next(error);
    }
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
          .send({ error: 'Title, url, and rating are required' });
      }

      let cleanedBookmark = {
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        desc: xss(bookmark.desc),
        rating: xss(bookmark.rating),
      };

      cleanedBookmark.userId = req.user;
      const newBookmark = new Bookmark(cleanedBookmark);

      let mark = await newBookmark.save();
      res.send(mark);
    } catch (error) {
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
        return res
          .status(404)
          .send({ error: 'Invalid ID. Bookmark not found' });
      }

      if (!updated.title || !updated.url || !updated.rating) {
        return res
          .status(400)
          .send({ error: 'Title, url, and rating are required' });
      }

      let cleanedUpdate = {
        title: xss(updated.title),
        desc: xss(updated.desc),
        rating: xss(updated.rating),
        url: xss(updated.url),
        userId: xss(updated.userId),
      };

      let newBookmark = await Bookmark.findByIdAndUpdate(
        req.params.id,
        cleanedUpdate,
        {
          new: true,
        }
      );

      if (!newBookmark) {
        return res.status(400).send({ error: 'Bookmark not found' });
      }

      res.send(newBookmark);
    } catch (error) {
      next(error);
    }
  });

module.exports = BookmarkRouter;
