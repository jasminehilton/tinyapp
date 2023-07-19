const urlDatabase = require("./express_server");

const getUserByEmail = function(email, database) {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
};

const generateRandomString = function() {
  return (+new Date() * Math.random()).toString(36).substring(0, 6);
};

const urlsForUser = function(id, urlDatabase) {
  let userUrls = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

const getUserById = function(userId, usersDatabase) {
  for (let user in usersDatabase) {
    if (user === userId) {
      return usersDatabase[user];
    }
  }

  return null;
};

module.exports = { getUserByEmail, generateRandomString, urlsForUser, getUserById };
