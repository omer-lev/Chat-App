const express = require('express');
const router = express.Router();
const Room = require('../models/room.js');
const Message = require('../models/message.js');
const User = require('../models/user.js');


router.get('/', (req, res) => {
    // var userId = req.user._id;

    // User.findById(req.user._id).populate("rooms").exec((err, rooms) => {
    //     if (err) {
    //         console.log(err);
    //         res.redirect('/');
    //     } else {
    //         console.log(rooms);
    //         res.render('myRooms', {rooms: rooms})
    //     }
    // })

    Room.find({}, (err, rooms) => {
        if (err) {
            console.log(err);
            res.redirect('/');
        } else {
            res.render('myRooms', {rooms, rooms})
        }
    })
})

router.get('/create', (req, res) => {
    res.render('create');
})

// Get chat room and find existing messages in it
router.get('/:room', (req, res) => {
    // var name = req.user.username
    var name = "name";

    Room.findById(req.params.room).populate("messages").exec((err, room) => {
        if (err) {
            console.log(err);
            res.redirect('/')
        } else {
            res.render('room', { roomId: req.params.room, room: room, name: name })
        }
    })
})


// Create a new chat room
router.post('/create', (req, res) => {
    var roomName = req.body.roomName

    // find user by ID
    // User.findById(req.user._id, (err, user) => {
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         // create room in that user
    //         Room.create({ name: roomName }, (err, room) => {
    //             if (err) {
    //                 console.log(err);
    //                 res.redirect('/create')
    //             } else {
    //                 user.rooms.push(room);
    //                 user.save();
    //                 res.redirect('/myrooms');
    //             }
    //         })
    //     }
    // })

    Room.create({ name: roomName }, (err, room) => {
        if (err) {
            console.log(err);
            res.redirect('/myrooms');
        } else {
            res.redirect('/myrooms');
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