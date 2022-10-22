<script>
    // @ts-nocheck
    import { writable } from 'svelte/store'
    import { browser } from '$app/environment'
    import { Chessground, cgStylesHelper } from "$lib/index"
    import '$lib/cgstyles/chessground.css';
    import { Chess } from 'chess.js';
    import { turnColor, validMovesAsDests } from '$lib/_utils';
    import { io } from 'socket.io-client'
    import { callValue } from '$lib/client'
    import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
    
    const currentState = writable('')
    const socket = io("http://localhost:3000")

    
    let currentRoom
    let fen
    $: {
        fen
    }
    onMount(() => {

        
        currentRoom = sessionStorage.getItem('roomID')
        function getFen() {
            if (currentRoom) {
                socket.emit('reconnectRoom', currentRoom)
            }
        }
        getFen()

    })


    let chess = new Chess();
    $: {
        chess = new Chess($currentState);
    }
    


    function gotoAvailable() {
        goto('../')
    }


    socket.on('emitMove', (fenValue) => {
        //console.log('new fen:', fenValue)
        currentState.set(fenValue)
    })


    let hasJoinedMsg
    socket.on('hasJoined', (hasJoinedMessage) => {
        hasJoinedMsg = hasJoinedMessage
    })

    let isCheckmate
    let isDraw
    let Stalemate
    let currentTurn
    let winner
    let counter
    let cgApi

    $: config = {
        fen: $currentState,
        orientation: 'white',
        dests: validMovesAsDests(chess),
        movable: {
            color: 'both',
            free: false,
            dests: validMovesAsDests(chess),
            events: {after:{playOtherSide}}
        },
    };

    const playOtherSide = (orig,dest)=> {
        chess.move({from:orig,to:dest});

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
        currentTurn = turnColor(chess)

        socket.emit('chessMove', currentRoom, chess.fen()) /** Emits that a client has made a move to the other room */
        winner = currentTurn === 'white' ? 'Player 2' : 'Player 1' 
}


    // updated working reset board function
    function resetBoard(){
        chess.reset();
        // console.log(chess.fen())
        currentState.set(chess.fen())
        cgApi.set({
            fen:$currentState,
            lastMove:[], // clear lastMove array to avoid issues related to turn
            dests:validMovesAsDests(chess),
            turnColor:turnColor(chess),
            movable :{
                color:turnColor(chess),
                dests:validMovesAsDests(chess),
                //events:{after:playOtherSide}
            }
        });
}

        /**
     * @param {{ state: any; move?: (arg0: string, arg1: string) => void; playPremove?: () => void; }} api
     */

    function init(api) {
        api.state.movable.dests = validMovesAsDests(chess);
        // @ts-ignore
        socket.on('fen', (fenValue) => {
            fen = fenValue
            console.log(fenValue)
            currentState.set(fen)
        })



        //console.log(fen)
        //currentState.set(fen)
        cgApi = api;
        cgApi.set({
            fen:$currentState,
            lastMove:[], // clear lastMove array to avoid issues related to turn
            dests:validMovesAsDests(chess),
            turnColor:turnColor(chess),
            movable :{
                color:turnColor(chess),
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

{#if !currentRoom}
<div style='font-size: 3rem;'>You haven't join a room yet. Click <button class='btn btn-link' style='font-size: 3rem;'><u style='color: blue;' on:click={gotoAvailable}>here</u></button> to see available games</div>
{:else}
<div style='font-size: 3rem;'>{currentRoom}</div>
{/if}
{#if hasJoinedMsg}
    {hasJoinedMsg}
{/if}
<button on:click={resetBoard} class='btn btn-primary' disabled>Reset Board</button>


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
