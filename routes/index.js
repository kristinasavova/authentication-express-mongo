const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET /profile
router.get('/profile', (req, res, next) => {
    if (!req.session.userId) {
        const err = new Error("You are not authorized to view this page");
        err.status = 403;
        next(err);
    }
    User
        .findById(req.session.userId)
        .exec((err, user) => {
            if (err) next(err);
            else {
                res.render('profile', { 
                    title: 'Profile', 
                    name: user.name, 
                    favorite: user.favoriteBook 
                });
            }
        });
});

// GET /login
router.get('/login', (req, res, next) => {
    res.render('login', { title: 'Log In'});
});

// POST /login
router.post('/login', (req, res, next) => {
  if (req.body.email && req.body.password) {
    User.authenticate(req.body.email, req.body.password, (error, user) => {
      if (error || !user) {
        const err = new Error('Wrong email or password');
        err.status = 401;
        next(err);
      }  else {
        req.session.userId = user._id;
        res.redirect('/profile');
      }
    });
  } else {
    const err = new Error('Email and password are required');
    err.status = 401;
    next(err);
  }
});

// GET /register
router.get('/register', (req, res) => {
    res.render('register', { title: 'Sign Up' });
});

// POST /register
router.post('/register', (req, res, next) => {
    if (req.body.email &&
        req.body.name &&
        req.body.favoriteBook &&
        req.body.password &&
        req.body.confirmPassword) {

        // confirm that user typed same password twice
        if (req.body.password !== req.body.confirmPassword) {
            const err = new Error('Passwords do not match');
            err.status = 400;
            next(err);
        }

        // create object with form input
        const userData = {
            email: req.body.email,
            name: req.body.name,
            favoriteBook: req.body.favoriteBook,
            password: req.body.password
        };

        // use schema's `create` method to insert document into Mongo
        User.create(userData, (err, user) => {
            if (err) next(err);
            else {
                req.session.userId = user._id;
                res.redirect('/profile');
            }
        });

        } else {
            const err = new Error('All fields required');
            err.status = 400;
            next(err);
        }
})

// GET /
router.get('/', (req, res, next) => {
    res.render('index', { title: 'Home' });
});

// GET /about
router.get('/about', (req, res, next) => {
  res.render('about', { title: 'About' });
});

// GET /contact
router.get('/contact', (req, res, next) => {
  res.render('contact', { title: 'Contact' });
});

module.exports = router;
