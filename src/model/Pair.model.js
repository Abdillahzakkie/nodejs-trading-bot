const mongoose = require('mongoose');

const pairSchema = new mongoose.Schema({
    token0: {
        type: String,
        required: true
    },
    token1: {
        type: String,
        required: true
    },
    pair: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

module.exports = new mongoose.model("pair", pairSchema);