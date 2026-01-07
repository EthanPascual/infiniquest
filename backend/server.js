const express = require('express')
const app = express()
const port = 3001
require('dotenv').config()
const {connectDB, connectVectorDB} = require('./config.js')
const gameRoutes = require('./gameRoutes.js')
const cors = require('cors')

const corsOptions = {
    origin: "https://infiniquest.onrender.com/"
}

app.use(cors(corsOptions));
app.use(express.json());

connectDB();
connectVectorDB();

app.use('/api/game', gameRoutes);


app.listen(port, () => {
    console.log(`Server Listening on Port: ${port}`)
})

const GameState = require('./models/stateSchema')
const UserConvo = require('./models/userConvoSchema')

async function clearDatabase() {

    await GameState.deleteMany({});
    await UserConvo.deleteMany({});
    return { success: true, message: 'Database cleared' };

}
app.delete('/api/clear-db', async (req, res) => {
    const result = await clearDatabase();
    
    res.json(result)
});


module.exports = app;