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

const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");

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

const cookieParser = require("cookie-parser");
const session = require("express-session");
const flash = require("connect-flash");
//we are making our protocol stateful,i.e.,trying to save our sessions, using cookies
//mtlb when we switch pages we can save session info in our browser,so that we can access it in future in some other pages
const sessionOptions = {
  secret: "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, //security purposes
  },
};
app.use(cookieParser());
app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  //console.log(res.locals.success);
  next();
});

//these things should be written before routes

// const validateListing = (req, res, next) => {
//   //validating listing using joi
//   let { error } = listingSchema.validate(req.body);

//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     //joining all the err messages
//     throw new ExpressEror(400, errMsg);
//   } else {
//     next();
//   }
// };

// const validateReview = (req, res, next) => {
//   //validating review using joi
//   let { error } = reviewSchema.validate(req.body);

//   if (error) {
//     let errMsg = error.details.map((el) => el.message).join(",");
//     throw new ExpressEror(400, errMsg);
//   } else {
//     next();
//   }
// };

app.use("/listings", listings);
//insted of using all the '/listings' routes now we are using only this line
app.use("/listings/:id/reviews", reviews);
//insted of using all the '/listings/:id/reviews' routes now we are using only this line
// hence all the routes are converted into just 2 lines-> code modularity increased

// //Index Route
// app.get(
//   "/listings",
//   wrapAsync(async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", { allListings });
//   })
// );

// //New Route
// app.get("/listings/new", (req, res) => {
//   res.render("listings/new.ejs");
// });

// //Show Route
// app.get(
//   "/listings/:id",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id).populate("reviews");
//     res.render("listings/show.ejs", { listing });
//   })
// );

// //Create Route
// app.post(
//   "/listings",
//   validateListing, // this middleware will validate the listing
//   wrapAsync(async (req, res, next) => {
//     // if (!req.body.listing) {
//     //   //it just checks whether the listing is present or not, but doesn't check each component,so for schema validation we'll use a tool named 'joi'.
//     //   throw new ExpressEror(400, "send valid data for listing");
//     // }

//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings");
//   })
// );
// // app.post(  //-->better way of writing this is using wrapAsync
// //   "/listings",
// //   validateListing,
// //   async (req, res, next) => {
// //     try {
// //       const newListing = new Listing(req.body.listing);
// //       await newListing.save();
// //       res.redirect("/listings");
// //     } catch (err) {
// //       next(err);
// //     }
// //   }
// // );

// //Edit Route
// app.get(
//   "/listings/:id/edit",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     const listing = await Listing.findById(id);
//     res.render("listings/edit.ejs", { listing });
//   })
// );

// //Update Route
// app.put(
//   "/listings/:id",
//   validateListing,
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     await Listing.findByIdAndUpdate(id, { ...req.body.listing });
//     //coz 'req.body.listing' is a js object, so we are breaking the object into {title,description,image,...etc} and updating the current listing
//     res.redirect(`/listings/${id}`);
//   })
// );

// //Delete Route(we have to delete all the reviews related to the listing)
// app.delete(
//   "/listings/:id",
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let deleted = await Listing.findByIdAndDelete(id);
//     //console.log(deleted);
//     res.redirect("/listings");
//   })
// );

//Reviews
// //Posting Reviews Route
// app.post(
//   "/listings/:id/reviews",
//   validateReview,
//   wrapAsync(async (req, res) => {
//     let { id } = req.params;
//     let listing = await Listing.findById(id);
//     let newReview = new Review(req.body.review);

//     listing.reviews.push(newReview);

//     await newReview.save();
//     await listing.save();

//     //console.log("new review saved");
//     res.redirect(`/listings/${listing._id}`);
//   })
// );

// /*Deleting Reviews: delete a specific review from the listings.reviews
// $pull
// this operator removes from an existing array all instances of a value or values that matches a specific condn.
// */

// //Delete Review Route
// app.delete(
//   "/listings/:id/reviews/:reviewId",
//   wrapAsync(async (req, res) => {
//     let { id, reviewId } = req.params;

//     await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
//     await Review.findByIdAndDelete(reviewId);

//     res.redirect(`/listings/${id}`);
//   })
// );

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
