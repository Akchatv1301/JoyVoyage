const Listing = require("../models/listing.js");
const Review = require('../models/review.js');

//Module for funcationality of review creation
module.exports.createReview = async (req, res) => {
    let listing = await  Listing.findById(req.params.id); //getting the listing id from params
    let newReview = new Review(req.body.review); //creating new review instance using data recived from form
    newReview.author = req.user._id; //setting the author of the review to the current user

    listing.reviews.push(newReview); //pushing the review to the review array of listing
    await newReview.save(); //saving the review to DB
    await listing.save(); //saving the listing to DB

    req.flash("success", "New Review Added !"); //flash message to show success
    res.redirect(`/listings/${listing._id}`); //redirecting to the listing page 
};

//Module for functionality of review deletion
module.exports.destroyReview = async (req, res) => {
    let { id, reviewId } = req.params; //getting the listing id and review id from params
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); 
    //removing the review that match with reviewId in reviews array from the listing using $pull operator
    //used findByIdAndUpdate as we are updating review array in listing
    await Review.findByIdAndDelete(reviewId); //deleting the review from DB

    req.flash("success", "Review Deleted !"); //flash message to show success
    res.redirect(`/listings/${id}`); //redirecting to the listing page 
};