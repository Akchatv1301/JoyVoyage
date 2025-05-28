const { ref } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review.js'); //importing mongoose model for reviews from models/review.js

const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
        url: String, //url of the image
        filename: String, //filename of the image
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ],
    //storing an array of reviews with each listing whose type is objectId of reviews, using Review model for reference

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User", //referring to User model
    },
});

listingSchema.post("findOneAndDelete", async (listing) => { //after deleting a listing, delete all the reviews associated with it
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } }); //deleting all the reviews associated with the listing
    }
}); //post middleware to delete reviews after deleting a listing

const Listing = mongoose.model("Listing", listingSchema); //Creating model
module.exports = Listing; //exporting model