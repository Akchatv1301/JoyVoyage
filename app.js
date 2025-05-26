const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');
const session = require('express-session'); //importing express-session for session management
const flash = require('connect-flash'); //importing connect-flash for flash messages
const passport = require('passport'); //importing passport for authentication
const LocalStrategy = require('passport-local'); //importing local strategy for passport
const User = require('./models/user.js'); //importing User model for user authentication

const listingsRouter = require('./routes/listing.js'); //importing routes for listing
const reviewsRouter = require('./routes/review.js'); //importing routes for review
const userRouter = require('./routes/user.js'); //importing routes for user

const MONGO_URL = "mongodb://localhost:27017/JoyVoyage";
main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true })); //middleware to parse the form data
app.use(methodOverride("_method")); //middleware to override the method in form
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public"))); //to use static files like css, js, images in public folder

const sessionOptions = {
    secret: "mysupersecretcode", //secret key for session
    resave: false, //don't save session if unmodified
    saveUninitialized: true, //save uninitialized session
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, //cookie will expire after 1 week
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true, //to prevent XSS attacks
    }
};

app.get("/", (req, res) => {
    res.send("Hello, I am root");
});

//For Express Session and Flash Messages
app.use(session(sessionOptions)); //using session middleware
app.use(flash()); //using flash middleware

//For Passport Authentication
app.use(passport.initialize()); //initializing passport
app.use(passport.session()); //using passport session
passport.use(new LocalStrategy(User.authenticate())); //using local strategy for passport with User model

passport.serializeUser(User.serializeUser()); //serializing user
passport.deserializeUser(User.deserializeUser()); //deserializing user 

//For Flash Messages and res.locals middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success"); //to show success messages
    res.locals.error = req.flash("error"); //to show error messages
    res.locals.currUser = req.user; //to get the current user
    next(); //move to next middleware. Here next is listings route that will handle the request
});

// app.get("/demouser", async (req, res) => {
//     let fakeUser = new User({
//         email: "student@gmail.com",
//         username: "delta-student1",
//     }); 

//     let registeredUser = await User.register(fakeUser, "helloworld");
//     //registering the user with username and password
//     res.send(registeredUser);
// });

//For using the routes
app.use("/listings", listingsRouter); //using the routes for listing
app.use("/listings/:id/reviews", reviewsRouter); //using the routes for review
app.use("/", userRouter); //using the routes for user


//For random routes
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    // res.status(statusCode).send(message);
    res.status(statusCode).render("error.ejs", { message });
});

app.listen(8080, () => {
    console.log('Server is listening to port 8080');
});