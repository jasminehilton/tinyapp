const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID);
    
    const expectedEmail = "user@example.com";
    assert.equal(user.email, expectedEmail);

    const expectedPassword = "purple-monkey-dinosaur";
    assert.equal(user.password, expectedPassword);

  });

  it('Should return undefined for an email that is not existing in the database', function() {
    const user = getUserByEmail("user5555@example.com", testUsers);
    
    assert.equal(user, undefined);
  });
});