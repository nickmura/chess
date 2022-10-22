<script>
		// @ts-nocheck
		import { writable } from 'svelte/store';
		import { browser } from '$app/environment';
		import '$lib/cgstyles/chessground.css';
		import { io } from 'socket.io-client';
		import { goto } from '$app/navigation';

		import Auth from '../lib/Auth.svelte' //Not really important right now
		const socket = io("http://localhost:3000")

		let counter=0
		let rooms = []
		let currentRoom
		let currentGame

		if (browser) {
			currentRoom = sessionStorage.getItem('roomID')

		}	
		async function getRooms() {
			const res = await fetch('http://localhost:5001/rooms')
			if (await res === null) rooms = [{placeholder: ''}]
			else rooms = JSON.parse(await res.json())
		}
		setInterval(getRooms, 1000)

		let isMade
		function createChessRoom() {
			isMade = true
			counter++;
			let uuid = Math.floor(Math.random()*10000)
			sessionStorage.setItem('roomID', uuid)
			let room = {gameID: uuid, game: 'chess', players: [], isCheckmate: 'false', isDraw: 'false', fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', stake: '0'}
			room.players.push(`player${counter}`)
			socket.emit('createRoom', uuid, room)
			goto('./play')

		}


		function joinGame(gameId) {
			counter++;
			let player2 = `player${counter}`
			sessionStorage.setItem('roomID', gameId)
			rooms.find(room => room.gameID === gameId).players.push(player2)

			// need to do socket.emit and send back info to server
			socket.emit("joinRoom", player2, gameId)
			goto('./play')
		}

		function gotoGameRoom() {
			goto('./play')
		}
	</script>

	{#if currentRoom}
	<div style='font-size: 3rem;'>It seems you have a room already. Click<button class='btn btnlink' 
		style='font-size: 3rem;'><u style='color: blue;' on:click={gotoGameRoom}>here</u></button> to go your game!</div>
	{/if}

	{#if !currentRoom}
	<button type='button' on:click={createChessRoom} class='btn btn-primary'>Create Room</button>
	{:else if currentRoom}
	<button type='button' class='btn btn-primary disabled' disabled>Create Room</button>
	{/if}

	
	{#each rooms as room}
		{#if room.players.length < 2}

			<div class="rooms">
				<div class='gameID'>
					ID: {room.gameID}
				</div>

				<div class='players'>
					Players:  {room.players}
				</div>

				<div class='game'>
					Game: {room.game}
				</div>

				<div class='stake'>
					Stake: {room.stake}
				</div>
				{#if !currentRoom}
				<button on:click={(e)=>joinGame(room.gameID)} class='btn btn-primary'> 
					Join Game
				</button>
				{:else if currentRoom || isMade}
					<button on:click={(e)=>joinGame(room.gameID)} class='btn btn-primary disabled' disabled> 
						Join Game
					</button>
				{/if}
			</div>
			<hr>
		{/if}
	{/each}
	<style>

		.rooms {
			margin-top: 1rem;
			font-family: 'monospace';
			font-size: 2.2rem;
			display: flex;
			justify-content: space-between;
			
		}
		:global(.cg-wrap coords.files) {
			bottom: 0;
			text-align: right;
		}
	
		:global(.cg-wrap coords) {
			font-weight: bold;
		}
	
		div {
			--cg-ccw: #dee3e6;
			--cg-ccb: #8ca2ad;
		}
	</style>
