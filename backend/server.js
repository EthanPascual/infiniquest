const express = require('express')
const app = express()
const port = 3000
require('dotenv').config()
const connectDB = require('./config.js')
const gameRoutes = require('./gameRoutes.js')
const cors = require('cors')

const corsOptions = {
    origin: "http://localhost:5173"
}

app.use(cors(corsOptions));
app.use(express.json());
connectDB();

app.use('/api/game', gameRoutes);


app.listen(port, () => {
    console.log(`Server Listening on Port: ${port}`)
})