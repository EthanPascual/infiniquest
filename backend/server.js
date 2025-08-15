const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
const connectDB = require('./config.js')
const gameRoutes = require('./gameRoutes.js')

app.use(express.json());
connectDB();

app.use('/api/game', gameRoutes);


app.listen(port, () => {
    console.log(`Server Listening on Port: ${port}`)
})