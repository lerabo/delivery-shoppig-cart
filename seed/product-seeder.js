const mongoose = require("mongoose");
const Product = require("../models/product");
const { faker } = require("@faker-js/faker");

mongoose.connect(
  "mongodb+srv://vercel-admin-user:QkFv0Usb0jQLTZjC@cluster0.43cr434.mongodb.net/shopping_cart?retryWrites=true&w=majority"
);

const deleteData = () => {
  Product.deleteMany({})
    .then(function () {
      console.log("Data deleted"); // Success
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
};

async function seedData() {
  try {
    const items = await Product.find();
    if (items.length === 0) {
      let products = [];
      for (let i = 0; i < 24; i++) {
        let item = new Product({
          imagePath: faker.image.food(640, 480, true),
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price(10, 90, 0),
        });
        products.push(item);
      }
      console.log("seedData!");

      let done = 0;
      for (let i = 0; i < products.length; i++) {
        products[i].save(() => {
          done++;
          if (done === products.length) {
            mongoose.disconnect();
          }
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = seedData;
