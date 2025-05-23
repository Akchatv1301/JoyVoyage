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
        type: String,
        default:
            "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",  //if no image is set
        set: (v) =>
            v === ""
                ? "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60"
                : v, //if empty image is coming, this will be the default image
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }
    ] 
    //storing an array of reviews with each listing whose type is objectId of reviews, using Review model for reference
});

listingSchema.post("findOneAndDelete", async (listing) => { //after deleting a listing, delete all the reviews associated with it
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } }); //deleting all the reviews associated with the listing
    }
}); //post middleware to delete reviews after deleting a listing

const Listing = mongoose.model("Listing", listingSchema); //Creating model
module.exports = Listing; //exporting model