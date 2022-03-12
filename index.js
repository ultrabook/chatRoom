const express = require('express');
const res = require('express/lib/response');
const app = express();
const session = require('express-session');
const http = require('http');
const server = http.createServer(app).listen(process.env.PORT || 3000);
const { Server } = require("socket.io");
const io = new Server(server);

app.use(express.urlencoded({ extended: false }))
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'secret session'
}));

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/login.html');
})

app.post('/login', (req, res, next) => {
    req.session.regenerate(() => {
        if (req.body.username) {
            req.session.user = req.body.username;
            res.sendFile(__dirname + '/index.html');
        } else {
            res.redirect('/login');
        }
    });
})

app.get('/sessionUser', (req, res) => {
    var userName = req.session.user;
    res.send(userName);
});

io.on('connection', (socket) => {
    io.emit('chat-message', socket.handshake.auth.username + " connected to the chat");
    socket.on('chat-message', (msg) => {
      io.emit('chat-message', socket.handshake.auth.username + ": " + msg);
    });
    socket.on('disconnect', () => {
        io.emit('chat-message', socket.handshake.auth.username + " disconnected from the chat");
    });
  });

server.listen(3000, () => {
    console.log('listening on port 3000');
});