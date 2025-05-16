/*
Express Router: 
Express Routers are a way to organize your Express application such that 
our primary "app.js" file does not become bloated.
const router= express.Router(); //creates new router object
*/

const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressEror = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const { listingSchema, reviewSchema } = require("../schema.js");

const validateListing = (req, res, next) => {
  //validating listing using joi
  let { error } = listingSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    //joining all the err messages
    throw new ExpressEror(400, errMsg);
  } else {
    next();
  }
};


/*
"/listings"
this is replaced by
"/"
*/


//Index Route
router.get(
  "/",
  wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

//New Route
router.get("/new", (req, res) => {
  res.render("listings/new.ejs");
});

//Show Route
router.get(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
      req.flash("error","Listing doesn't exists");
      res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
  })
);

//Create Route
router.post(
  "/",
  validateListing, // this middleware will validate the listing
  wrapAsync(async (req, res, next) => {
    // if (!req.body.listing) {
    //   //it just checks whether the listing is present or not, but doesn't check each component,so for schema validation we'll use a tool named 'joi'.
    //   throw new ExpressEror(400, "send valid data for listing");
    // }

    const newListing = new Listing(req.body.listing);
    await newListing.save();
    req.flash("success","New Listing Created!");
    //yeh flash msg sirf ek baar ayega when new listing add hogi,refresh krne ke baad fir se nhi 
    res.redirect("/listings");
  })
);
// router.post(  //-->better way of writing this is using wrapAsync
//   "/",
//   validateListing,
//   async (req, res, next) => {
//     try {
//       const newListing = new Listing(req.body.listing);
//       await newListing.save();
//       res.redirect("/listings");
//     } catch (err) {
//       next(err);
//     }
//   }
// );

//Edit Route
router.get(
  "/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
      req.flash("error","Listing doesn't exists");
      res.redirect("/listings");
    }
    res.render("listings/edit.ejs", { listing });
  })
);

//Update Route
router.put(
  "/:id",
  validateListing,
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    //coz 'req.body.listing' is a js object, so we are breaking the object into {title,description,image,...etc} and updating the current listing
    req.flash("success","Listing Updated!");
    res.redirect(`/listings/${id}`);
  })
);

//Delete Route(we have to delete all the reviews related to the listing)
router.delete(
  "/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let deleted = await Listing.findByIdAndDelete(id);
    //console.log(deleted);
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
  })
);

module.exports = router;
