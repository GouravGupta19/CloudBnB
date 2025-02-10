const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

const Listing = require("./models/listing.js");
const { listingSchema, reviewSchema } = require("./schema.js");

const Review = require("./models/review.js");

const wrapAsync = require("./utils/wrapAsync.js");
const ExpressEror = require("./utils/ExpressError.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
async function main() {
  await mongoose.connect(MONGO_URL);
}
main()
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => {
    console.log(err);
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, "/public")));

app.use(express.urlencoded({ extended: true }));

let port = 8080;
app.listen(port, () => {
  console.log(`we are live on port ${port}`);
});

app.get("/", (req, res) => {
  res.send("I m root");
});

const validateListing = (req, res, next) => {
  //validating listing using joi
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressEror(400, errMsg);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  //validating listing using joi
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressEror(400, errMsg);
  } else {
    next();
  }
};

//Index Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

//Create Route
app.post(
  "/listings",
  validateListing, // this middleware will validate the listing
  wrapAsync(async (req, res, next) => {
    // if (!req.body.listing) {
    //   //it just checks whether the listing is present or not, but doesn't check each component,so for schema validation we'll use a tool named 'joi'.
    //   throw new ExpressEror(400, "send valid data for listing");
    // }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
  })
);

//Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
app.put(
  "/listings/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    //coz 'req.body.listing' is a js object, so we are breaking the object into {title,description,image,...etc} and updating the current listing
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route(we have to delete all the reviews related to the listing)
app.delete(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    //console.log(deleted);
    res.redirect("/listings");
  })
);

//Posting Reviews Route
app.post(
  "/listings/:id/reviews",
  validateReview,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    //console.log("new review saved");
    res.redirect(`/listings/${listing._id}`);
  })
);
/*Deleting Reviews: delete a specific review from the listings.reviews
$pull
this operator removes from an existing array all instances of a value or values that matches a specific condn.
*/

//Delete Review Route
app.delete(
  "/listings/:id/reviews/:reviewId",
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
  })
);

//any path which doesn't matched any of the above,paths which means invalid req is sent
//it will be catched by this, and a custom error is thrown, which will be handled by next middleware
app.all("*", (req, res, next) => {
  next(new ExpressEror(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong" } = err;
  //res.status(statusCode).send(message);
  res.status(statusCode).render("error.ejs", { message });
});

// app.get("/testListing", async (req, res) => {
//   let sample = new Listing({
//     title: "My new Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });

//   await sample.save();
//   console.log("sample saved");
//   res.send("successful testing");
// });
