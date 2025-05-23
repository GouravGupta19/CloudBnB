const Listing = require("../models/listing");
const review = require("../models/review");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  //for each listing-> populate its reviews and owner
  //for each review-> populate its author(nested populate)
  if (!listing) {
    req.flash("error", "Listing doesn't exists");
    res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  //the one who is creating this listing will be the owner of this listing
  //so we are fetching the id of the requesting owner using passport
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  await newListing.save();
  req.flash("success", "New Listing Created!");
  //yeh flash msg sirf ek baar ayega when new listing add hogi,refresh krne ke baad fir se nhi
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing doesn't exists");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs", { listing });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  //let listing = await Listing.findById(id);
  // if (res.locals.currUser && !listing.owner.equals(res.locals.currUser._id)) {
  //   req.flash("error", "You don't have permission to edit");
  //   return res.redirect(`/listings/${id}`);
  //   //instead of pasting this authorization code everywhere, we can make it a middleware
  // }

  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deleted = await Listing.findByIdAndDelete(id);
  //console.log(deleted);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
