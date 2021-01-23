const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');


require('dotenv').config();
const dbName = process.env.dbName
const dbUser = process.env.dbUser
const dbPass = process.env.dbPass

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.json());

app.set('view engine', 'ejs');


const connectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}
mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@chatapp.trnfb.mongodb.net/${dbName}?retryWrites=true&w=majority`, connectionOptions);

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

var User = mongoose.model('User', UserSchema)


var messageSchema = new mongoose.Schema({
    message: String
})

var Message = mongoose.model('Message', messageSchema)


var roomSchema = new mongoose.Schema({
    name: String,
    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ]
})

var Room = mongoose.model('Room', roomSchema)


var users = {}


app.get('/', (req, res) => {
    res.render('landing')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/myrooms', (req, res) => {
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

app.get('/create', (req, res) => {
    res.render('create');
})

// Get chat room and find existing messages in it
app.get('/:room', (req, res) => {
    // var name = req.user.username
    var name = "name";

    Room.findById(req.params.room).populate("messages").exec((err, room) => {
        if (err) {
            console.log(err);
            res.redirect('/')
        } else {
            console.log(room);
            res.render('room', { roomId: req.params.room, room: room, name: name })
        }
    })
})


// Create a new chat room
app.post('/create', (req, res) => {
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
app.post('/:room', (req, res) => {
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


// Realtime communication handling
io.on('connection', (socket) => {
    socket.on('join-room', (roomId, name) => {
        socket.join(roomId)
        users[socket.id] = name
        socket.to(roomId).broadcast.emit('user-connected', name)

        socket.on('send-chat-message', msg => {
            socket.to(roomId).broadcast.emit('chat-message', { message: msg, name: users[socket.id] })
        })    

        socket.on('disconnect', () => {
            socket.to(roomId).broadcast.emit('user-disconnected', users[socket.id])
        })
    })

    
})

server.listen(3000, () => {
    console.log("Server listening on port 3000\n");
})