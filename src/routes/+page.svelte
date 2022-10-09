<script>
// @ts-nocheck

	import { Chessground, cgStylesHelper } from "../lib/index"
	import '$lib/cgstyles/chessground.css';
	import { Chess } from 'chess.js';
	import { randomMove, validMovesAsDests } from './_utils';
	//import { Config, Api } from '../lib/index';
	let chess = new Chess();
	// console.log(chess.fen())
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
			free: true,
			events: {
				after: handleMove
			},
		}
	};

	/**
	 * @param {any} from
	 * @param {any} to
	 * @param {any} metadata
	 */
	function handleMove(from, to, metadata) {

		chess.move(`${from}${to}`, { sloppy: true });
		console.log()
		setTimeout(() => {
			// @ts-ignore
			let move = chess.move(randomMove(chess), { verbose: true });
			// @ts-ignore
			cgApi.move(move.from, move.to);
			cgApi.state.turnColor = 'white';
			cgApi.state.movable.dests = validMovesAsDests(chess);
			cgApi.playPremove();
			console.log('RobotMove')

		}, 3000);
	}

	/**
	 * @param {{ state: any; move?: (arg0: string, arg1: string) => void; playPremove?: () => void; }} api
	 */
	function init(api) {

		api.state.movable.dests = validMovesAsDests(chess);
		// @ts-ignore
		cgApi = api;
		console.log(cgApi);
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
{#if isCheckmate}
	<div style='font-size: 30px'>
		
	</div>
{/if}

{#if isDraw}
	<div style='font-size: 30px'>
		
	</div>
{/if}

{#if Stalemate}
	<div style='font-size: 30px'>
		
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