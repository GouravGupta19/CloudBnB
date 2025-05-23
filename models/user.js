const { string, required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
//https://www.npmjs.com/package/passport-local-mongoose

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
  },
});

userSchema.plugin(passportLocalMongoose);
/*
Passport-Local Mongoose will add a username,the hashed password and the salt value.
*/

module.exports = mongoose.model("User", userSchema);
