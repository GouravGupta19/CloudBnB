if (process.env.NODE_ENV != "production") {
  //coz now we are in development phase
  require("dotenv").config();
}
//console.log(process.env.SECRET);

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
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");

const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
//dest of files to be stored-> stored in cloudinary,now though new.ejs form we can upload files and that files will be uploaded to cloud

/*
"/listings"
this is replaced by
"/"
*/

//Index Route
router.get("/", wrapAsync(listingController.index));

//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//Show Route
router.get("/:id", wrapAsync(listingController.showListing));

//Create Route
router.post(
  "/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  //uploading the file to cloud
  wrapAsync(listingController.createListing)
);

//Edit Route
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

//Update Route
router.put(
  "/:id",
  isLoggedIn,
  isOwner,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

//Delete Route(we have to delete all the reviews related to the listing)
router.delete(
  "/:id",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);

module.exports = router;
