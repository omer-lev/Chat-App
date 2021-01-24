const mongoose = require('mongoose');
const Message = require('./message')

var roomSchema = new mongoose.Schema({
    name: String,
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
})

module.exports = mongoose.model('Room', roomSchema);