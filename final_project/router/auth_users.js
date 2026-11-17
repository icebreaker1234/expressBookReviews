const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js');
const regdUsers = express.Router();
const users = [];

const isValid = (username) => users.some((user) => user.username === username);
const authenticatedUser = (username, password) => users.some((user) => user.username === username && user.password === password);

regdUsers.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!authenticatedUser(username, password)) return res.status(401).json({ message: 'Invalid username or password.' });
  const accessToken = jwt.sign({ username }, 'access', { expiresIn: '1h' });
  req.session.authorization = { accessToken, username };
  return res.json({ message: 'User successfully logged in.', username });
});

regdUsers.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  const review = typeof req.body?.review === 'string' ? req.body.review.trim() : '';
  if (!books[isbn]) return res.status(404).json({ message: 'Book not found.' });
  if (!review) return res.status(400).json({ message: 'Review text is required.' });
  const username = req.session.authorization.username;
  books[isbn].reviews[username] = review;
  return res.json({ message: 'Review added or updated successfully.', reviews: books[isbn].reviews });
});

regdUsers.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn;
  if (!books[isbn]) return res.status(404).json({ message: 'Book not found.' });
  const username = req.session.authorization.username;
  if (!Object.prototype.hasOwnProperty.call(books[isbn].reviews, username)) return res.status(404).json({ message: 'No review found for this user.' });
  delete books[isbn].reviews[username];
  return res.json({ message: 'Review deleted successfully.' });
});

module.exports.authenticated = regdUsers;
module.exports.isValid = isValid;
module.exports.users = users;
