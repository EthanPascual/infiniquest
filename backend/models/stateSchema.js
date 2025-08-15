const mongoose = require('mongoose');

const gameStateSchema = new mongoose.Schema({
    stateName: { type: String, required: true },
    description: { type: String, required: true },
    actions: [
        {
            actionText: { type: String, required: true },
            nextStateId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameState' }
        }
    ]
});

module.exports = mongoose.model('GameState', gameStateSchema);