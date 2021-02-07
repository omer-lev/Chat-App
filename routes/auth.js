const express = require('express');
const passport = require('passport');
const router = express.Router();
const User = require('../models/user.js');

const authSettings = {
    failureFlash: true, 
    failureRedirect: '/login'
}

router.get('/register', (req, res) => {
    res.render('register')
})

router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email: email, username: username, password: password });

        const registeredUser = await User.register(user, password);

        req.login(registeredUser, (err) => {
            if (err) {
                req.flash('error', 'failed to login after registration, please login manually');
                res.redirect('/login');
            } else {
                req.flash('success', 'Welcome to ChatApp!');
                res.redirect('/myrooms');
            }
        })

    } catch (error) {
        req.flash('error', 'User already exists!');
        res.redirect('/register');
    }
    
})

router.get('/login', (req, res) => {
    res.render('login');
})

router.post('/login', passport.authenticate('local', authSettings), (req, res) => {
    req.flash('success', 'welcome back!');
    const redirectUrl = req.session.returnTo || '/myrooms';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logOut();

    req.flash('success', 'successfully logged out');
    res.redirect('/');
})

module.exports = router;