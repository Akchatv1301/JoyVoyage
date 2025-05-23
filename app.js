const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js"); //importing for mongoose model
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js'); //importing Joi schema for server side validation
// const { reviewSchema } = require('./schema.js'); //importing Joi schema for server side validation
const Review = require('./models/review.js'); //importing mongoose model for reviews from models/review.js

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

const validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    //validating that req.body is satisfying the schema by Joi in schema.js else extract the error
    if (error) { //if error is present
        let errMsg = error.details.map(el => el.message).join(","); //extracting the error message
        throw new ExpressError(400, errMsg  ); //throw an error msg with status code 400
    } else {
        next(); //if no error, move to next middleware
    }
    //throw an error if result is not following the schema by Joi, handled by error handling middleware
};

const validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); //validating that req.body is satisfying the schema by Joi in schema.js else extract the error
    if (error) { //if error is present
        let errMsg = error.details.map(el => el.message).join(","); //extracting the error message
        throw new ExpressError(400, errMsg  ); //throw an error msg with status code 400
    } else {
        next(); //if no error, move to next middleware
    }
    //throw an error if result is not following the schema by Joi, handled by error handling middleware
}

//Index Route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews"); //populating the reviews array with review data  
    res.render("listings/show.ejs", { listing });
}));

//Create Route
app.post("/listings", validateListing, wrapAsync(async (req, res, next) => { //passing middleware validateListing
    // try{
    // let { title, description, image, price, country, location } = req.body; we created key:value pair in form new.ejs
    // let listing = req.body.listing; //all data will arrive as JS object
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing");
    // } 
    const newListing = new Listing(req.body.listing); //creating new instance of Listing model
    await newListing.save();
    res.redirect("/listings");
    // // }
    // catch(err){
    //     next(err);
    // }

}));

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //deconstructing the object from form
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

//Reviews
//Post Route for review
app.post("/listings/:id/reviews", validateReview, wrapAsync(async (req, res) => {
    let listing = await  Listing.findById(req.params.id); //getting the listing id from params
    let newReview = new Review(req.body.review); //creating new review instance using data recived from form

    listing.reviews.push(newReview); //pushing the review to the review array of listing
    await newReview.save(); //saving the review to DB
    await listing.save(); //saving the listing to DB

    res.redirect(`/listings/${listing._id}`); //redirecting to the listing page 
})); 

//Delete Route for review
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params; //getting the listing id and review id from params
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); 
    //removing the review that match with reviewId in reviews array from the listing using $pull operator
    //used findByIdAndUpdate as we are updating review array in listing
    await Review.findByIdAndDelete(reviewId); //deleting the review from DB
    res.redirect(`/listings/${id}`); //redirecting to the listing page 
}));

// app.get("/testListings", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My new Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "Calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     console.log("Listing was saved");
//     res.send("Successful testing");
// });

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