const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customerRoutes = require('./router/auth_users.js').authenticated;
const generalRoutes = require('./router/general.js').general;

const app = express();
app.use(express.json());
app.use('/customer', session({ secret: 'fingerprint_customer', resave: false, saveUninitialized: false }));
app.use('/customer/auth/*', (req, res, next) => {
  const token = req.session.authorization && req.session.authorization.accessToken;
  if (!token) return res.status(401).json({ message: 'Please log in first.' });
  try {
    req.user = jwt.verify(token, 'access');
    return next();
  } catch {
    return res.status(401).json({ message: 'Session expired. Please log in again.' });
  }
});

const PORT = process.env.PORT || 5000;
app.use('/customer', customerRoutes);
app.use('/', generalRoutes);
app.listen(PORT, () => console.log(`Book review API listening on port ${PORT}`));
