
const express = require('express');
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require("jsonwebtoken")
const app = express();
const port = process.env.PORT | 4000;
require('dotenv').config();

app.use(cors());
app.use(express.json());




// user: dbGeniusUser
// password: KZF6VyEmbrkYeXoR
console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lsgnws9.mongodb.net/?retryWrites=true&w=majority`;





// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
const verifyJwt = (req, res, next) => {
    const authHeaders = req.headers.authorizations;
    if (!authHeaders) {
        res.status(401).send({ message: "unauthorization access" })
    }
    const token = authHeaders.split(' ')[1];
    jwt.verify(token, process.env.ACESS_TOKEN_SECRET, function (err, decoted) {
        if (err) {
            res.status(401).send({ message: "unauthorization access" })

        }
        req.decoted = decoted;
        next();
    })
}

async function run() {
    try {
        client.connect();
        const serviceConections = client.db("geniusCar").collection("services");
        const orderService = client.db("geniusCar").collection("order");
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACESS_TOKEN_SECRET, { expiresIn: "7d" })
            res.send({ token })
            console.log(user.email)
        })
        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceConections.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })


        app.get('/service/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const services = await serviceConections.findOne(query);
            res.send(services);
        })
        //order api
        app.get('/orders', verifyJwt, async (req, res) => {

            const decoted = req.decoted;
            if (decoted.email === req.query.email) {
                res.status(401).send({ message: "unauthorizetion" })
            }


            let query = {};
            if (req.query.email) {
                query = {
                    email: req.query.email
                }
            }

            const cursor = orderService.find(query);
            const order = await cursor.toArray();
            res.send(order);
        })

        app.post("/orders", async (req, res) => {
            const order = req.body;
            const result = await orderService.insertOne(order);
            res.send(result);
        })
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await orderService.deleteOne(query)
            res.send(result)
        })


        // Connect the client to the server	(optional starting in v4.7)

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");



    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);





app.get("/", (req, res) => {
    res.send("genius car server ")
});
app.listen(port, () => {
    console.log(`Genius car server on ${port}`)
})