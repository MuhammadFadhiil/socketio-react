const app = require("express")();
const server = require("http").createServer(app);
const PORT = 5000;
const { nanoid } = require("nanoid");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let users = []
let rooms = []

io.on('connection', (socket) => {
    socket.emit("me", socket.id)
    users.push(socket.id)

    socket.broadcast.emit('updateUsers', users)

    socket.on('disconnect', () => {
        users = users.filter((user) => user !== socket.id)
        socket.broadcast.emit('updateUsers', users)
        socket.disconnect()
    })

    socket.emit('getAllUsers', users)

    // rooms
    socket.on('create_room', () => {
        const room = {
            id: nanoid(7),
            chat: [],
        }

        socket.join(room)
        socket.emit('get_room', room)
        rooms.push(room)
        socket.broadcast.emit('updateRooms', rooms)
    })

    socket.on('join_room', (room) => {
        socket.join(room.id)
    })

    socket.broadcast.emit('updateRooms', rooms)

    socket.on('message', (payload) => {
        rooms.map((room) => {
            if (room.id === payload.room) {
              singleChat = { message: payload.message, writer: payload.socketId };
              room.chat.push(singleChat);
              payload.chat = room.chat;
            }
    })

    io.to(payload.room).emit("chat", payload);
  })
})

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})