const mongoose = require('mongoose')

const cartSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    size: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    user_id: {
        type: String,
        required: true
    }
})

const Item = mongoose.model('Item', cartSchema)

module.exports = Item