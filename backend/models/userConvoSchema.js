const mongoose = require('mongoose')

const userConvo = mongoose.Schema({
    userId: String,
    convo: [{
        role: String,
        content: String
    }]  
})

module.exports = mongoose.model('UserConvo', userConvo);