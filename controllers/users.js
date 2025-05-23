const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    //console.log(registeredUser);
    req.login(registeredUser, (err) => {
      //signed up user automatically gets logged in
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WanderLust!");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  //enters the function only when authentication is done
  req.flash("success", "Welcome back to wanderlust!");
  //user directed to the original url, which he was trin to access
  let redirectUrl = res.locals.redirectUrl || "/listings";
  //if he clicked the login btn on home page the,he'll be directed to "/listings"
  res.redirect(redirectUrl);
  let usr = req.user.username;
  console.log(`user ${usr} logged in!`);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    // let usr = req.user.username;
    // console.log(`user ${usr} logged out!`);
    req.flash("success", "you are logged out!");
    res.redirect("/listings");
  });
};
