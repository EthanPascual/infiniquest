const express = require('express')
const app = express()
const mongoose = require('mongoose')
const port = 3000
require('dotenv').config()

app.use(express.json())
const uri = process.env.MONGO_URI
mongoose.connect(uri)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error Connecting to MongoDB", err))

app.listen(port, () => {
    console.log(`Server Listening on Port: ${port}`)
})