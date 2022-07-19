const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Order = require("../models/order");

const Product = require("../models/product");

/* GET home page. */
router.get("/", async (req, res, next) => {
  const successMsg = req.flash("success")[0];
  try {
    const items = await Product.find();
    let productChunks = [];
    const chunkSize = 3;
    for (let i = 0; i < items.length; i += chunkSize) {
      productChunks.push(items.slice(i, i + chunkSize));
    }
    res.render("shop/index", {
      title: "Shopping Cart",
      products: productChunks,
      successMsg: successMsg,
      noMessages: !successMsg,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/add-to-cart/:id", async (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});
  try {
    const product = Product.findById(productId);
    cart.add(product, product.id);
    req.session.cart = cart;
    console.log(req.session.cart);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

router.get("/reduce/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/remove/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.removeItem(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/shopping-cart", function (req, res, next) {
  if (!req.session.cart) {
    return res.render("shop/shopping-cart", { products: null });
  }
  const cart = new Cart(req.session.cart);
  return res.render("shop/shopping-cart", {
    products: cart.generateArray(),
    totalPrice: cart.totalPrice,
  });
});

router.get("/checkout", isLoggedIn, function (req, res, next) {
  if (!req.session.cart) {
    return res.redirect("shop/shopping-cart");
  }
  const cart = new Cart(req.session.cart);
  const errMsg = req.flash("error")[0];
  res.render("shop/checkout", {
    total: cart.totalPrice,
    errMsg: errMsg,
    noError: !errMsg,
  });
});

router.post("/checkout", isLoggedIn, async (req, res, next) => {
  try {
    if (!req.session.cart) {
      return res.redirect("shop/shopping-cart");
    }
    const cart = new Cart(req.session.cart);
    const order = new Order({
      user: req.user,
      cart: cart,
      address: req.body.address,
      name: req.body.name,
    });
    order.save((err, result) => {
      req.flash("success", "Successfully bought product!");
      req.session.cart = null;
      res.redirect("/");
    });
  } catch (err) {
    console.log(err);
  }
});
module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/user/signin");
}
