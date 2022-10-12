<script>
	// @ts-nocheck
		import { writable } from 'svelte/store'
		import { browser } from '$app/environment'
		import { Chessground, cgStylesHelper } from "../lib/index"
		import '$lib/cgstyles/chessground.css';
		import { Chess } from 'chess.js';
		import { turnColor, validMovesAsDests } from '../lib/_utils';
		import { socket } from '../lib/client'


		const currentState = writable('')
		if (browser) {
			currentState.set(localStorage.getItem('currentFEN') ?? '')
		}

		let chess = new Chess($currentState);
		//console.log(chess.ascii())
		let initialBoardPosition = chess.fen()
		let isCheckmate
		let isDraw
		let Stalemate
		let currentTurn
		let winner

		/**
		 * @type {{ move: (arg0: string, arg1: string) => void; state: { turnColor: string; movable: { dests: Map<any, any>; }; }; playPremove: () => void; }}
		 */

		socket.on('emitMove', (fenValue) => {
			currentState.set(fenValue)
		})
		let cgApi;
		$: config = {
			fen: $currentState,
			orientation: 'white',
			movable: {
				color: 'both',
				free: false,
				dests:validMovesAsDests(chess),
			},
		};
	
		const playOtherSide = (orig,dest)=> {
			chess.move({from:orig,to:dest});
			console.log(chess.fen())
			console.log(chess.ascii())
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
			currentTurn = turnColor(chess)
			socket.emit('chessMove', chess.fen())
			winner = currentTurn === 'white' ? 'Player 2' : 'Player 1' 
		}
	
		/**
		 * @param {{ state: any; move?: (arg0: string, arg1: string) => void; playPremove?: () => void; }} api
		 */
		function init(api) {
			console.log(turnColor(chess))
			// @ts-ignore
			cgApi = api;
			cgApi.set({
				fen: `${$currentState}`,
				movable: {events:{after:playOtherSide}}
			});
			socket.on("connect", () => {
			console.log(socket.id)

		})

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
	<style>
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
