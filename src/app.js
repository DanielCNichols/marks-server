require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const validateRegistrationInput = require("./register");
const validateLoginInput = require("./login");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(
  "mongodb+srv://dcnichols_2020:Psycho78@markit-mp99l.mongodb.net/test?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

//TODO: Look up transactions and how to do them with mongo.
//TODO: refactor into services
//TODO: validation and type checking.

const Schema = mongoose.Schema;

const bookmarkSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  rating: { type: Number, required: true },
  desc: String,
});

const userSchema = new Schema({
  name: { type: String, required: true },
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  bookmarks: { type: [bookmarkSchema] }, //The bookmark value defaults to an empty array implicitly.
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
const User = mongoose.model("User", userSchema);

app.use(passport.initialize());
require("./passport")(passport);

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

//Todo: set up encryption and login

//get all users for testing
app.get("/user", async (req, res, next) => {
  try {
    let resp = await User.find();

    res.send(resp);
  } catch (error) {
    next(error);
  }
});

app.post("/user", async (req, res, next) => {
  try {
    const { name, username, password } = req.body;

    let user = { name, username, password }; //encrypt all the things

    let newUser = new User(user);
    let resp = await newUser.save();

    res.send(resp);
  } catch (error) {
    next(error);
  }
});

app.post("/register", async (req, res, next) => {
  try {
    const { errors, isValid } = validateRegistrationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { username, password, name, email } = req.body;

    let check = await User.findOne({ email });

    if (check) {
      return res.status(400).json({ email: "Email already exists" });
    } else {
      console.log("check passed");
      const newUser = new User({
        name,
        username,
        email,
        password,
      });

     bcrypt.genSalt(10, async (err, salt) => {
        console.log(newUser.password)
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser.save().then(user => res.json(user)).catch(err => console.log(err))
        });
      });
    }
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = req.body;

  let user = await User.findOne({ email: email });

  if (!user) {
    return res.status(404).json({ emailnotfound: "Email not found" });
  }

  let isMatch = await bcrypt.compare(password, user.password);

  if (isMatch) {
    const payload = {
      id: user.id,
      name: user.name,
    };

    jwt.sign(
      payload,
      "secret",
      {
        expiresIn: 10800,
      },
      (err, token) => {
        res.json({
          success: true,
          token: "Bearer " + token,
        });
      }
    );
  } else {
    return res.status(400).json({ password: "Password incorrect" });
  }
});

app.delete("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log(id);

    let resp = await User.deleteOne({ _id: id });
    res.send(resp);
  } catch (error) {
    next(error);
  }
});

app.patch("/user/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    //handle the encryption

    //update the document.
  } catch (error) {
    next(error);
  }
});

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;

  //validate, check, and process.
});

app.post("/bookmarks", async (req, res, next) => {
  try {
    let { title, desc, rating, url, userId } = req.body;

    const newBookmark = {
      title,
      desc,
      rating,
      url,
    };

    //1.
    let newMark = new Bookmark(newBookmark);
    let mark = await newMark.save();

    //2 and 3.

    await User.updateOne({ _id: userId }, { $push: { bookmarks: mark } });

    //4.
    res.send(mark);
  } catch (error) {
    next(error);
  }
});

app.delete("/bookmarks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    await Bookmark.deleteOne({ _id: id }); //delete from the bookmarks collection

    const user = await User.findOne({ _id: userId });
    user.bookmarks = user.bookmarks.filter((b) => b.id !== id);
    await user.save();

    res.send(204).end();
  } catch (error) {
    next(error);
  }
});

app.patch("/bookmarks/:id", async (req, res, next) => {
  try {
    let { title, desc, rating, url, userId } = req.body;
    let { id } = req.params;
    await Bookmark.updateOne(
      { _id: id },
      {
        $set: {
          title: title,
          desc: desc,
          rating: rating,
          url: url,
        },
      }
    );

    let updated = await Bookmark.findOne({ _id: id });

    const user = await User.findOne({ _id: userId });
    user.bookmarks = user.bookmarks.map((b) => {
      return b.id === id ? updated : b;
    });

    await user.save();

    res.send(updated);
  } catch (error) {
    next(error);
  }
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
