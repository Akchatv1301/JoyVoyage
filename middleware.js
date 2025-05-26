const Listing = require("./models/listing.js"); //importing mongoose model for listings from models/listing.js
const Review = require("./models/review.js"); //importing mongoose model for reviews from models/review.js
const ExpressError = require('./utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('./schema.js');

// Middleware functions for authentication and session management in an Express.js application
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) { //if user is not authenticated, redirect to login page
        //First store the current URL in session so that we can redirect back after login
        req.session.redirectUrl = req.originalUrl; //storing only if user is logged out
        req.flash("error", "You must be logged in to create a listing !"); //flash message to show error
        return res.redirect("/login"); //redirect to login page
    }
    next(); //if authenticated, proceed to next middleware or route handler
};

// Middleware function to save the redirect URL in session to res.locals
module.exports.saveRedirectUrl = (req, res, next) => {
    if (req.session.redirectUrl) { //if redirectUrl is already stored in session
        res.locals.redirectUrl = req.session.redirectUrl; //store it in res.locals
    }
    next(); //proceed to next middleware or route handler
};

// Middleware function to check if the current user is not the owner of the listing
module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params; //get the listing id from params
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser._id)) { //checking if the owner is not the current user
        req.flash("error", "You are not the owner of this listing !"); //flash message to show error
        return res.redirect(`/listings/${id}`); //redirecting to the listing page
    }
    next(); //if owner is current user, proceed to next middleware or route handler
};


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params; //get the listing id from params
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser._id)) { //checking if the owner is not the current user
        req.flash("error", "You are not the author of this review !"); //flash message to show error
        return res.redirect(`/listings/${id}`); //redirecting to the listing page
    }
    next(); //if owner is current user, proceed to next middleware or route handler
};

// Middleware function to validate the listing data against the schema defined in models/listing.js
module.exports.validateListing = (req, res, next) => {
    let { error } = listingSchema.validate(req.body);
    //validating that req.body is satisfying the schema by Joi in schema.js else extract the error
    if (error) { //if error is present
        let errMsg = error.details.map(el => el.message).join(","); //extracting the error message
        throw new ExpressError(400, errMsg); //throw an error msg with status code 400
    } else {
        next(); //if no error, move to next middleware
    }
    //throw an error if result is not following the schema by Joi, handled by error handling middleware
};


// Middleware function to validate the review data against the schema defined in models/review.js
module.exports.validateReview = (req, res, next) => {
    let { error } = reviewSchema.validate(req.body); //validating that req.body is satisfying the schema by Joi in schema.js else extract the error
    if (error) { //if error is present
        let errMsg = error.details.map(el => el.message).join(","); //extracting the error message
        throw new ExpressError(400, errMsg  ); //throw an error msg with status code 400
    } else {
        next(); //if no error, move to next middleware
    }
    //throw an error if result is not following the schema by Joi, handled by error handling middleware
}