const dotenv = require('dotenv');
dotenv.config()
const io = require('socket.io')(process.env.PORT || 8800, {
    cors: {
        // origin: 'http://localhost:5173'
        origin: process.env.IO_ORIGIN
    }
})
let activeUsers = []
io.on('connection', (socket) => {
    // add new user
    socket.on('new-user-add', (newUserId) => {
        // if user is not added previously
        if (!activeUsers.some((user) => user.userId === newUserId)) {
            activeUsers.push({
                userId: newUserId,
                socketId: socket.id
            })
        }
        console.log('connected', activeUsers)
        io.emit('get-users', activeUsers)
    })

    // send message
    socket.on('send-message', (data) => {
        const { receiverId } = data
        const user = activeUsers.find(user => user.userId === receiverId)
        console.log("Sending from socket to: ", receiverId)
        console.log('DATA:', data)
        if(user) {
            io.to(user.socketId).emit('receive-message', data)
        }
    })

    socket.on('disconnect', () => {
        activeUsers = activeUsers.filter(user => user.socketId !== socket.id)
        console.log('User disconnected', activeUsers);
        io.emit('get-users', activeUsers)
    })
})

