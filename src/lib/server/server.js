// @ts-nocheck
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

/**
 * @type {any[]}
 */
let rooms = []

async function getRoomsOnStartup() {
    if (await client.get('ROOMS') != null) {
        rooms =  await client.get('ROOMS')
        rooms = JSON.parse(rooms)
    } else {
        rooms = []
    }

    console.log(rooms)
}
getRoomsOnStartup()
//client.setEx('ROOMS', JSON.stringify(rooms))

io.on("connection", (socket) => {
    //socket.emit('listRooms', client.get('ROOMS'))

    socket.on('chessMove', (gameId, fenValue) => {
        io.to(`${gameId}`).emit('emitMove', fenValue) // emits the fen Value to the specific room
        rooms.find(room => room.gameID === gameId).fen = fenValue
        client.set('ROOMS', rooms)
        io.to(`${gameId}`).emit('fen', client.get('ROOMS'))
    })

    socket.on('createRoom', (uuid, room) => {
        socket.join(`${uuid}`)
        rooms.push(room)
        console.log(rooms)
        let JSONrooms = JSON.stringify(rooms)
        io.to(`${uuid}`).emit('emitRoom', uuid)
        //socket.emit('listRooms', rooms) --> Currently not used in favor of the REDIS + REST API.
        client.set('ROOMS', JSONrooms)
    })

    socket.on('joinRoom', (player2, gameId) => {
        rooms.find(room => room.gameID === gameId).players.push(player2)
        socket.join(`${gameId}`)
        let JSONrooms = JSON.stringify(rooms)
        client.set('ROOMS', JSONrooms)
        io.to(`${gameId}`).emit('hasJoined', `${player2} has joined the game.`)
    })

    socket.on('reconnectRoom', (gameId) => {
        socket.join(`${gameId}`)
        socket.emit('fen', client.get('ROOMS'))
    })

    console.log(socket.id)

})

console.log('listening on port 3000, express on 5001')


    // socket.on('move-piece', message => {
    //     console.log(message)
    // })