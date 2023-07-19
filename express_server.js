const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const app = express();
const PORT = 8080;
const { getUserByEmail, getUserById, urlsForUser, generateRandomString } = require("./helpers");
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
// object of urls corresponding to user ids
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
// object of users (ids, email and hashed passwords)
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

//============================================= GET

app.get("/", (req, res) => {
  // If no user is logged in, redirect to the login page
  if (!req.session.user_id) {
    return res.redirect("/login");
  } // If a user is logged in, redirect to their URLs page
  return res.redirect("/urls");

});

app.get("/urls.json", (req, res) => {
  return res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  return res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// User's URLs page
app.get("/urls", (req, res) => {

  const userID = req.session.user_id;
  // If no user is logged in, show an error message
  if (!userID){
    return res.send(`Access Denied, Login Required`);
  }
  
  const user = getUserById(userID, users)
  // If user does not exist, redirect to login page
  if(!user) {
    return res.redirect("/login")
  }
  
  const userURLs = urlsForUser(userID, urlDatabase);
  const templateVars = {
    urls: userURLs,
    email: user.email,
  };

  return res.render("urls_index", templateVars);
});
// Create new URL page
app.get("/urls/new", (req, res) => {

  const userID = req.session.user_id;
  // If no user is logged in, redirect to login page
  if (!userID){
    return res.redirect("/login")
  }
 
  const user = getUserById(userID, users)
  // If user does not exist, redirect to login page
  if(!user) {
    return res.redirect("/login")
  }

  const templateVars = {
    email: user.email,
  };
 
  return res.render("urls_new", templateVars);
});
// Show individual URL page
app.get("/urls/:id", (req, res) => {
  // check if session exists
  const userID = req.session.user_id;
   // If no user is logged in, show an error message
  if (!userID){
    return res.send(`Access Denied, Login Required`);
  }
  // check if session user exists
  const user = getUserById(userID, users)
  // If user does not exist, redirect to login page
  if(!user) {
    return res.redirect("/login")
  }

  const userURLs = urlsForUser(userID, urlDatabase);
// If URL does not exist for the user, show an error message
  if(!userURLs[req.params.id]){
    return res.send(`Shortened URL Does Not Exist`);
  }

  const templateVars = {
    id: req.params.id,
    longURL: userURLs[req.params.id].longURL,
    email: user.email,
  };
  
  return res.render("urls_show", templateVars);
});
// Shortened URL redirect route
app.get("/u/:id", (req, res) => {
  const userID = req.session.user_id;
  // If no user is logged in, show an error message
  if (!userID){
    return res.send(`Access Denied, Login Required`);
  }

  const user = getUserById(userID, users)
  // If user does not exist, redirect to login page
  if(!user) {
    return res.redirect("/login")
  }
  const userURLs = urlsForUser(userID, urlDatabase);
   // If URL does not exist for the user, show an error message
  if(!userURLs[req.params.id]){
    return res.send(`Access Denied`);
  }
  return res.redirect(userURLs[req.params.id].longURL);
});
// Registration page
app.get("/register", (req, res) => {
  const userID = req.session.user_id;
  // If user is logged in, redirect to their URLs page
  if (userID){
    return res.redirect("/urls"); 
  }
  const templateVars = {
    email: null,
  };

  return res.render("_signup", templateVars);
});
// Login page
app.get("/login", (req, res) => {
  const userID = req.session.user_id;
  if (userID){
    return res.redirect("/urls"); 
  }
  const templateVars = {
    email: null,
  };
 
  return res.render("_login", templateVars);
});

//============================================= POST
// Create a new short URL and associate it with the user's ID
app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
  };
  return res.redirect(`/urls/${shortUrl}`);
});
// Delete a URL if the logged-in user is the owner
app.post("/urls/:id/delete", (req, res) => {
  const loggedInUserID = req.session.user_id;
  if (loggedInUserID === urlDatabase[req.params.id]?.userID) {
    delete urlDatabase[req.params.id];
    return res.redirect("/urls");
  } else {
    return res.send(`Access Denied, Login Required`);
  }
});
// Update a URL's long URL if the logged-in user is the owner
app.post("/urls/:id", (req, res) => {
  const shortUrl = req.params.id;
  const updatedLongUrl = req.body.longURL;
  const loggedInUserID = req.session.user_id;
  if (loggedInUserID === urlDatabase[shortUrl].userID) {
    urlDatabase[shortUrl].longURL = updatedLongUrl;
    return res.redirect("/urls");
  } else {
    return res.send(`Access Denied, Login Required`);
  }
});
// Handle the login form submission
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
// Check if email and password are provided
  if (!email || !password) {
    return res.send(`Login Failed`);
  }
// Get the user by email from the users object
  const user = getUserByEmail(email, users);
  // Check if user exists and compare hashed passwords
  if (!user) {
    return res.send(`Login Failed`);
  }

  if (bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    return res.redirect("/urls");
  } else {
    return res.send(`Login Failed`);
  }
});
// Handle the logout request
app.post("/logout", (req, res) => {
  const email = req.body.email;
  req.session = null;
  return res.redirect("/login");
});
// Handle the user registration
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
// Check if email and password are provided
  if (!email || !password) {
    return res.send(`Login Failed`);
  }

  const user = getUserByEmail(email, users);
  // Check if user already exists with the given email
  if (user) {
    return res.send(`Login Failed`);
  }
// Create a new user with the given email and hashed password
  users[id] = {
    id: id,
    email: email,
    password: bcrypt.hashSync(password, 10),
  };
// Set the session's user_id to the new user's ID and redirect to URLs page
  req.session.user_id = id;
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`TinyApp is listening on port ${PORT}!`);
});