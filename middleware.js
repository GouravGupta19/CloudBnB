const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressEror = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //checks in the current session,if the user is logged in or not
    req.session.redirectUrl = req.originalUrl;
    //this url is the original path which the user wanted to access,thus it
    //is stored in redirectUrl, after successful login the user will be redirected
    // to this path
    req.flash("error", "You must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  if (!listing.owner.equals(res.locals.curUser._id)) {
    req.flash("error", "You are not the owner of this listing");

    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author.equals(res.locals.curUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressEror(400, errMsg);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  //validating review using joi
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressEror(400, errMsg);
  } else {
    next();
  }
};
