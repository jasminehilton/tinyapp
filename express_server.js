const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

//============================================= USE

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

//============================================= GLOBAL CONST

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};
const users = {
  userRandomID: {
    id: "userRandomID",
    // username: "a123",                        //change this
    email: "a@a.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    // username: "b456",                        //change this
    email: "b@b.com",
    password: "456",
  },
};

const generateRandomString = function() {
  // Math.random().tostring(36).substring(2, 5); // alternative generator
  return (+new Date() * Math.random()).toString(36).substring(0, 6);
};

//============================================= LISTEN

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//============================================= GET

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    // username: req.cookies["username"],                        //change this
    email: req.cookies["email"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    // username: req.cookies["username"],                        //change this
    email: req.cookies["email"],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  console.log(req.body);
  const templateVars = {
    // username: req.cookies["username"],                        //change this
    email: req.cookies["email"],
  };
  res.render("_signup", templateVars);
});

//============================================= POST

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect(`/urls`);
});

app.post("/urls/:id", (req, res) => {
  console.log("here");
  const shortUrl = req.params.id;
  const updatedLongUrl = req.body.longURL;
  console.log("updatedLongUrl ", updatedLongUrl);
  urlDatabase[shortUrl] = updatedLongUrl;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  // const username = req.body.username;                        //change this
  const email = req.body.email;
  // res.cookie("username", username);                        //change this
  res.cookie("email", email);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // res.clearCookie("username");                        //change this
  res.clearCookie("email");
  res.redirect("/urls");
// possibly put the js that is in the header file here one day
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  // const username = req.body.username;                        //change this
  const email = req.body.email;
  const password = req.body.password;
  
  // console.log(email);
  if (!email || !password) {
    return res.status(400).send(`no email and/or password was provided`);
  }


  let foundEmail = null;

  for (const userId in users) {
    // console.log("email=",email, "users[userId].email=",users[userId].email, "users=",users, "userId=",userId);
    const user = users[userId];
    if (user.email === email) {
      console.log(' found a matching email');
      console.log("email=" , email, "user=" , user, "users[userId]=" ,users[userId]);
      return res.status(400).send("cant use the same email");
    }
  }

  users[id] = {
    id: id,
    // username: username,                        //change this
    email: email,
    password: password,
  };



  res.cookie("user_id", id);
  res.redirect("/urls",);
});



// // POST /login
// app.post('/login', (req, res) => {
//   // pull the data off the body object
//   const username = req.body.username;
//   const password = req.body.password;

//   // did they NOT give us a username or password
//   if (!username || !password) {
//     res.status(400);
//     return res.send('you must provide a username and password');
//   }

//   // look up the user based on their username
//   let foundUser = null;

//   for (const userId in users) {
//     const user = users[userId];
//     if (user.username === username) {
//       // yay! we found our user!
//       foundUser = user;
//     }
//   }

//   // did we NOT find a user?
//   if (!foundUser) {
//     return res.status(400).send('no user with that username found');
//   }

//   // compare the passwords (do they NOT match)
//   if (foundUser.password !== password) {
//     return res.status(400).send('passwords do not match');
//   }

//   // happy path!!!
//   // set a cookie
//   res.cookie('userId', foundUser.id);

//   // redirect the user somewhere
//   res.redirect('/protected');
// });

