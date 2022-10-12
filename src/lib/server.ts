import { Server } from 'socket.io'

const io = new Server({
    cors: {
        origin: '*',
    }
})

io.on("connect", (socket) => {
    socket.on('chessMove', (fenValue) => {
        io.emit('emitMove', fenValue)
    })
    console.log(socket.id)

})
io.listen(3000)
console.log('listening on port 3000')


    // socket.on('move-piece', message => {
    //     console.log(message)
    // })