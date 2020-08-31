const mongoose = require('mongoose');
const express = require('express');
const UserRouter = express.Router();
const registrationValidator = require('../utils/registrationValidator');
const loginValidator = require('../utils/loginValidator');
const bodyParser = express.json();
const User = mongoose.model('User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const xss = require('xss');
require('../config/passport')(passport);

UserRouter.post('/register', bodyParser, async (req, res, next) => {
  try {
    const { errors, isValid } = registrationValidator(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { username, password } = req.body;

    let check = await User.findOne({ username });

    if (check) {
      return res.status(400).json({ username: 'Username already exists' });
    } else {
      let cleanedUser = {
        username: xss(username),
        password: xss(password),
      };
      const newUser = new User(cleanedUser);

      bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.send({ username: user.username }))
            .catch((err) => next(err));
        });
      });
    }
  } catch (error) {
    next(error);
  }
});

UserRouter.post('/login', async (req, res, next) => {
  const { errors, isValid } = loginValidator(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { username, password } = req.body;

  let user = await User.findOne({ username: username });

  if (!user) {
    return res.status(404).json({ error: 'Invalid username or password' });
  }

  let isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const payload = {
      id: user._id,
      username: user.username,
    };

    jwt.sign(
      payload,
      'secret',
      {
        expiresIn: 10800,
      },
      (err, token) => {
        res.json({
          success: true,
          token,
        });
      }
    );
  } else {
    return res.status(400).json({ error: 'Invalid username or password' });
  }
});

module.exports = UserRouter;
