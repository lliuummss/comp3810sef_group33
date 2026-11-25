const express = require('express');
const { findByUsername, createUser, verifyPassword } = require('../models/user');

const router = express.Router();

function requireLogin(req, res, next) {
  if (req.session.user) return next();
  return res.redirect('/login');
}

function validUsername(username) {
  if (username.length < 3 || username.length > 24) return false;

  const allowed = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
  for (const character of username) {
    if (!allowed.includes(character)) return false;
  }
  return true;
}

router.get('/login', (req, res) => {
  if (req.session.user) return res.redirect('/posts');
  res.render('login', {
    title: 'Log in',
    currentUser: req.session.user,
    error: null
  });
});

router.post('/login', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const password = String(req.body.password || '');
  const user = await findByUsername(username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).render('login', {
      title: 'Log in',
      currentUser: req.session.user,
      error: 'Incorrect username or password.'
    });
  }
  req.session.user = { username: user.username, displayName: user.displayName };
  return res.redirect('/posts');
});

router.get('/register', (req, res) => {
  if (req.session.user) return res.redirect('/posts');
  res.render('register', {
    title: 'Register',
    currentUser: req.session.user,
    error: null,
    values: {}
  });
});

router.post('/register', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const displayName = String(req.body.displayName || '').trim();
  const password = String(req.body.password || '');
  const values = { username, displayName };

  let error;
  if (!validUsername(username)) {
    error = 'Username must be 3 to 24 letters, numbers, underscores, or hyphens.';
  } else if (displayName.length < 2 || displayName.length > 40) {
    error = 'Display name must be 2 to 40 characters.';
  } else if (password.length < 6 || password.length > 64) {
    error = 'Password must be 6 to 64 characters.';
  }
  if (error) {
    return res.status(400).render('register', {
      title: 'Register',
      currentUser: req.session.user,
      error,
      values
    });
  }

  if (await findByUsername(username)) {
    return res.status(409).render('register', {
      title: 'Register',
      currentUser: req.session.user,
      error: 'This username is already taken.',
      values
    });
  }

  const user = await createUser({ username, displayName, password });
  req.session.user = { username: user.username, displayName: user.displayName };
  return res.redirect('/posts');
});

router.post('/logout', requireLogin, (req, res) => {
  req.session = null;
  res.redirect('/login');
});

module.exports = { authRouter: router, requireLogin };
