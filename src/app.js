require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

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

//For this, we will use an embedded document pattern where we will store the users bookmarks as an array of objects in the user schema.

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
  password: { type: String, required: true },
  bookmarks: { type: [bookmarkSchema] }, //The bookmark value defaults to an empty array implicitly.
});

const Bookmark = mongoose.model("Bookmark", bookmarkSchema);
const User = mongoose.model("User", userSchema);

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

//get bookmarks is not needed, as the bookmark is an embedded document.
/* app.get("/bookmarks", async (req, res, next) => {
  const bookmarks = await Bookmark.find();
  res.send(bookmarks);
});
 */

/* When we create a bookmark, we need to:
    1. Post the bookmark document
    2. Find the appropriate user document..
    3. Add the bookmark to the user's bookmark collection via an update.
    4. send the created bookmark back to the client to get added in with the id.  
*/

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
    console.log(mark)

    //2 and 3.

    await User.updateOne({ _id: userId }, { $push: { bookmarks: mark } });

    //4.
    res.send(mark);
  } catch (error) {
    next(error);
  }
});

//NOTE: Delete returns only a confirmation that something has been deleted, not the item. Delete client side using method, only if the res is ok.
app.delete("/bookmarks/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    let resp = await Bookmark.deleteOne({ _id: id });
    res.send(resp);
  } catch (error) {
    next(error);
  }
});

//We will be accepting the updated item, and the necessary modifiactions will be shown trhough service method client-side.

/* we need to 
    1. update the bookmark document
    2. find the user document
    3. find the bookmark in the bookmark array
    4. update the bookmark in the user document. 

    bookid = 5ea71b8e9cde9501df6f9a74
    userId = 5ea7129dd805a37a738396ad
*/

app.patch("/bookmarks/:id", async (req, res, next) => {
  try {
    let { title, desc, rating, url, userId } = req.body;
    console.log(req.body);
    let { id } = req.params;
    let resp = await Bookmark.updateOne(
      { _id: id },
      {$set: {
          'title': title, 'desc': desc, 'rating': rating, 'url': url
      }}
    );

    await User.update(
      { _id: userId, "bookmarks._id": id },
      {
        $set: {
          "bookmarks.$": {
            title: title,
            desc: desc,
            rating: rating,
            url: url,
          },
        },
      },
    );

    

    res.send("updated");
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
