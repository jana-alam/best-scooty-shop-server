const { MongoClient } = require("mongodb");
const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());
const ObjectId = require("mongodb").ObjectId;

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
    const orderCollection = database.collection("orders");
    const reviewCollection = database.collection("reviews");

    // USER POST
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
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
      res.json(products);
    });
    // get product for home
    app.get("/home/products", async (req, res) => {
      const cursor = productCollection.find({});
      const products = await cursor.limit(6).toArray();
      res.json(products);
    });
    // get product by id
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.json(result);
    });

    // Add Product POST
    app.post("/product", async (req, res) => {
      const product = req.body;
      product.stock = "In Stock";
      const result = await productCollection.insertOne(product);
      console.log(result);
      res.json(result);
    });

    // Order POST
    app.post("/order", async (req, res) => {
      const order = req.body;
      order.status = "pending";
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // get order
    app.post("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    // update order Status
    app.put("order/status/:id", async (req, res) => {
      const updateOrderId = req.params.id;
      const filter = { _id: ObjectId(updateOrderId) };
      const updatedDoc = { $set: { status: "shipped" } };
      const result = await orderCollection.updateOne(filter, updatedDoc);
      console.log(result);
      res.json(result);
    });

    // delete order
    app.delete("/orders/:id", async (req, res) => {
      const orderId = req.params.id;
      const query = { _id: ObjectId(orderId) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

    // Post Review
    app.post("/review", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });
    // get reviews
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.json(reviews);
    });

    app.get("/my-orders/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const cursor = orderCollection.find(query);
      const myOrders = await cursor.toArray();
      res.json(myOrders);
    });

    app.delete("/my-order/:orderId", async (req, res) => {
      const deleteId = req.params.orderId;
      const query = { _id: ObjectId(deleteId) };
      const result = await orderCollection.deleteOne(query);
      console.log(result);
      res.json(result);
    });

    // above this
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
