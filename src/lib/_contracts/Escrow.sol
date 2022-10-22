//SPDX-License-Identifier: MIT
// Chess Escrow
pragma solidity ^0.8.7;
    
contract Escrow {
    event GameIndex(uint indexed _gameId, uint indexed index);
    event GameEnd(uint gameId, bool win, bool draw);
    struct Game { 
        uint gameId;
        address playerOne;
        address playerTwo;
        uint deposit;
    }
    Game[] Games;

    function startGame(uint _gameId, address player, uint deposit) public payable {
        Game memory newGame;
        newGame.gameId = _gameId;
        newGame.playerOne = player;
        newGame.deposit = deposit;

        Games.push(newGame);
        emit GameIndex(_gameId, Games.length - 1);
    }

    function joinGame(uint index, address player, uint deposit) public payable {
        require (deposit == Games[index].deposit, "Wager/stake needs to match opponents");
        require (Games[index].playerOne != player, "Cannot join your own game");
        Games[index].playerTwo = player;
    }

    function payWager(uint index, address payable winner) public {
        require(winner == Games[index].playerOne || winner == Games[index].playerTwo, "Invalid winner for game");
        bool sent = winner.send(Games[index].deposit*2);
        require(sent, "Failed to send ether");
        emit GameEnd(Games[index].gameId, true, false);
    }
}