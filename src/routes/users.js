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
require('../config/passport')(passport);

UserRouter.get(
  '/protected',
  passport.authenticate('jwt', { session: false }),
  (req, res, next) => {
    res.send(req.user);
  }
);

UserRouter.post('/register', bodyParser, async (req, res, next) => {
  try {
    const { errors, isValid } = registrationValidator(req.body);

    if (!isValid) {
      console.log('valid');
      return res.status(400).json(errors);
    }

    const { username, password } = req.body;

    let check = await User.findOne({ username });

    if (check) {
      return res.status(400).json({ username: 'Username already exists' });
    } else {
      const newUser = new User({
        username,
        password,
      });

      bcrypt.genSalt(10, async (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => next(err));
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
    return res.status(404).json({ usernotfound: 'user not found' });
  }

  let isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const payload = {
      id: user.id,
      name: user.name,
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
          token: 'Bearer ' + token,
        });
      }
    );
  } else {
    return res.status(400).json({ password: 'Password incorrect' });
  }
});

module.exports = UserRouter;
