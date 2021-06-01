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
    },
    blockNumber: {
        type: String,
        required: true
    },
    transactionHash: {
        type: String,
        required: true
    },
    sortedOrder: {
        type: Boolean,
        required: true
    },
    reserve0: {
        type: String,
        required: true
    },
    reserve1: {
        type: String,
        required: true
    },
    trade: {
        type: Array,
        required: false,
        default: []
    }
}, {
    timestamps: true
})

module.exports = new mongoose.model("pair", pairSchema);