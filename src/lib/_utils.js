function validMovesAsDests(chessObj) {
	const dests = new Map();
	const moves = chessObj.moves({ verbose: true });

	for (const validMove of moves) {
		const entry = dests.get(validMove.from);
		if (entry) {
			entry.push(validMove.to);
		} else {
			dests.set(validMove.from, [validMove.to]);
		}
	}

	return dests;
}


function handleMove(from, to, metadata) {
	chess.move(`${from}${to}`, { sloppy: true });

	setTimeout(() => {
		let move = chess.move(randomMove(chess), { verbose: true });
		cgApi.move(move.from, move.to);
		cgApi.state.turnColor = 'white';
		cgApi.state.movable.dests = validMovesAsDests(chess);
		cgApi.playPremove();
	}, 3000);
}


function randomMove(chessObj) {
	const moves = chessObj.moves();
	return moves[Math.floor(Math.random() * moves.length)];
}


function turnColor(chess) {
	return chess.turn() === 'w' ? 'white' : 'black';
}

export { validMovesAsDests, randomMove, handleMove, turnColor };
