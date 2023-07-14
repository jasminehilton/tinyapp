const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
// const keygrip = require("keygrip")
const app = express();
const PORT = 8080; // default port 8080
const { getUserByEmail } = require("./helpers");
//============================================= USE

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: require("keygrip")(["SEKRIT2", "SEKRIT1"], "sha256", "hex"),

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

//============================================= GLOBAL CONST

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  Psm5xK: {
    longURL: "http://www.google.com",
    userID: "user2RandomID",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "$2a$10$SGSvUd8jAJAGkrKNGViLyOav7UIqf7lezLDzFjfHPOEcIElMeGnla", // 123
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "$2a$10$uJZDK.7M9FQfel3v1KjUV.WfJ.9.ETTAP1brEVCFvoubSDhsVgiYS", //456
  },
};

const generateRandomString = function () {
  // Math.random().tostring(36).substring(2, 5); // alternative generator
  return (+new Date() * Math.random()).toString(36).substring(0, 6);
};

const urlsForUser = function (id) {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
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
  const userID = req.session.user_id;
  const userURLs = urlsForUser(userID);
  const templateVars = {
    urls: userURLs,
    email: req.session.email,
  };
  if (!templateVars.email) {
    return res.redirect("/login");
  }
  return res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    email: req.session.email,
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
    email: req.session.email,
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
    email: req.session.email,
  };
  
  if(templateVars.email) {
    return res.redirect("/urls"); 
  }
  return res.render("_signup", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    email: req.session.email,
  };
  if(templateVars.email) {
    return res.redirect("/urls"); 
  }
  return res.render("_login", templateVars);
});

//============================================= POST

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect(`/urls/${shortUrl}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const loggedInUserID = req.session.user_id;
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
  const loggedInUserID = req.session.user_id;
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

  // // make sure email or password are not empty
  if (!email || !password) {
    return res.status(400).send(`no email and/or password was provided`);
  }

  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(403);
  }

  if (bcrypt.compareSync(password, user.password)) {
    req.session.email = email;
    req.session.user_id = user.id;
    return res.redirect("/urls");
  } else {
    return res.status(403); // if email is there but the password is incorrect then send back 403
  }
});

app.post("/logout", (req, res) => {
  const email = req.body.email;
  req.session.user_id = "";
  req.session.email = "";
  return res.redirect("/login");
  // possibly put the js that is in the header file here one day
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  // // make sure email or password are not empty
  if (!email || !password) {
    return res.status(400).send(`no email and/or password was provided`);
  }

  const user = getUserByEmail(email, users);

  if (user) {
    return res.status(400).send("cant use the same email");
  }

  // add the unique user in the users list
  users[id] = {
    id: id,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
  req.session.user_id = id;
  res.redirect("/urls");
});
