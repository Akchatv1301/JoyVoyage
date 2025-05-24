const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const Listing = require("../models/listing.js");
const Review = require('../models/review.js');

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

//Reviews
//Post Route for review
router.post("/", validateReview, wrapAsync(async (req, res) => {
    let listing = await  Listing.findById(req.params.id); //getting the listing id from params
    let newReview = new Review(req.body.review); //creating new review instance using data recived from form

    listing.reviews.push(newReview); //pushing the review to the review array of listing
    await newReview.save(); //saving the review to DB
    await listing.save(); //saving the listing to DB

    req.flash("success", "New Review Added !"); //flash message to show success
    res.redirect(`/listings/${listing._id}`); //redirecting to the listing page 
})); 

//Delete Route for review
router.delete("/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params; //getting the listing id and review id from params
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); 
    //removing the review that match with reviewId in reviews array from the listing using $pull operator
    //used findByIdAndUpdate as we are updating review array in listing
    await Review.findByIdAndDelete(reviewId); //deleting the review from DB

    req.flash("success", "Review Deleted !"); //flash message to show success
    res.redirect(`/listings/${id}`); //redirecting to the listing page 
}));

module.exports = router; //exporting the router