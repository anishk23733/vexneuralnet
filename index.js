const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors()); // Uses the middleware
app.use(express.json());
app.set('view engine', 'pug')

app.get("/gaelscout", (req, res) => {});

app.post("/gaelscout", (req, res) => {
    res.json({
        message: "hi!"
    });
});

app.get("/", (req, res) => {
    res.json({
        message: "No data"
    });
});

app.listen(5000, () => {
    console.log("Listening on http://localhost:5000");
});