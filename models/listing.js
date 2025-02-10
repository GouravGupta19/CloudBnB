const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  image: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1655322547902-95c676f71c57?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    set: (v) =>
      v === ""
        ? "https://images.unsplash.com/photo-1655322547902-95c676f71c57?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        : v,
    //if v is empty str then this string is assigned
  },
  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },
  reviews: [
    //to store the _ids of the reviews, one to many relation
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

//adding post mongoose middleware,so that, when we delete this listing then
// all the reviews related to the listing also gets deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});
//when this 'listing' will be deleted then , all the reviews in the 'reviews' collection whose _id matches with anyone in the 'listing.reviews' array, will also be deleted

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
