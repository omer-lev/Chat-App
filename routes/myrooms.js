const express = require('express');
const router = express.Router();
const Room = require('../models/room.js');
const Message = require('../models/message.js');
const User = require('../models/user.js');
const isLoggedIn = require('../middleware.js')


router.get('/', isLoggedIn, (req, res) => {
    User.findById(req.user._id).populate("rooms").exec((err, user) => {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            res.render('myRooms', {user: user});
        }
    })
})

router.get('/create', isLoggedIn, (req, res) => {
    res.render('create');
})

// Create a new chat room
router.post('/create', isLoggedIn, (req, res) => {
    var roomName = req.body.roomName

    // find user by ID
    User.findById(req.user._id, (err, user) => {
        if (err) {
            console.log(err);
        } else {
            // create room in that user
            Room.create({ name: roomName }, (err, room) => {
                if (err) {
                    console.log(err);
                    res.redirect('/create')
                } else {
                    user.rooms.push(room);
                    user.save();

                    res.redirect('/myrooms');
                    req.flash('success', 'Successfully created a new room!');
                }
            })
        }
    })
})

// Get chat room and find existing messages in it
router.get('/:room', isLoggedIn, (req, res) => {
    // var name = req.user.username
    var name = req.user.username;

    Room.findById(req.params.room).populate("messages").exec((err, room) => {
        if (err) {
            req.flash('error', 'Cannot find requested room');
            res.redirect('/myrooms')
        } else {
            res.render('room', { roomId: req.params.room, room: room, name: name });
        }
    })
})

// Send posted message to the database
router.post('/:room', (req, res) => {
    var message = req.body.message

    // Find room by ID
    Room.findById(req.params.room, (err, room) => {
        if (err) {
            console.log(err);
        } else {
            // Create message in that room
            Message.create({ message: message }, (err, message) => {
                if (err) {
                    console.log(err);
                } else {
                    room.messages.push(message)
                    room.save()
                }
            })
        }
    })
    // Connect message to the database
})


module.exports = router;