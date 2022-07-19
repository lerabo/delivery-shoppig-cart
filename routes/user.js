const express = require("express");
const router = express.Router();
const csrf = require("csurf");
const passport = require("passport");

const Cart = require("../models/cart");
const Order = require("../models/order");

const csrfProtection = csrf();
router.use(csrfProtection);

router.get("/profile", isLoggedIn, (req, res, next) => {
  Order.find({ user: req.user }, (err, orders) => {
    if (err) {
      return res.write("Error!");
    }
    orders.forEach((order) => {
      const cart = new Cart(order.cart);
      order.items = cart.generateArray();
    });
    console.log(orders);
    res.render("user/profile", { orders: orders });
  });
});

router.get("/logout", isLoggedIn, function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

router.use("/", notLoggedIn, function (req, res, next) {
  next();
});

router.get("/signup", function (req, res, next) {
  let messages = req.flash("error");
  res.render("user/signup", {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signup",
  passport.authenticate("local.signup", {
    failureRedirect: "/user/signup",
    failureFlash: true,
  }),
  (req, res, next) => {
    if (req.session.oldUrl) {
      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/user/profile");
    }
  }
);

router.get("/signin", function (req, res, next) {
  let messages = req.flash("error");
  res.render("user/signin", {
    csrfToken: req.csrfToken(),
    messages: messages,
    hasErrors: messages.length > 0,
  });
});

router.post(
  "/signin",
  passport.authenticate("local.signin", {
    failureRedirect: "/user/signin",
    failureFlash: true,
  }),
  (req, res, next) => {
    if (req.session.oldUrl) {
      const oldUrl = req.session.oldUrl;
      req.session.oldUrl = null;
      res.redirect(oldUrl);
    } else {
      res.redirect("/user/profile");
    }
  }
);

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}

function notLoggedIn(req, res, next) {
  if (!req.isAuthenticated()) {
    return next();
  }
  res.redirect("/");
}
