<script>
// @ts-nocheck

	import { Chessground, cgStylesHelper } from "../lib/index"
	import '$lib/cgstyles/chessground.css';
	import { Chess } from 'chess.js';
	import {  turnColor, validMovesAsDests } from './_utils';
	
	let chess = new Chess();
	let isCheckmate = chess.isCheckmate()
	let isDraw = chess.isDraw()
	let Stalemate = chess.isStalemate()
	/**
	 * @type {{ move: (arg0: string, arg1: string) => void; state: { turnColor: string; movable: { dests: Map<any, any>; }; }; playPremove: () => void; }}
	 */
	let cgApi;
	let config = {
		orientation: 'white',
		movable: {
			color: 'white',
			free: false,
			dests:validMovesAsDests(chess)
		},
	};

	const playOtherSide = (orig,dest)=>{
		console.table({color:turnColor(chess),orig,dest}); // added console.log for current move - remove before prod
		chess.move({from:orig,to:dest});
		cgApi.set({
			turnColor:turnColor(chess),
			movable :{
				color:turnColor(chess),
				dests:validMovesAsDests(chess)
			}
		});
		console.log(chess.ascii());
	}

	/**
	 * @param {{ state: any; move?: (arg0: string, arg1: string) => void; playPremove?: () => void; }} api
	 */
	function init(api) {
		// @ts-ignore
		cgApi = api;
		cgApi.set({
			movable: {events:{after:playOtherSide}}
		});
	}
	function resetBoard(){
		chess.reset(); // reset the chess for chess.js

		// reset chessground - on screen chess board
		cgApi.set({
			fen:chess.fen(),
			lastMove:[],
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
<button on:click={resetBoard}>Reset the game</button>
{#if isCheckmate}
	<div style='font-size: 30px'>
		Checkmate
	</div>
{/if}

{#if isDraw}
	<div style='font-size: 30px'>
		draw
	</div>
{/if}

{#if Stalemate}
	<div style='font-size: 30px'>
		stalemate
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