const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');

const server = require('http').createServer(app);
const io = require('socket.io')(server);
var users = {};

const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const myrooms = require('./routes/myrooms.js');


require('dotenv').config();
const dbName = process.env.dbName
const dbUser = process.env.dbUser
const dbPass = process.env.dbPass

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'ejs');


const sessionConfig = {
    secret: 'thisismysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // security measure
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // expiration date in milliseconds
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use('/myrooms', myrooms)


const connectionOptions = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}

mongoose.connect(`mongodb+srv://${dbUser}:${dbPass}@chatapp.trnfb.mongodb.net/${dbName}?retryWrites=true&w=majority`, connectionOptions);


// BASE ROUTES
app.get('/', (req, res) => {
    res.render('landing')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.get('/*', (req, res) => {
    req.flash('error', 'Unknown address')
    res.redirect('/');
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