const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@janaalam.ewacz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("scooty_shop");
    const userCollection = database.collection("users");
    const productCollection = database.collection("products");

    // USER POST
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log("user in db");
      res.json(result);
    });
    // Make Admin
    app.put("/user/admin", async (req, res) => {
      const email = req.body.email;
      const filter = { email: email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    // checking user role
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await userCollection.findOne(query);
      let admin = false;
      if (result?.role === "admin") {
        admin = true;
      }
      res.json({ admin: admin });
    });
    // get product
    app.get("/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.toArray();
      console.log(products.length);
      res.json(products);
    });

    // Add Product POST
    app.post("/product", async (req, res) => {
      const product = req.body;
      product.stock = "In Stock";
      const result = await productCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });
  } finally {
    // await client.connect();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.json({ message: "Server Running" });
});

app.listen(port, () => {
  console.log("listening on port", port);
});
