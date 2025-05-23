const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing : Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        price: Joi.number().required().min(0), //price should be positive
        image: Joi.string().allow("", null) //allowing empty string or null
    }).required()
});

//listingSchema is validated using Joi. Inside listingSchema, we have a key "listing" which is an object. 
//Inside listing object, we have title, description, location, country, price, and image. 
// All of these are required except image.

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5), //rating should be between 1 and 5 
        comment: Joi.string().required(),
    }).required()
});

//reviewSchema is validated using Joi. Inside reviewSchema, we have a key "review" which is an object.
// Inside review object, we have rating and comment. All of these are required.