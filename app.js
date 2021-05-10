const express = require("express");
const app = express();
app.use(express.json()); // body-parser
const ejs = require("ejs");

require("./src/database");
let productsModel = require("./src/models/products");

app.route("/products/create").get((req, res) => {
  res.sendFile("insert.html", { root: "./src/pages/products/" });
});

app.route("/products/create").post((req, res) => {
  let { name, price, brand } = req.body; // JS object deconstruction

  let products = new productsModel({
    name: name,
    price: price,
    brand: brand,
  });
  products.save((err) => {
    if (err) res.status(503).send(`Error: ${err}`);
    else res.send(products);
  });
});

app.route("/products/all").get((req, res) => {
  res.sendFile("productsList.html", { root: "./src/pages/products/" });
});

app.route("/products").get(async (req, res) => {
  let allproducts = await productsModel.find();
  res.send(allproducts);
});

app.route("/products/:id").get(async (req, res) => {
  let productsId = req.params.id;
  let products = await productsModel.findOne({ _id: productsId });
  if (products) res.send(products);
  else res.status(404).end(`Product with id ${productsId} does not exist`);
});

app.route("/products/:id").put((req, res) => {
  let productsId = req.params.id;
  let { name, price, brand } = req.body;
  productsModel
    .findOneAndUpdate(
      { _id: productsId }, // selection criteria
      {
        name: name,
        price: price,
        brand: brand,
      }
    )
    .then((products) => res.send(products))
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not update product ${error}`);
    });
});

app.route("/products/:id").delete((req, res) => {
  let productsId = req.params.id;
  productsModel
    .findOneAndDelete({ _id: productsId })
    .then((products) => res.send(products))
    .catch((err) => {
      console.log(error);
      res.status(503).end(`Could not delete product ${error}`);
    });
});

app.route("/products/:id/edit").get((req, res) => {
  let productId = req.params.id;

  // load the products as string, leaver some markers and replace the markers with the info you need
  // create the page from scratch dynamically

  ejs.renderFile(
    "./src/pages/products/edit.html",
    { productId: productId },
    null,
    function (err, str) {
      if (err) res.status(503).send(`error when rendering the view: ${err}`);
      else {
        res.end(str);
      }
    }
  );
});

app.route("/products/insert/insertMany/").get((req, res) => {
  for (i = 0; i < 10; i++) {
    let name = generateRandomString(10);
    let price = generateRandomInt(0, 10000);
    let brand = generateRandomString(10);

    let products = new productsModel({
      name: name,
      price: price,
      brand: brand,
    });
    products.save((err) => {
      if (err) res.status(503).send(`error: ${err}`);
    });
  }
  res.send("done");
});

app.route("/").get((req, res) => {
  res.redirect("http://127.0.0.1:3000/products/all");
});

const portNumber = 3000;
var server = app.listen(portNumber, function () {
  console.log("SERVER :: Ready and running at PORT:" + portNumber + ".");
});

// HELPER FUNCTIONS
function generateRandomString(length) {
  var result = [];
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result.push(
      characters.charAt(Math.floor(Math.random() * charactersLength))
    );
  }
  return result.join("");
}

function generateRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
