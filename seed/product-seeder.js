const mongoose = require("mongoose");
const Product = require("../models/product");
const { faker } = require("@faker-js/faker");

function deleteData() {
  Product.deleteMany({})
    .then(function () {
      console.log("Data deleted"); // Success
      mongoose.disconnect();
    })
    .catch(function (error) {
      console.log(error); // Failure
    });
}

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
          shop: faker.helpers.arrayElement(['McDonalds', 'Donats', 'Sweeties', 'Vegetables']),
        });
        products.push(item);
      }
      Product.insertMany(products);
      console.log("seedData!");
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = seedData;
