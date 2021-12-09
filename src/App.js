import {useRef, useState} from 'react';
import { Chessboard } from 'react-chessboard';
import './App.css';
import Chess from 'chess.js';
import clone from 'just-clone';

export default function App({ boardWidth }) {
  const [game, setGame] = useState(new Chess());
  const [currentTimeout, setCurrentTimeout] = useState(undefined);
  const chessboardRef = useRef();
  const [arrows, setArrows] = useState([]);
  var [boardOrientation, setBoardOrientation] = useState('white');
  var [color, setColor] = useState('white')
  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function makeMove(){
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) return;

    const gameCopy = new Chess(game.fen());
    gameCopy.load("RN5n/6p1/1pKR2P1/1P2pb2/2pq4/5k2/7r/4r3 w - - 0 1");
    const possibleCopyMoves = gameCopy.moves();
    console.log(gameCopy);
    console.log(game);

    safeGameMutate((game) => {
      game.move(possibleMoves[bestMove(possibleMoves, game.fen())]);
    });
  }

  function bestMove(possibleMoves, fen){
    var nextBoard = [];
    var evaluations = [];
    for(let i = 0; i < possibleMoves.length; i++){
      const gameCopy = new Chess(fen);
      gameCopy.move(possibleMoves[i]);
      evaluations[i] = evaluation(gameCopy);
      nextBoard.push(gameCopy)
    }
    console.log(possibleMoves)
    console.log(evaluations)
    console.log(nextBoard)
    return 1;
  }

  function evaluation(game){
    //check player color and begin scanning board
    //keep count of each color's "score" by checking with piece-value matrices
    //add up and find an equation to represent the board as a number
    var squares = [
      "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8", 
      "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7", 
      "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6", 
      "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5", 
      "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4", 
      "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3", 
      "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2", 
      "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]
    var black = 0 //stores current score
    var white = 0 //stores current score
    for(let i = 0; i < 64; i++){
      if(game.get(squares[i]) != null){
        if(game.get(squares[i]).type === "p"){
          if(game.get(squares[i]).color === "w"){
            white += pawn(squares[i], "w")
            }else{
            black += pawn(squares[i], "b")
          }
        }

        if(game.get(squares[i]).type === "n"){
          if(game.get(squares[i]).color === "w"){
            white += knight(squares[i])
          }else{
            black += knight(squares[i])
          }
        }

        if(game.get(squares[i]).type === "b"){
          if(game.get(squares[i]).color === "w"){
            white += bishop(squares[i])
          }else{
            black += bishop(squares[i])
          }
        }

        if(game.get(squares[i]).type === "r"){
          if(game.get(squares[i]).color === "w"){
            white += rook(squares[i], "w")
          }else{
            black += rook(squares[i], "b")
          }
        }

        if(game.get(squares[i]).type === "q"){
          if(game.get(squares[i]).color === "w"){
            white += queen(squares[i])
          }else{
            black += queen(squares[i])
          }
        }

        if(game.get(squares[i]).type === "k"){
          if(game.get(squares[i]).color === "w"){
            white += king(squares[i], "w")
          }else{
            black += king(squares[i], "b")
          }
        }
      }
    }
    console.log(white, black)
    return white - black;
  }

  function knight(square){
    return 3;
  }

  function pawn(square, color){
    return 1;
  }

  function bishop(square){
    return 3;
  }

  function rook(square, color){
    return 5;
  }

  function queen(square){
    return 9;
  }

  function king(square, color){
    return 10;
  }

  function onDrop(sourceSquare, targetSquare) {
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);

    // illegal move
    if (move === null) return false;

    // store timeout so it can be cleared on undo/reset so computer doesn't execute move
    const newTimeout = setTimeout(makeMove, 500);
    setCurrentTimeout(newTimeout);
    return true;
  }

  function changeColor(){

  }

  return (
    <div>
      <Chessboard
        id="PlayVsRandom"
        animationDuration={200}
        arePremovesAllowed={true}
        boardWidth={boardWidth}
        boardOrientation={boardOrientation}
        customArrows={arrows}
        position={game.fen()}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        ref={chessboardRef}
      />
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.reset();
          });
          // clear premove queue
          chessboardRef.current.clearPremoves();
          // stop any current timeouts
          clearTimeout(currentTimeout);
          if (boardOrientation === 'white' || boardOrientation === null || boardOrientation === undefined){
            makeMove();
          }
        }}
      >
        reset
      </button>
      <button
        className="rc-button"
        onClick={() => {
          // undo twice to undo computer move too
          safeGameMutate((game) => {
            game.undo();
            game.undo();
          });
          // clear premove queue
          chessboardRef.current.clearPremoves();
          // stop any current timeouts
          clearTimeout(currentTimeout);
        }}
      >
        undo
      </button>

      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.reset();
          });
          chessboardRef.current.clearPremoves();
          clearTimeout(currentTimeout);
          setBoardOrientation((currentOrientation) => (currentOrientation === 'black' ? 'white' : 'black'));
          if (boardOrientation === 'white' || boardOrientation === null || boardOrientation === undefined){
            makeMove();
          }
          if(color === 'white'){
            setColor('black')
          }else{
            setColor('white')
          }
        }}
      >
        change color
      </button>

      <button
        className="rc-button"
        onClick={() => {
          setBoardOrientation((currentOrientation) => (currentOrientation === 'black' ? 'white' : 'black'));
        }}
      >
        flip board
      </button>

        {color}
    </div>
  );
}