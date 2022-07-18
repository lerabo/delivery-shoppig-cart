var mongoose = require("mongoose");
var Product = require("../models/product");
const { faker } = require("@faker-js/faker");

mongoose.connect(
  "mongodb+srv://vercel-admin-user:QkFv0Usb0jQLTZjC@cluster0.43cr434.mongodb.net/shopping_cart?retryWrites=true&w=majority"
);

Product.deleteMany({})
  .then(function () {
    console.log("Data deleted"); // Success
  })
  .catch(function (error) {
    console.log(error); // Failure
  });

var products = [];
for (let i = 0; i < 25; i++) {
  let item = new Product({
    imagePath: faker.image.image(),
    title: faker.commerce.productName(),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(10, 90, 0),
  });
  products.push(item);
};

let done = 0;
for (let i = 0; i < products.length; i++) {
  products[i].save(() => {
    done++;
    if (done === products.length) {
      mongoose.disconnect();
    }
  });
}
