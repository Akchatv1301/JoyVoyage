const express = require("express");
const router = express.Router();
const User = require("../models/user.js"); //importing User model
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js"); //importing middleware to save redirect URL in session 
const userController = require("../controllers/users.js"); //importing user controller

//Combining 1. SignUp Route -> get signup form and 2. Register Route -> register the user
router.route("/signup")
    .get(userController.renderSignupForm) //rendering signup page
    .post(wrapAsync(userController.signup)); //registering the user using user controller

//Combining 1. Login Route -> get login form and 2. Authenticate Route -> authenticate the user
router.route("/login")
    .get(userController.renderLoginForm) //rendering login page
    .post(saveRedirectUrl, //middleware to save redirect URL in session
        passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
        userController.login //controller to handle successful login
    );

//Logout Route -> logging out the user
router.get("/logout", userController.logout); //controller to handle user logout

module.exports = router; //exporting the router