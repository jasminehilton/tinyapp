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
    email: "a@a.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
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
    email: req.cookies["email"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
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
  const templateVars = {
    email: req.cookies["email"],
  };
  res.render("_signup", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  res.render("_login", templateVars);
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
  const email = req.body.email;
  const password = req.body.password;

  // make sure email or password are not empty
  if (!email || !password) {
    return res.status(400).send(`no email and/or password was provided`);
  }

  // make sure that the email doesn't match else "its a match"
  for (const userId in users) {
    const user = users[userId];
    // if email is found then compare the password too
    if (user.email === email && user.password === password) {
      res.cookie("email", email);
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
    // if email is there but the password is incorrect then send back 403
    else if (user.email === email && user.password !== password) {
      res.status(403).send("email matches, password incorrect");
    }
  }

  res.status(403).send("email does not exist");

});

app.post("/logout", (req, res) => {
  const email = req.body.email;
  res.clearCookie("email");
  res.clearCookie("user_id");
  res.redirect("/login");
  // possibly put the js that is in the header file here one day

});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  
  // make sure email or password are not empty
  if (!email || !password) {
    return res.status(400).send(`no email and/or password was provided`);
  }

  // make sure that the email doesn't exist
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      console.log(' found a matching email');
      console.log("email=" , email, "user=" , user, "users[userId]=" ,users[userId]);
      return res.status(400).send("cant use the same email");
    }
  }

  // add the unique user in the users list
  users[id] = {
    id: id,
    email: email,
    password: password,
  };
  res.cookie("user_id", id);
  res.redirect("/urls",);
});
