const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.zdzdyrx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    //all collection
    const biodataCollection = client.db("eternalTie").collection("biodata");
    const successStoriesCollection = client
      .db("eternalTie")
      .collection("successStories");

    //get all query supported biodata
    app.get("/biodata", async (req, res) => {
      try {
        const result = await biodataCollection.find(req.query).toArray();
        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    // Get all/limited premium biodata
    app.get("/biodata/premium", async (req, res) => {
      try {
        const { limit = 6, ageOrder = "asc" } = req.query;
        const result = await biodataCollection
          .find({ biodata_status: "premium" })
          .limit(parseInt(limit)) // Ensure limit is a number
          .sort({ age: ageOrder === "asc" ? 1 : -1 })
          .toArray();

        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
    });

    //get a single biodata
    app.get("/biodata/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const result =
          (await biodataCollection.findOne({ _id: new ObjectId(id) })) || {};

        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    // get male count
    app.get("/biodata/male", async (req, res) => {
      try {
        const count = await biodataCollection.countDocuments({
          biodata_type: male,
        });
        const result = { count };

        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    }); 

    // get female count
    app.get("/biodata/female", async (req, res) => {
      try {
        const count = await biodataCollection.countDocuments({
          biodata_type: female,
        });
        const result = { count };

        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    //get all marriage count
    app.get("/biodata/marriage_status", async (req, res) => {
      try {
        const count = await biodataCollection.countDocuments({
          marriage_status: true,
        });
        const result = { count };

        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

    //get all success stories
    app.get("/success_stories", async (req, res) => {
      try {
        const result = await successStoriesCollection.find().toArray();
        res.status(200).send(result);
      } catch (error) {
        console.log(error);
        res.status(500).send(error);
      }
    });

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
  res.send("EternalTie is running");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
