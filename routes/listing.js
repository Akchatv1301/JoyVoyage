const express = require("express");
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
//importing middleware functions for authentication, ownership check, and validation

const listingController = require('../controllers/listings.js'); //importing controller for listings

const multer = require('multer'); //importing multer for file uploads
const { storage } = require('../cloudConfig.js'); //importing cloudinary storage configuration
const upload = multer({ storage }); //setting the destination for uploaded files ie "uploads/" folder

//Index Route and Create Route
router.route("/")
    .get(wrapAsync(listingController.index)) //Index Route to list all listings
    .post(isLoggedIn, upload.single('listing[image]'),
        validateListing, wrapAsync(listingController.createListing));
// Create Route -> if we are directly sending post request using hoppscotch, 
// user must be logged in. So isLoggedIn used. 
// upload.single('listing[image]') is used to handle single file upload with field name 'listing[image]' - multer middleware

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm); //rendering new form for creating listing);
//should be above path "/:id" else "/new" will be treated as a listing id

//Show Route, Update Route, and Delete Route
router.route("/:id")
    .get(wrapAsync(listingController.showListing)) //showing the listing details
    .put(isLoggedIn, isOwner, validateListing, wrapAsync(listingController.updateListing)) //updating the listing with new data
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); //deleting the listing

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm)); //rendering edit form for updating listing

module.exports = router; //exporting the router to be used in app.js