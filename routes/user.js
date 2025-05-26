const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); //importing User model
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js"); //importing middleware to save redirect URL in session 

router.get("/signup", (req, res) => {
    res.render("users/signup.ejs"); //rendering signup page
});

router.post("/signup", wrapAsync(async (req, res) => {
    try {
        let { username, email, password } = req.body; //extracting data from form
        const newUser = new User({ username, email }); //creating new user instance using data recived from form
        const registeredUser = await User.register(newUser, password); //registering the user with username and password
        console.log(registeredUser); //the user is registered and saved to the database

        //Automatically logging in the user after registration
        req.login(registeredUser, (err) => { //logging in the user after registration
            if (err) { //if error occurs, pass it to next middleware
                return next(err); //if error occurs, pass it to next middleware
            }
            req.flash("success", "Welcome to JoyVoyage!"); //flash message to show success
            res.redirect("/listings"); //redirecting to the listings page
        });

    } catch (err) {
        req.flash("error", err.message); //flash message to show error
        res.redirect("/signup"); //redirecting to the signup page
    }
}));

router.get("/login", (req, res) => {
    res.render("users/login.ejs"); //rendering login page
});

router.post("/login", saveRedirectUrl, //middleware to save redirect URL in session
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    async (req, res) => {
        req.flash("success", 'Welcome back to JoyVoyage !'); //sending welcome message with username
        let redirectUrl = res.locals.redirectUrl || "/listings"; 
        //getting redirect URL from res.locals or defaulting to "/listings"
        res.redirect(redirectUrl); //redirecting to the redirect URL
        //redirecting to the original URL stored in session, that user tried to access before logging in
    });

router.get("/logout", (req, res) => {
    req.logout((err) => { //logging out the user
        if (err) {
            return next(err); //if error occurs, pass it to next middleware
        }
        req.flash("success", "Logged out successfully!"); //flash message to show success
        res.redirect("/listings"); //redirecting to the listings page
    });
});

module.exports = router; //exporting the router