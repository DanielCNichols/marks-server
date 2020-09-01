# Marks API

By Daniel Nichols

## Overview

Marks is a bookmarking application inspired by the ubiquitous text editor, Vim, with stylistic cues taken from the fabulous Monokai color scheme.

Simple and straightforward, Marks allows users to create their own account, login, and quickly get started saving their favorite websites.

## Getting Started

1. Clone this repository to your local machine using `git clone`
2. `cd` into the newly cloned repository
3. Start clean Git history by running `rm -rf .git && git init`
4. Install the necessary dependencies with `npm install`
5. Move the `example.env` file to `.env` which will be ignored.
6. Create your own MongoDB collection for this project
7. Update your environment variables in the .env file
8. Run tests to ensure proper setup with `npm t`

## Technologies Used

Backend Technologies:

- Nodejs
- Express.js
- Passport.js
- JSON Web Tokens
- MongoDB (with Mongoose)
- Mocha
- Chai
- Supertest

Frontend Technologies

- React
- CSS modules

## Routes

### /api/users

#### POST: /api/users/register

The post route takes an object containing a username, password, and confirmed password. It checks that all fields are present, the passwords match, and that the password is between 6 and 30 characters. If good, we check to see that the username is not already in use. If all checks pass, the new username is sent back as confirmation.

```js
//example req.body
req.body = {
  username: "daniel"
  password: "Pass123",
  confirm: "Pass123"
}


//Example Response
{
  username: "daniel"
}


//Example error object:

{
  error.password: 'password must be between 6 and 30 characters',
  error.username: 'username is required'
}
```

### /api/users

#### POST /api/users/login

The login route takes in a username and password, checking against credentials persisted in a database. If checks clear, it returns an object noting success and a signed JSON Web Token.

```js
//example req.body
req.body {
  username: 'daniel',
  password: 'Pass123
}

//Example response
{
  success: true,
  token: 'dkafndof808972340u1hahsdfasdfasd98fdfh13rh12r897df"
}
```

### /api/bookmarks

#### GET /api/bookmarks

The GET route requires a valid JSON Web Token in the format "bearer <<'token'>>" be sent in the "Authorization" header, else it will reject. If successful, this route returns all bookmarks belonging to the user.

```js
//Example Response
[
  {
    _id: "5f4ea3192f6b1b00044b55e6O",
    title: "Reddit"
    url: "https://www.reddit.com"
    desc: "The front page of the internet!"
    rating: "5"
    userId:"5f4e8ef0a1fa0b0004a440a7"
    __v:0
  },
  {
    _id: "5f4ea3192f6b1b00044b55e34",
    title: "Twitter"
    url: "https://www.twitter.com"
    desc: "It's a social networking site."
    rating: "5"
    userId:"5f4e8ef0a1fa0b0004a440a7"
    __v:0
  },
]
```

#### POST /api/bookmarks

The POST route requires a valid JSON Web Token in the format "bearer <<'token'>>" be sent in the "Authorization" header, else it will reject. It accepts an object, "bookmark", with title, valid url, rating, and description. If successful, will return a newly created bookmark.

```js
//example req.body
bookmark: {
  title: "Facebook",
  url: "https://www.facebook.com",
  rating: 3,
  desc: "I can't believe I've been on this site for 15 years..." //Optional
}

//Example Response
{
  _id: "5f4ea3192f6b1b00044b55e6O",
  userId:"5f4e8ef0a1fa0b0004a440a7"
  title: "Facebook",
  url: "https://www.facebook.com",
  rating: 3,
  desc: "I can't believe I've been on this site for 15 years..."
  __v: 0
}
```

### /api/bookmarks/:id

#### DELETE /api/bookmarks/:id

The DELETE route requires a valid JSON Web Token in the format "bearer <<'token'>>" be sent in the "Authorization" header, else it will reject. It takes a valid MongoDB ObjectID as a route parameter, and will respond with 204 if deletion is successful. Else, will respond with 404 and `{error: bookmark not found}`

#### PATCH /api/bookmarks/:id

The PATCH route requires a valid JSON Web Token in the format "bearer <<'token'>>" be sent in the "Authorization" header, else it will reject. It takes a valid MongoDB ObjectID as a route parameter, and expects an object, "updated", in the request body.

```js
//Example req.body
updated: {
  userId:"5f4e8ef0a1fa0b0004a440a7"
  title: "updatedBookmark",
  url: "https://www.updated.com",
  rating: 3,
  desc: "I hope this updates..."
}

//Example response
{
  _id: "5f4ea3192f6b1b00044b55e6O",
  userId:"5f4e8ef0a1fa0b0004a440a7"
  title: "updatedBookmark",
  url: "https://www.updated.com",
  rating: 3,
  desc: "I hope this updates..."
  __v: 1
}
```

### Contact

Thanks for checking out the Marks repo. Issues? Props? Just want to chat? Feel free to contact me at herrnichols@gmail.com.
