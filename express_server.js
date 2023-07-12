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
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  // const username = req.body.username;                        //change this
  const email = req.body.email;
  const password = req.body.password;
  users[id] = {
    id: id,
    // username: username,                        //change this
    email: email,
    password: password,
  };
  console.log(users);
  res.cookie("user_id", id);
  res.redirect("/urls",);
});
