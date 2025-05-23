const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');
const { listingSchema, reviewSchema } = require('../schema.js');
const Listing = require("../models/listing.js");

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

//Index Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new.ejs");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews"); //populating the reviews array with review data  
    res.render("listings/show.ejs", { listing });
}));

//Create Route
router.post("/", validateListing, wrapAsync(async (req, res, next) => { //passing middleware validateListing
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
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //deconstructing the object from form
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router; //exporting the router to be used in app.js