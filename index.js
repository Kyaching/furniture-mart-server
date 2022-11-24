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

const usersCollection = client.db("esell").collection("users");

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

app.get("/", (req, res) => {
  res.send({status: true, message: "Server running successfully"});
});

app.listen(port, () => console.log(`E-sell server running on port: ${port}`));
