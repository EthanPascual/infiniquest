const mongoose = require('mongoose')
const GameState = require('./stateSchema.js')

const userConvo = mongoose.Schema({
    userId: String,
    convo: [{
        role: String,
        content: String,
    }],
    currGameState: { type: mongoose.Schema.Types.ObjectId, ref: 'GameState' }
})

module.exports = mongoose.model('UserConvo', userConvo);