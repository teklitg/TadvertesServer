const express = require('express');
const userRoute = require('./route/user'); // Adjust the path as necessary
const cors = require('cors');

const app = express();
app.use(cors()); // Corrected: cors() is a function that needs to be called
app.use(express.json());
app.use("/api", userRoute);

app.get("/home", (req, res) => {
    res.send("Hello World");
});

module.exports = app;
