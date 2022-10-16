<script>
	// @ts-nocheck
		import { writable } from 'svelte/store'
		import { browser } from '$app/environment'
		import { Chessground, cgStylesHelper } from "../lib/index"
		import '$lib/cgstyles/chessground.css';
		import { Chess } from 'chess.js';
		import { turnColor, validMovesAsDests } from '../lib/_utils';
		import { io } from 'socket.io-client'
		import { callValue } from '$lib/client'
		import { onMount } from 'svelte';
		// import { availableRooms } from './fetch_redis'
		// let rooms = []
		let rooms = []


		async function getRooms() {
			const res = await fetch('http://localhost:5001/rooms')
			rooms = JSON.parse(await res.json())


		}
		setInterval(getRooms, 1000)

		
		const socket = io("http://localhost:3000")

		if (browser) {

		}






		
		

		// socket.on('listRooms', (roomsArray) => {
		// 	let _rooms

		// 	_rooms.push(...roomsArray)
		// 	rooms = _rooms;

		// 	console.log(rooms)
		// })
		// socket.on('emitRoom', (uuid) => {
		// 	console.log('User has joined', uuid)
		// 	//console.log(socket.id)
		// })

		/*socket.on('emitMove', (fenValue) => {
			currentState.set(fenValue)
		})**/



		const currentState = writable('')

		if (browser) {
			currentState.set(localStorage.getItem('currentFEN') ?? '')
		}

		let chess = new Chess();
		$: {
			chess = new Chess($currentState);
		}
		//console.log(chess.ascii())
		let initialBoardPosition = chess.fen()
		let isCheckmate
		let isDraw
		let Stalemate
		let currentTurn
		let winner
		let counter = 0

		/** 
		 * @type {{ move: (arg0: string, arg1: string) => void; state: { turnColor: string; movable: { dests: Map<any, any>; }; }; playPremove: () => void; }}
		 */
		function createChessRoom() {
			counter++;
			let uuid = Math.floor(Math.random()*10000)
			let room = {gameID: uuid, game: 'chess', players: [], stake: '0'}
			room.players.push(`player${counter}`)
			socket.emit('createRoom', uuid, room)
		}

		function joinGame(gameId) {
			counter++;
			
			let player2 = `player${counter}`
			rooms.find(room => room.gameID === gameId).players.push(player2)
			// need to do socket.emit and send back info to server
			console.log(rooms)

		}


		//console.log(turnColor(chess))
		let cgApi
		$: config = {
			fen: $currentState,
			orientation: 'white',
			movable: {
				color: 'both',
				free: false,
				dests: validMovesAsDests(chess),
			},
		};




		const playOtherSide = (orig,dest)=> {
			chess.move({from:orig,to:dest});
			console.log('turn color 1', turnColor(chess))
			//console.log(chess.fen())
			//console.log(chess.ascii())
			console.log('turn color2', turnColor(chess))
			cgApi.set({
				turnColor:turnColor(chess),
				movable :{
					color:turnColor(chess),
					dests:validMovesAsDests(chess)
					
				}
			});

			isCheckmate = chess.isCheckmate()
        	isDraw = chess.isDraw()
        	Stalemate = chess.isStalemate()

			if (!isCheckmate) {
				localStorage.setItem('currentFEN', chess.fen())
			} else if (isCheckmate) {
				localStorage.setItem('currentFEN', '')
			}

			//currentState.set(localStorage.getItem('currentFEN'))
			console.log('turn color 1', turnColor(chess))
			currentTurn = turnColor(chess)
			// socket.emit('chessMove', chess.fen())
			winner = currentTurn === 'white' ? 'Player 2' : 'Player 1' 
	}
	

		
		// updated working reset board function
		function resetBoard(){
		chess.reset(); // reset the chess for chess.js
		// reset local storage 
		localStorage.setItem('currentFEN',chess.fen());
		// reset chessground - on screen chess board
		cgApi.set({
			fen:chess.fen(),
			lastMove:[], // clear lastMove array to avoid issues related to turn
			dests:validMovesAsDests(chess),
			turnColor:turnColor(chess),
			movable :{
				color:turnColor(chess),
				dests:validMovesAsDests(chess)
			}
		});
	}

			/**
		 * @param {{ state: any; move?: (arg0: string, arg1: string) => void; playPremove?: () => void; }} api
		 */
	function init(api) {
		api.state.movable.dests = validMovesAsDests(chess);
		// @ts-ignore
		cgApi = api;
		cgApi.set({
			fen: `${$currentState}`,
			movable: {events:{after:playOtherSide}}
		});
	}
	</script>
	
	<div
		use:Chessground={{ config, initializer: init }}
		class="blue"
		use:cgStylesHelper={{
			piecesFolderUrl: '/images/pieces/merida',
			boardUrl: '/images/board/blue.svg'
		}}
		style="height: 640px; width: 640px;"
	/>
	<button on:click={resetBoard} class='btn btn-primary'>Reset Board</button>
	<button on:click={createChessRoom} class='btn btn-primary'>join/create Room</button>
	{#if isCheckmate}
		<div style='font-size: 30px'>
			{winner} wins by Checkmate!
		</div>
	{/if}
	
	{#if isDraw}
		<div style='font-size: 30px'>
			Draw!
		</div>
	{/if}
	
	{#if Stalemate}
		<div style='font-size: 30px'>
			Stalemate!
		</div>
	{/if}

	{#each rooms as room}
		{#if room.players < 2}
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
			<button on:click={(e)=>joinGame(room.gameID)} class='btn btn-primary'> 
				Join Game
			</button>
		</div>
		{/if}
		<hr>
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
