const mongoose = require('mongoose')
const GameState = require('./stateSchema.js')

const userConvo = mongoose.Schema({
    userId: String,
    convo: [{
        role: String,
        content: String,
    }],
    currGameState: { type: mongoose.Schema.Types.ObjectId, ref: 'GameState' },
    health: {
        type: Number,
        default: 100,
        min: 0,
        max: 100
    }
})

module.exports = mongoose.model('UserConvo', userConvo);