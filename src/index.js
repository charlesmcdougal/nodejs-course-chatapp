const path = require('path')
const http = require('http')
const hbs = require('hbs')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('./utils/users')

const port = process.env.PORT
const app = express()

//kludge code to allow the client mustache code to see dynamic variables
hbs.registerHelper('raw', function (value) {
    return value.fn()
});

//this is normally done automatically, but is
//necessary to do it explicitly for socket.io
const server = http.createServer(app)

const io = socketio(server)

// app.use(express.json())

//define paths for express config
const publicDirectoryPath = path.join(__dirname, '../public')
const viewsPath = path.join(__dirname, '../templates/views')
const partialsPath = path.join(__dirname, '../templates/partials')

//setup handlebars engine in express and 'views' location
app.set('view engine', 'hbs')
app.set('views', viewsPath)
hbs.registerPartials(partialsPath)

//setup static directory to serve static content (images, etc.)
app.use(express.static(publicDirectoryPath))

app.get('', (req, res) => {
    res.render('index', {
        title: 'Chat App',
        name: 'Charles McDougal'
    })
})

app.get('/chat', (req, res) => {
    res.render('chat', {
        title: 'Chat App',
        name: 'Charles McDougal'
    })
})

io.on('connection', (socket) => {
    console.log('New WebSocket connection')

    socket.on('join', ({ username, room }, callback) => {
        
        const { error, user } = addUser({ id: socket.id, username, room })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('welcomeMessage', generateMessage('Admin', 'Welcome!'))
        socket.broadcast.to(user.room).emit('updateMessages', generateMessage('Admin', `${user.username} has joined the chat.`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id)

        const filter = new Filter()
        if(filter.isProfane(message)) {
            return callback('Profanity was detected in the message.')
        }
        io.to(user.room).emit('updateMessages', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (location, callback) => {

        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocation(user.username, `https://www.google.com/maps?q=${location.lat},${location.long}`))
        callback('Location shared successfully.')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user) {
            io.to(user.room).emit('updateMessages', generateMessage('Admin', ` ${user.username} has left the chat.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log('Server is up on ', port)
})