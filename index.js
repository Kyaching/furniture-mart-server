const {MongoClient, ServerApiVersion, ObjectId} = require("mongodb");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

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
const reportsCollection = client.db("esell").collection("reports");
const advertiseCollection = client.db("esell").collection("advertises");
const paymentsCollection = client.db("esell").collection("payments");

function verifyJwtToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({message: "unauthorized access"});
  }

  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({message: "forbidden access"});
    }
    req.decoded = decoded;
    next();
  });
}

// jwt token
app.get("/jwt", async (req, res) => {
  const email = req.query.email;
  const query = {email};
  const user = await usersCollection.findOne(query);
  if (user) {
    const token = jwt.sign({email}, process.env.SECRET_TOKEN, {
      expiresIn: "2d",
    });
    return res.send({accessToken: token});
  }
  res.status(403).send({accessToken: ""});
});
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

app.get("/v2/users/:role", async (req, res) => {
  try {
    const role = req.params.role;

    const cursor = usersCollection.find({role});
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
app.put("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const email = req.body;
    console.log(email.sellerEmail);
    const user = {_id: ObjectId(id)};
    const filter = {userEmail: email.sellerEmail};
    const options = {upsert: true};
    const updatedUser = {
      $set: {
        verified: true,
      },
    };
    const updateProduct = {
      $set: {
        verified: true,
      },
    };
    const result = await usersCollection.updateOne(user, updatedUser, options);
    const updatedProduct = await productsCollection.updateOne(
      filter,
      updateProduct
    );
    res.send({
      status: true,
      message: "Successfully reported data",
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

app.delete("/users/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const user = {_id: ObjectId(id)};
    const result = await usersCollection.deleteOne(user);
    res.send({
      status: true,
      message: "Deleted Data Successfully",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Sorry something is wrong${err}`,
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
    const cursor = productsCollection.find({paid: {$ne: true}});
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

app.put("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = {_id: ObjectId(id)};
    const options = {upsert: true};
    const updatedDoc = {
      $set: {
        reported: "reported",
      },
    };
    const result = await productsCollection.updateOne(
      product,
      updatedDoc,
      options
    );
    res.send({
      status: true,
      message: "Successfully reported data",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Insertion error occurred ${err}`,
    });
  }
});
app.get("/products/:categoryName", async (req, res) => {
  try {
    const query = req.params.categoryName;

    const filter = {
      productCategory: query,
      paid: {$ne: true},
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
app.delete("/products/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = {_id: ObjectId(id)};
    const result = await usersCollection.deleteOne(product);
    res.send({
      status: true,
      message: "Deleted Data Successfully",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Sorry something is wrong${err}`,
    });
  }
});

// bookings

app.get("/bookings", verifyJwtToken, async (req, res) => {
  try {
    const email = req.query.email;
    const decodedEmail = req.decoded.email;

    if (email !== decodedEmail) {
      return res.status(403).send({message: "forbidden access"});
    }
    const query = {buyerEmail: email};
    console.log(query);
    const cursor = bookingsCollection.find(query);
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
app.get("/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await bookingsCollection.findOne(query);
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

// Payment intent Stripe

app.post("/create-payment-intent", async (req, res) => {
  const price = req.body.price;
  const amount = parseFloat(price) * 100;
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      currency: "usd",
      amount: amount,
      payment_method_types: ["card"],
    });
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch {}
});

//payment
app.post("/payments", async (req, res) => {
  const payment = req.body;
  console.log(payment);
  const result = await paymentsCollection.insertOne(payment);
  const id = payment.buyerId;
  const productId = payment.productId;

  const filter = {_id: ObjectId(id)};
  const adFilter = {_id: productId};
  const productsFilter = {_id: ObjectId(productId)};
  console.log(productsFilter);
  const updatedDoc = {
    $set: {
      paid: true,
      transactionId: payment.transactionId,
    },
  };
  const updatedResult = await bookingsCollection.updateOne(filter, updatedDoc);
  const updateAdvertise = await advertiseCollection.updateOne(
    adFilter,
    updatedDoc
  );
  const updateProducts = await productsCollection.updateOne(
    productsFilter,
    updatedDoc
  );
  res.send(result);
});
// reports
app.get("/reports", async (req, res) => {
  try {
    const cursor = reportsCollection.find({});
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

app.post("/reports", async (req, res) => {
  try {
    const product = req.body;
    const result = await reportsCollection.insertOne(product);
    res.send({
      status: true,
      message: `You reported product successfully`,
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Insertion error occurred ${err}`,
    });
  }
});
app.delete("/reports/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = {_id: ObjectId(id)};
    const result = await reportsCollection.deleteOne(product);
    res.send({
      status: true,
      message: "Deleted Data Successfully",
      data: result,
    });
  } catch (err) {
    res.send({
      status: false,
      message: `Sorry something is wrong${err}`,
    });
  }
});

// advertisement
app.get("/advertises", verifyJwtToken, async (req, res) => {
  try {
    const cursor = advertiseCollection.find({paid: {$ne: true}});
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

app.post("/advertises", async (req, res) => {
  try {
    const product = req.body;
    const result = await advertiseCollection.insertOne(product);
    res.send({
      status: true,
      message: `You added product successfully`,
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
