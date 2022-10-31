<script lang="ts">
	import { Chessground, cgStylesHelper } from '$lib/index';
	import '$lib/cgstyles/chessground.css';
	import { Chess } from 'chess.js';
	import { randomMove, validMovesAsDests, handleMove, turnColor } from '$lib/_utils';
	import type { Config, Api } from '$lib/index';
	import type { Key } from 'chessground/types';


	//let fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // Baseline (start)
	let fen = 'rnbqkbnr/pppppppp/8/8/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 1' // Player black's turn
	let chess = new Chess(fen);

	
	let color: 'black' | 'white' = 'black'
	$: color 


    const playOtherSide = (orig,dest)=> {
        chess.move({from:orig,to:dest});
        cgApi.set({
           turnColor:color,
            movable :{
                color:color,
                dests:validMovesAsDests(chess)    
            }
        });
    }

	let cgApi: Api;
	let config: Config = {
		fen: fen,
		orientation: 'black',
		movable: {
            //color: color,
            free: false,
            dests: validMovesAsDests(chess),
            events: {after:{playOtherSide}}
		}
	};
	
	function init(api: Api) {
		console.log(validMovesAsDests(chess))
		api.state.movable.dests = validMovesAsDests(chess);
		cgApi = api;
		console.log(cgApi);
		console.log(color)
		cgApi.set({
            fen:fen,
            lastMove:[], // clear lastMove array to avoid issues related to turn
            turnColor:color,
            movable:{
                color:color,
                dests:validMovesAsDests(chess),
                events:{after:playOtherSide}
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
