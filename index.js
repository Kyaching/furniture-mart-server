const {MongoClient, ServerApiVersion} = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1cwqvry.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function connectDB() {
  try {
    client.connect();
  } catch (err) {
    console.log("error occurred", err);
  }
}
connectDB();

const categoriesCollection = client.db("esell").collection("categories");
const usersCollection = client.db("esell").collection("users");
const productsCollection = client.db("esell").collection("products");
const bookingsCollection = client.db("esell").collection("bookings");

// categories
app.get("/categories", async (req, res) => {
  try {
    const cursor = categoriesCollection.find({});
    const result = await cursor.toArray();
    res.send({
      status: true,
      message: "Successfully got data",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Not get data ${err}`,
    });
  }
});

// users
app.get("/users", async (req, res) => {
  try {
    const cursor = usersCollection.find({});
    const result = await cursor.toArray();
    res.send({
      status: true,
      message: "Successfully got data",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Not get data ${err}`,
    });
  }
});

app.post("/users", async (req, res) => {
  try {
    const user = req.body;
    const result = await usersCollection.insertOne(user);
    res.send({
      status: true,
      message: "Successfully data added",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Insertion error occurred ${err}`,
    });
  }
});

app.get("/users/:email", async (req, res) => {
  try {
    const email = req.params.email;
    const result = await usersCollection.findOne({email});
    res.send({
      status: true,
      message: "Successfully data added",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Not get data ${err}`,
    });
  }
});

// products
app.post("/products", async (req, res) => {
  try {
    const user = req.body;
    const result = await productsCollection.insertOne(user);
    res.send({
      status: true,
      message: "Successfully data added",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Insertion error occurred ${err}`,
    });
  }
});
app.get("/products", async (req, res) => {
  try {
    const cursor = productsCollection.find({});
    const result = await cursor.toArray();
    res.send({
      status: true,
      message: "Successfully got data",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Not get data ${err}`,
    });
  }
});
app.get("/products/:categoryName", async (req, res) => {
  try {
    const name = req.params.categoryName;
    const filter = {
      productCategory: name,
    };
    const cursor = productsCollection.find(filter);
    const result = await cursor.toArray();
    res.send({
      status: true,
      message: "Successfully got data",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Not get data ${err}`,
    });
  }
});

// bookings

app.post("/bookings", async (req, res) => {
  try {
    const product = req.body;
    const result = await bookingsCollection.insertOne(product);
    res.send({
      status: true,
      message: "Successfully data added",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Insertion error occurred ${err}`,
    });
  }
});

app.get("/", (req, res) => {
  res.send({status: true, message: "Server running successfully"});
});

app.listen(port, () => console.log(`E-sell server running on port: ${port}`));
