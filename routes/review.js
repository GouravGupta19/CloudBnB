const express = require("express");
const router = express.Router({ mergeParams: true });
/*
to merge the parent route ("/listings/:id/reviews") with child routes, so that we can get ":id" to find the listing
*/
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const {
  validateReview,
  isLoggedIn,
  isReviewAuthor,
} = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

/*
"/listings/:id/reviews"
this is replaced by
"/"
*/

//Posting Reviews Route
router.post(
  "/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewController.createReview)
);

/*Deleting Reviews: delete a specific review from the listings.reviews
$pull
this operator removes from an existing array all instances of a value or values that matches a specific condn.
*/

//Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.destroyReview)
);

module.exports = router;
