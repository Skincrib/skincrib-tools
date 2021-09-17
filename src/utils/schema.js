const mongoose = require('mongoose');

module.exports = mongoose.model('item_prices', new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}));