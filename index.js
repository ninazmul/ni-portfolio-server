const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());
// const itemCollection = client.db("portfolioDB").collection("portfolio");

// app.get("/items", async (req, res) => {
//   const result = await itemCollection.find().toArray();
//   res.send(result);
// });

const uri =
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e8yqorq.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    const itemCollection = client.db("portfolioDB").collection("portfolio");

    const userCollection = client.db("portfolioDB").collection("users");

    // users api 
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    app.patch(
      "/users/admin/:id",
      async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
      }
    );
    // app.get("/users/admin/:email", verifyToken, async (req, res) => {
    //   const email = req.params.email;

    //   if (email !== req.decoded.email) {
    //     return res.status(403).send({ message: "forbidden access" });
    //   }

    //   const query = { email: email };
    //   const user = await userCollection.findOne(query);
    //   let admin = false;
    //   if (user) {
    //     admin = user ? user.role === "admin" : false;
    //   }
    //   res.send({ admin });
    // });

    app.get('/items', async (req, res) => {
      const result = await itemCollection.find().toArray();
      res.send(result);
    });

    app.post('/items', async (req, res) => {
      const item = req.body;
      const result = await itemCollection.insertOne(item);
      res.send(result);
    })

    
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
  res.send("N.I. Nazmul's portfolio server is running...");
});

app.listen(port, () => {
  console.log(`N.I. Nazmul's portfolio server is running on port ${port}`);
});