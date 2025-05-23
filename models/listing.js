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
    url: String,
    filename: String,
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
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

//adding post mongoose middleware,so that, when we delete this listing then
// all the reviews related to the listing also gets deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});
//when this 'listing' will be deleted then , all the reviews in the 'reviews' collection whose _id matches with anyone in the 'listing.reviews' array, will also be deleted

//one more analogous example
// customerSchema.post("findOneAndDelete", async (customer) => {
//   if (customer.orders.length) {
//     let res = await Order.deleteMany({ _id: { $in: customer.orders } });
//     console.log(res);
//   }
// });

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
