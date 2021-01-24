const mongoose = require('mongoose');
const Room = require('./room');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },

    rooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        }
    ]
});

module.exports = mongoose.model('User', UserSchema);