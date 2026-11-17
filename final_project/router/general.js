const express = require('express');
const axios = require('axios');
const books = require('./booksdb.js');
const isValid = require('./auth_users.js').isValid;
const users = require('./auth_users.js').users;
const publicUsers = express.Router();

// Axios client helpers for consumers of this API (promise-based async/await).
const api = axios.create({ baseURL: process.env.BOOKS_API_BASE_URL || 'http://localhost:5000', timeout: 5000 });
const getAllBooks = async () => (await api.get('/')).data;
const getBookByISBN = async (isbn) => (await api.get(`/isbn/${encodeURIComponent(isbn)}`)).data;
const getBooksByAuthor = async (author) => (await api.get(`/author/${encodeURIComponent(author)}`)).data;
const getBooksByTitle = async (title) => (await api.get(`/title/${encodeURIComponent(title)}`)).data;

publicUsers.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ message: 'Username and password are required.' });
  if (isValid(username)) return res.status(409).json({ message: 'Username already exists.' });
  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered.' });
});

publicUsers.get('/', (req, res) => res.json(books));
publicUsers.get('/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book) : res.status(404).json({ message: 'Book not found.' });
});
publicUsers.get('/author/:author', (req, res) => {
  const author = decodeURIComponent(req.params.author).toLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.author.toLowerCase() === author));
  return res.json(matches);
});
publicUsers.get('/title/:title', (req, res) => {
  const title = decodeURIComponent(req.params.title).toLowerCase();
  const matches = Object.fromEntries(Object.entries(books).filter(([, book]) => book.title.toLowerCase() === title));
  return res.json(matches);
});
publicUsers.get('/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  return book ? res.json(book.reviews) : res.status(404).json({ message: 'Book not found.' });
});

module.exports.general = publicUsers;
module.exports.getAllBooks = getAllBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
