const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080
const bcrypt = require("bcryptjs");


//============================================= USE

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

//============================================= GLOBAL CONST

// const urlDatabase = {
//   b2xVn2: "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com",
// };

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  Psm5xK: {
    longURL:  "http://www.google.com",
    userID:  "user2RandomID",
  },
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

// const password = "purple-monkey-dinosaur"; // found in the req.body object
//   const hashedPassword = bcrypt.hashSync(password, 10);
//   console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
//   console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false

const generateRandomString = function() {
  // Math.random().tostring(36).substring(2, 5); // alternative generator
  return (+new Date() * Math.random()).toString(36).substring(0, 6);
};

const urlsForUser = function(userID) {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === userID) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

//============================================= LISTEN

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//============================================= GET

app.get("/", (req, res) => {
  return res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  return res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const userURLs = urlsForUser(userID);
  const templateVars = {
    urls: userURLs,                               
    email: req.cookies["email"],
  };
  if (!templateVars.email) {
    return res.redirect("/login");
  }
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  if (!templateVars.email) {
    return res.redirect("/login");
  }

  return res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    email: req.cookies["email"]
  };
  if (!templateVars.email) {
    return res.send(401);
  }

  return res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;                               
  if (!longURL) {                               
    return res.status(404).send("This shortened url does not exist");
  }

  return res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  return res.render("_signup", templateVars);
});

// const password = "purple-monkey-dinosaur"; // found in the req.body object
//   const hashedPassword = bcrypt.hashSync(password, 10);
//   console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
//   console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.cookies["email"],
  };
  return res.render("_login", templateVars);
});

//============================================= POST

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: ""
  };
  return res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const loggedInUserID = req.cookies["user_id"];
  if (loggedInUserID === urlDatabase[req.params.id]?.userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  } else {
    return res.status(403);
  }
  
});

app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;                               
  const updatedLongUrl = req.body.longURL;                               
  // console.log("updatedLongUrl ", updatedLongUrl);
  const loggedInUserID = req.cookies["user_id"];
  if (loggedInUserID === urlDatabase[shortUrl].userID) {
    urlDatabase[shortUrl].longURL = updatedLongUrl;                               
    return res.redirect("/urls");
  } else {
    return res.status(403);
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // make sure email or password are not empty
  if (!email || !password) {
    return res.status(400).send(`no email and/or password was provided`);
  }

 // const password = "purple-monkey-dinosaur"; // found in the req.body object
  // const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
  // console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false

  // make sure that the email doesn't match else "its a match"
  for (const userId in users) {
    const user = users[userId];
    // if email is found then compare the password too
    // bcrypt.compareSync(password, user.password)
    if (user.email === email &&  bcrypt.compareSync(password, user.password)) { 
      res.cookie("email", email);
      res.cookie("user_id", user.id);
      return res.redirect("/urls");
    } else if (user.email === email && bcrypt.compareSync(password, user.password)) { 
      return res.status(403); // if email is there but the password is incorrect then send back 403
    }
  }
  return res.status(403);
});

app.post("/logout", (req, res) => {
  const email = req.body.email;
  res.clearCookie("email");
  res.clearCookie("user_id");
  return res.redirect("/login");
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
    password: bcrypt.hashSync(password, 10)
  };
  console.log(users)
  res.cookie("user_id", id);
  res.redirect("/urls",);


  // const password = "purple-monkey-dinosaur"; // found in the req.body object
  // const hashedPassword = bcrypt.hashSync(password, 10);
  // console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
  // console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false
 

});
