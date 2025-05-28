const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const Review = require('../models/review.js');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware.js'); //importing middleware function for review validation
const reviewController = require('../controllers/reviews.js'); //importing controller for reviews

//Reviews
//Post Route for review
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview)); 

//Delete Route for review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router; //exporting the router