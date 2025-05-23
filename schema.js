const Joi = require("joi");
const review = require("./models/review");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    location: Joi.string().required(),
    country: Joi.string().required(),
    price: Joi.number().required().min(0),
    //image: Joi.string().allow("", null),
    // for image , its not required, so empty string and null is allowed
  }).required(),
});

/*
used for validation purposes, when the data is inserted in the db, then joi checks the constraints 
before putting the data in the db , kind off backend validation
*/

module.exports.reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    comment: Joi.string().required(),
  }).required(),
});
