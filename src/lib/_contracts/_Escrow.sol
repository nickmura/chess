//SPDX-License-Identifier: MIT
// Chess Escrow
pragma solidity ^0.8.7;
    
contract Escrow {
    uint32 id;
    event GameIndex(uint32 indexed _gameId, uint indexed index);
    event GameEnd(uint gameId, bool draw);
    struct Game { 
        uint32 gameId;
        address playerOne;
        address playerTwo;
        uint deposit;
    }
    mapping (uint => Game) Games;

    function startGame(uint32 _gameId, address player, uint deposit) public payable {
        id++;
        Games[id].gameId = _gameId;
        Games[id].playerOne = player;
        Games[id].deposit = deposit;
        emit GameIndex(_gameId, id);
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
        emit GameEnd(Games[index].gameId, false);
    }
    function payDraw(uint index) public {
        //require(winner == Games[index].playerOne || winner == Games[index].playerTwo, "Invalid winner for game");
        bool sent0 = payable(Games[index].playerOne).send(Games[index].deposit);
        bool sent1 = payable(Games[index].playerTwo).send(Games[index].deposit);
        require(sent0 && sent1, "Failed to send ether");
        emit GameEnd(Games[index].gameId, true);
    }
}