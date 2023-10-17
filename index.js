const express = require("express");
const cors = require("cors");
const userRoutes = require("./usersRoute/usersRoute.js");

const productsRouter = require('./productsRouter/productsRouter.js');

require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;

// Enable  middleware
app.use(cors());
app.use(express.json());

// mongodb connection

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://belal22000:coZLCAV7XMxJjYhq@cluster0.u79sjnl.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("E-commerce").collection("users");
    const productsCollection = client.db("E-commerce").collection("products");
   
   
    // users route
    app.use("/", userRoutes(usersCollection));


    app.use('/', productsRouter(productsCollection));


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("E-commerce server is running ");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
