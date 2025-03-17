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