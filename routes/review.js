const express = require("express");
const router = express.Router({mergeParams: true});
/*
to merge the parent route ("/listings/:id/reviews") with child routes, so that we can get ":id" to find the listing
*/
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressEror = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const { reviewSchema } = require("../schema.js");



const validateReview = (req, res, next) => {
  //validating review using joi
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressEror(400, errMsg);
  } else {
    next();
  }
};

/*
"/listings/:id/reviews"
this is replaced by
"/"
*/

//Posting Reviews Route
router.post(
  "/",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    //console.log("new review saved");
    req.flash("success","New Review Created!");
    res.redirect(`/listings/${listing._id}`);
  })
);

/*Deleting Reviews: delete a specific review from the listings.reviews
$pull
this operator removes from an existing array all instances of a value or values that matches a specific condn.
*/

//Delete Review Route
router.delete(
  "/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports=router;
