const Listing = require("../models/listing");

//Module for functionality of Index Route
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
};

//Module for functionality of New Route -> get request to render new form
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
};

//Module for functionality of Show Route
module.exports.showListing = async (req, res) => {
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
};

//Module for functionality of Create Route -> post request to create new listing
module.exports.createListing = async (req, res, next) => { //passing middleware validateListing
    // try{
    // let { title, description, image, price, country, location } = req.body; we created key:value pair in form new.ejs
    // let listing = req.body.listing; //all data will arrive as JS object
    // if(!req.body.listing){
    //     throw new ExpressError(400, "Send valid data for listing");
    // } 
    let url = req.file.path; //getting the image path from multer middleware
    let filename = req.file.filename; //getting the image filename from multer middleware
    const newListing = new Listing(req.body.listing); //creating new instance of Listing model
    newListing.owner = req.user._id; //setting the owner of the listing to the current user
    newListing.image = { url, filename }; //setting the image path and filename
    await newListing.save();
    req.flash("success", "New Listing Created !"); //flash message to show success
    res.redirect("/listings");
    // // }
    // catch(err){
    //     next(err);
    // }
};

//Module for functionality of Edit Route -> get request to render edit form
module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing you requested for does not exist !"); //show error msg
        res.redirect("/listings"); //redirect to all listings
    }
    res.render("listings/edit.ejs", { listing });
};

//Module for functionality of Update Route -> put request to update existing listing
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }); //deconstructing the object from form
    req.flash("success", "Listing Updated !"); //flash message to show success
    res.redirect(`/listings/${id}`);
};

//Module for functionality of Delete Route 
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted !"); //flash message to show success
    res.redirect("/listings");
};