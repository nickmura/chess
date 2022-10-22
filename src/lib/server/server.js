// @ts-nocheck
import { Server } from 'socket.io'
import { createClient } from 'redis';
import { post } from './cred.js'
import express from 'express';
import cors from 'cors';
var client = createClient();

const app = express();
app.use(express.urlencoded({ extended: true }))
app.use(express.json());
app.use(cors())

post.connect()


client.connect()
.then(() => {
    app.get('/rooms', async (req, res) => { // sends REDIS games through rest api
        client.get('ROOMS').then(rooms => {
            res.json(rooms)
        })
    })

//     app.post('/address', (req, res) => { <--- This REST API 
//         let address = req.body
//         // 
//         let insert = `insert into usernames("address") values($1)`
//         const values = [address[0].address]
//         post.query(insert, values, (err, result) => {
//             if (!err) console.log('Insertion was successful')
//             if (err.code == '23505') console.log('User gave Duplicate value')
//             else { console.log(err) }
            
//         })
        
//         res.json({message: ''})
//     })
//     app.post('/username', (req, res) => {
//         let user = req.body
//         console.log(user)
        
//         let insert = `UPDATE usernames SET username = ($1) WHERE address = ($2)`;
//         const values = [`${user.username}`, `${user.address}`]
       
//         post.query(insert, values, (err, result) => {
//             if (!err) console.log('Insertion was successful')
//             //if (err.code == '23505') console.log('User gave Duplicate value')
//             else if (err) console.log(err)
            
//         })
        
//         //res.json({message: ''})
//     })

//     app.get('/address', (req, res) => {
//         console.log(res.body)
//         res.json({message: 'Recieved'})
//     })
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


io.on("connection", (socket) => {

    socket.on('createRoom', (uuid, room) => {
        socket.join(`${uuid}`)
        rooms.push(room)
        console.log(rooms)
        let JSONrooms = JSON.stringify(rooms)
        
        io.to(`${uuid}`).emit('emitGame', rooms.find(room => room.gameID === uuid))
        client.set('ROOMS', JSONrooms)
        //socket.emit('listRooms', rooms) --> Currently not used in favor of the REDIS + REST API.
    })
    socket.on('joinRoom', (player2, gameId) => {
        rooms.find(room => room.gameID === gameId).players.push(player2)
        socket.join(`${gameId}`)
        let JSONrooms = JSON.stringify(rooms)
        client.set('ROOMS', JSONrooms)
        io.to(`${gameId}`).emit('hasJoined', `${player2} has joined the game.`)
    })

    socket.on('getPlayers', (gameId) => {
        console.log('Sending players, to game room', gameId);
        io.to(`${gameId}`).emit('resPlayers', rooms.find(room => room.gameID === parseInt(gameId)).players)
    })

    socket.on('chessMove', (gameId, fenValue) => {
        socket.join(`${gameId}`)
        console.log('A chessmove has been made in game room', gameId)
        io.to(`${gameId}`).emit('emitMove', fenValue) // emits the fen Value to the specific room
        rooms.find(room => room.gameID === parseInt(gameId)).fen = fenValue
        console.log(rooms.find(room => room.gameID === parseInt(gameId)).fen)
        let JSONrooms = JSON.stringify(rooms)
        client.set('ROOMS', JSONrooms)
    })

    socket.on('isCheckmate', (gameId, winner) => {
        rooms.find(room => room.gameID === parseInt(gameId)).isCheckmate = 'true'
        let JSONrooms = JSON.stringify(rooms)
        console.log(`room ${gameId} has been won by ${winner} by Checkmate`)
        client.set('ROOMS', JSONrooms)                                       
        // Actually, delete this stuff from the objects 
        // array, and Redis DB
        // actually, a player will leave the room manually.
        io.to(`${gameId}`).emit('getCheckmate', {isCheckmate: true, winner: winner})
    })

    socket.on('isStalemate', (gameId) => {
        console.log('is it a draw?', rooms.find(room => room.gameID === parseInt(gameId)).isDraw)
        rooms.find(room => room.gameID === parseInt(gameId)).isDraw = 'true'
        console.log('is it a draw?', rooms.find(room => room.gameID === parseInt(gameId)).isDraw)
        let JSONrooms = JSON.stringify(rooms)
        console.log(`room ${gameId} is Stalemate (draw)`)
        client.set('ROOMS', JSONrooms)
        io.to(`${gameId}`).emit('getStalemate', {isStalemate: true, isDraw: true})
    })
    socket.on('isDraw', (gameId) => {
        rooms.find(room => room.gameID === parseInt(gameId)).isDraw = 'true'
        let JSONrooms = JSON.stringify(rooms)
        console.log(`room ${gameId} is Draw`)
        client.set('ROOMS', JSONrooms)
        io.to(`${gameId}`).emit('getDraw', {isStalemate: false, isDraw: true})
    })

    socket.on('reconnectRoom', (gameId) => { 
        getRoomsOnStartup()
        socket.join(`${gameId}`)
        console.log('reconnectRoom', gameId)
        socket.join(`${gameId}`)
        console.log(rooms.find(room => room.gameID === parseInt(gameId)).fen)
        io.to(`${gameId}`).emit('fen', rooms.find(room => room.gameID === parseInt(gameId)).fen)
    })

    socket.on('deleteRoom', (gameID, reason) => {
        console.log(rooms)
        const index = rooms.findIndex(room => room.gameID === parseInt(gameID))
        if (index > -1) rooms.splice(index, 1)
        console.log(rooms)
        let JSONrooms = JSON.stringify(rooms)
        client.set("ROOMS", JSONrooms)
    })

    console.log(socket.id)

})

console.log('listening on port 3000, express on 5001')


