import { Server } from 'socket.io'

const io = new Server({
    cors: {
        origin: '*',
    }
})

io.on("connect", (socket) => {
    socket.on('chess', (arg) => {
        console.log(arg);
    })
    console.log(socket.id)

})
io.listen(3000)
console.log('listening on port 3000')


    // socket.on('move-piece', message => {
    //     console.log(message)
    // })