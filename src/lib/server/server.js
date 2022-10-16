import { Server } from 'socket.io'
import { createClient } from 'redis';

import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(cors())

var client = createClient();
client.connect()
.then(() => {
    app.get('/rooms', async (req, res) => {

        client.get('ROOMS').then(rooms => {
            res.json(rooms)
        })
    })
})
app.listen(5001)


const io = new Server(3000, {
    cors: {
        origin: 'http://127.0.0.1:5173',
    }
})

let rooms = []



//client.setEx('ROOMS', JSON.stringify(rooms))

io.on("connection", (socket) => {
    socket.emit('listRooms', client.get('ROOMS'))
    /* socket.on('chessMove', (fenValue) => {
        io.emit('emitMove', fenValue)
    })**/

    socket.on('createRoom', (uuid, room) => {
        socket.join(`${uuid}`)
        rooms.push(room)
        console.log(rooms)
        let JSONrooms = JSON.stringify(rooms)
        io.to(`${uuid}`).emit('emitRoom', uuid)
        //socket.emit('listRooms', rooms)
        client.set('ROOMS', JSONrooms)

    })
    console.log(socket.id)

})

console.log('listening on port 3000, express on 5001')


    // socket.on('move-piece', message => {
    //     console.log(message)
    // })