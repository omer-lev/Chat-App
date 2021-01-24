const mongoose = require('mongoose');

var messageSchema = new mongoose.Schema({
    message: String
})

module.exports = mongoose.model('Message', messageSchema);
