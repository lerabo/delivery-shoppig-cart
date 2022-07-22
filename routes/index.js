const express = require("express");
const router = express.Router();
const Cart = require("../models/cart");
const Order = require("../models/order");

const Product = require("../models/product");

/* GET home page. */
router.get("/", async (req, res, next) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
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
      errorMsg: errorMsg,
      noError: !errorMsg,
      noMessages: !successMsg,
    });
  } catch (err) {
    console.log(err);
  }
});

router.get("/add-to-cart/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  Product.findById(productId, (err, product) => {
    if (err) {
      return res.redirect("/");
    }
    if (cart.totalPrice === 0) {
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect("/");
    } else if (cart.totalPrice > 0 && cart.shopName === product.shop) {
      cart.add(product, product.id);
      req.session.cart = cart;
      console.log(req.session.cart);
      res.redirect("/");
    } else {
      req.flash(
        "error",
        `You can not order items from different shops. Please, order in ${cart.shopName}`
      );
      console.log(
        `You can not order items from different shops. Please, order in ${cart.shopName}`
      );
      res.redirect("/");
    }
  });
});

router.get("/reduce/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.reduceByOne(productId);
  req.session.cart = cart;
  res.redirect("/shopping-cart");
});

router.get("/increase/:id", (req, res, next) => {
  const productId = req.params.id;
  const cart = new Cart(req.session.cart ? req.session.cart : {});

  cart.increaseItem(productId);
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

router.post("/checkout", isLoggedIn, function (req, res, next) {
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
  order.save();
  req.flash("success", "Successfully bought product!");
  req.session.cart = null;
  res.redirect("/");
});

module.exports = router;

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.session.oldUrl = req.url;
  res.redirect("/user/signin");
}
