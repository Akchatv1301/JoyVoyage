const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
//importing middleware functions for authentication, ownership check, and validation

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", isLoggedIn, (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author", }, })
        .populate("owner");
    //For every listing, populate reviews and for each review, populate author (Nested populate)
    
    console.log(listing);
    //populating the reviews array with review data and owner with user data
    //populate is used to get the data from other collection using reference
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !"); //show error msg
        res.redirect("/listings"); //redirect to all listings
    }
    res.render("listings/show.ejs", { listing });
}));

//Create Route
//if we are directly sending post request using hoppscotch, user must be logged in. So isLoggedIn used
router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res, next) => { //passing middleware validateListing
    // try{
    // let { title, description, image, price, country, location } = req.body; we created key:value pair in form new.ejs
    // let listing = req.body.listing; //all data will arrive as JS object
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing");
    // } 
    const newListing = new Listing(req.body.listing); //creating new instance of Listing model
    newListing.owner = req.user._id; //setting the owner of the listing to the current user
    await newListing.save();
    req.flash("success", "New Listing Created !"); //flash message to show success
    res.redirect("/listings");
    // // }
    // catch(err){
    //     next(err);
    // }

}));

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !"); //show error msg
        res.redirect("/listings"); //redirect to all listings
    }
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //deconstructing the object from form
    req.flash("success", "Listing Updated !"); //flash message to show success
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !"); //flash message to show success
    res.redirect("/listings");
}));

module.exports = router; //exporting the router to be used in app.js