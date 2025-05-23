const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError.js');

const listings = require('./routes/listing.js'); //importing routes for listing
const reviews = require('./routes/review.js'); //importing routes for review

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

app.get("/", (req, res) => {
    res.send("Hello, I am root");
});

app.use("/listings", listings); //using the routes for listing
app.use("/listings/:id/reviews", reviews); //using the routes for review


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