const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); //importing User model
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs"); //rendering signup page
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body; //extracting data from form
        const newUser = new User({ username, email }); //creating new user instance using data recived from form
        const registeredUser = await User.register(newUser, password); //registering the user with username and password
        console.log(registeredUser); //logging the registered user
        req.flash("success", "Welcome to JoyVoyage!"); //flash message to show success
        res.redirect("/listings"); //redirecting to the listings page
    } catch (err) {
        req.flash("error", err.message); //flash message to show error
        res.redirect("/signup"); //redirecting to the signup page
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs"); //rendering login page
});

router.post("/login",
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    //failureRedirect is the path to redirect if authentication fails, failureFlash is used to show flash message on failure.
    async (req, res) => {
        req.flash("success", 'Welcome back to JoyVoyage !'); //sending welcome message with username
        res.redirect("/listings"); //redirecting to the listings page
    });

module.exports = router; //exporting the router