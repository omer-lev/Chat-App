const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')


app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

mongoose.connect('mongodb://localhost/chat-app')
app.set('view engine', 'ejs')


var messageSchema = new mongoose.Schema({
    message: String
})

var Message = mongoose.model("Message", messageSchema)


app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    Message.find({}, (err, message) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {roomId: req.params.room, messages: message})
        }
    })
})

app.post('/room', (req, res) => {
    var message = req.body.message


})

users = {}

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