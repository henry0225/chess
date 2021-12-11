// ENGINE NAME:
// OPERATION THANOS


/*
Future plans:
Back end:
-Begin working on tree and Nth-depth searching
-Look into potential ways to map board onto array in O(1)
-Can implement multiple PST's for different stages of the game, maybe at a certain number of moves we can
loosen discouragements from edges and whatnot, endgame can make pawns worth more etc.
Front end:
-Make the buttons look prettier and display color as well as current game state
-Look into implementing pop-ups for checkmate/stalemate
*/
import {useRef, useState} from 'react';
import { Chessboard } from 'react-chessboard';
import './App.css';
import Chess from 'chess.js';

export default function App({ boardWidth }) {
  const chessboardRef = useRef(); // magic ref thing
  const [game, setGame] = useState(new Chess());
  const [currentTimeout, setCurrentTimeout] = useState(undefined);  // delay?

  // hooks
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [arrows, setArrows] = useState([]);
  var [boardOrientation, setBoardOrientation] = useState('white');

  // game logic
  var [color, setColor] = useState('white')
  var [stateOfGame, setStateOfGame] = useState('In Game')

  const tempGame = new Chess();
  var [prevGameStates, setPrevGameStates] = useState([tempGame.fen()]);  // undo thing

  // magic setGame
  function safeGameMutate(modify) {
    setGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  }

  function makeMove(){
    const possibleMoves = game.moves();
    if (game.game_over() || game.in_draw() || possibleMoves.length === 0) {
      if(game.game_over()){
        setStateOfGame('Game Over')
      }else{
        setStateOfGame('Draw')
      }
      return;
    }
    const gameCopy = new Chess(game.fen());
    gameCopy.load("RN5n/6p1/1pKR2P1/1P2pb2/2pq4/5k2/7r/4r3 w - - 0 1");
    const possibleCopyMoves = gameCopy.moves();
    safeGameMutate((game) => {
      console.log("MOVED")
      game.move(possibleMoves[bestMove(possibleMoves, game.fen())]);
    });
    console.log(game.turn())
  }

  function bestMove(possibleMoves, fen){
    var nextBoard = [];
    var evaluations = [];
    for (let i = 0; i < possibleMoves.length; i++){
      const gameCopy = new Chess(fen);
      gameCopy.move(possibleMoves[i]);
      evaluations[i] = evaluation(gameCopy);
      nextBoard[i] = (gameCopy)
    }
    console.log(possibleMoves)
    console.log(evaluations)
    console.log(nextBoard)
    var max = 1000;
    if (color === 'black'){
      max *= -1
      // todo: evil bit hacking thing that does the same thing except looks 10x cooler
    }
    
    var maxIndex = 0;
    for(let k = 0; k < evaluations.length; k++){
      if(evaluations[k] <= max){
        max = evaluations[k]
        maxIndex = k
      }
    }
    console.log("Going to play move " + possibleMoves[maxIndex] + " that gives value " + max)
    return maxIndex;
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
            white += pawn(i, "w")
            }else{
            black += pawn(i, "b")
          }
        }

        if(game.get(squares[i]).type === "n"){
          if(game.get(squares[i]).color === "w"){
            white += knight(i)
          }else{
            black += knight(i)
          }
        }

        if(game.get(squares[i]).type === "b"){
          if(game.get(squares[i]).color === "w"){
            white += bishop(i)
          }else{
            black += bishop(i)
          }
        }

        if(game.get(squares[i]).type === "r"){
          if(game.get(squares[i]).color === "w"){
            white += rook(i, "w")
          }else{
            black += rook(i, "b")
          }
        }

        if(game.get(squares[i]).type === "q"){
          if(game.get(squares[i]).color === "w"){
            white += queen(i)
          }else{
            black += queen(i)
          }
        }

        if(game.get(squares[i]).type === "k"){
          if(game.get(squares[i]).color === "w"){
            white += king(i, "w")
          }else{
            black += king(i, "b")
          }
        }
      }
    }
    return white - black;
  }

  function knight(square){
    let matrix = 
    [23, 25, 26, 26, 26, 26, 25, 23,
    25, 32, 33, 34, 34, 33, 32, 25,
    27, 37, 38, 38, 38, 38, 37, 27,
    29, 33, 35, 37, 37, 35, 33, 29,
    30, 33, 37, 37, 37, 37, 33, 30,
    35, 37, 38, 38, 38, 38, 37, 35,
    25, 32, 33, 34, 34, 33, 32, 25,
    23, 25, 26, 26, 26, 26, 25, 23]

    return matrix[square];
  }

  function pawn(square, color){
    let whiteMatrix = 
    [0, 0, 0, 0, 0, 0, 0, 0,
    24, 26, 27, 29, 29, 27, 26, 24,
    15, 17, 18, 20, 20, 18, 17, 15,
    13, 14, 15, 17, 17, 15, 14, 13,
    12, 13, 14, 16, 16, 14, 13, 12,
    10, 12, 13, 14, 14, 13, 12, 10,
    10, 10, 10, 10, 10, 10, 10, 10,
    0, 0, 0, 0, 0, 0, 0, 0]
    
    let blackMatrix = 
    [0, 0, 0, 0, 0, 0, 0, 0,
    10, 10, 10, 10, 10, 10, 10, 10,
    10, 12, 13, 14, 14, 13, 12, 10,
    12, 13, 14, 16, 16, 14, 13, 12,
    13, 14, 15, 17, 17, 15, 14, 13,
    15, 17, 18, 20, 20, 18, 17, 15,
    24, 26, 27, 29, 29, 27, 26, 24,
    0, 0, 0, 0, 0, 0, 0, 0]

    if(color === 'w'){
      return whiteMatrix[square];
    }else{
      return blackMatrix[square];
    }
  }
  
  function bishop(square){
    let matrix = 
    [25, 25, 25, 25, 25, 25, 25, 25,
    25, 30, 30, 30, 30, 30, 30, 25,
    25, 30, 35, 30, 30, 35, 30, 25,
    27, 35, 40, 35, 35, 40, 35, 27,
    27, 35, 40, 35, 35, 40, 35, 27,
    25, 30, 35, 30, 30, 35, 30, 25,
    25, 30, 30, 30, 30, 30, 30, 25,
    25, 25, 25, 25, 25, 25, 25, 25]

    return matrix[square];
  }

  function rook(square, color){
    let whiteMatrix = 
    [50, 53, 53, 60, 55, 60, 53, 50,
    53, 55, 55, 57, 57, 55, 55, 53,
    48, 48, 48, 50, 50, 48, 48, 48,
    47, 47, 48, 48, 48, 48, 47, 47,
    47, 47, 48, 48, 48, 48, 47, 47,
    50, 50, 48, 48, 48, 48, 50, 50,
    53, 55, 55, 57, 57, 55, 55, 53,
    55, 57, 57, 60, 60, 57, 57, 55,]

    let blackMatrix = 
    [50, 53, 53, 60, 55, 60, 53, 50,
    53, 55, 55, 57, 57, 55, 55, 53,
    48, 48, 48, 50, 50, 48, 48, 48,
    47, 47, 48, 48, 48, 48, 47, 47,
    47, 47, 48, 48, 48, 48, 47, 47,
    50, 50, 48, 48, 48, 48, 50, 50,
    53, 55, 55, 57, 57, 55, 55, 53,
    55, 57, 57, 60, 60, 57, 57, 55,]

    if (color === 'w') return whiteMatrix[square]
    return blackMatrix[square];
  }

  function queen(square){
    let matrix = 
    [90, 92, 95, 97, 97, 95, 92, 90,
    92, 95, 97, 99, 99, 97, 95, 92,
    95, 97, 99, 99, 99, 99, 97, 95,
    95, 97, 99, 99, 99, 99, 97, 95,
    95, 97, 99, 99, 99, 99, 97, 95,
    95, 97, 99, 99, 99, 99, 97, 95,
    92, 95, 97, 99, 99, 97, 95, 92,
    90, 92, 95, 97, 97, 95, 92, 90]

    return matrix[square]
  }

  function king(square, color){
    let blackMatrix = 
    [16, 20, -10, 10, -10, 20, 18, 16,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5]

    let whiteMatrix = 
    [-5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    -5, -5, -5, -5, -5, -5, -5, -5,
    16, 18, 20, -10, 10, -10, 20, 16]

    if (color === 'w') return whiteMatrix[square]
    return blackMatrix[square]
  }

  function onDrop(sourceSquare, targetSquare) {
    var temp = new Chess(game.fen())
    var prevGameStatesCopy = prevGameStates
    prevGameStatesCopy.push(temp.fen())
    setPrevGameStates(prevGameStatesCopy)
    const gameCopy = { ...game };
    const move = gameCopy.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // always promote to a queen for example simplicity
    });
    setGame(gameCopy);
    // safeGameMutate((game) => {
    //   game.move({
    //     from: sourceSquare,
    //     to: targetSquare,
    //     promotion: 'q' // always promote to a queen for example simplicity
    //   })
    // })
    
    // illegal move
    if (move === null) return false;
    setMoveSquares({
      [sourceSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' },
      [targetSquare]: { backgroundColor: 'rgba(255, 255, 0, 0.4)' }
    });
    // store timeout so it can be cleared on undo/reset so computer doesn't execute move
    const newTimeout = setTimeout(makeMove(), 300);
    setCurrentTimeout(newTimeout);
    return true;
  }

  function onMouseOverSquare(square) {
    getMoveOptions(square);
  }

  // Only set squares to {} if not already set to {}
  function onMouseOutSquare() {
    if (Object.keys(optionSquares).length !== 0) setOptionSquares({});
  }

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    });
    if (moves.length === 0) {
      return;
    }

    const newSquares = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) && game.get(move.to).color !== game.get(square).color
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%'
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)'
    };
    setOptionSquares(newSquares);
  }

  function onSquareClick(square) {
    setRightClickedSquares({});
  }

  function onSquareRightClick(square) {
    const colour = 'rgba(0, 0, 255, 0.4)';
    setRightClickedSquares({
      ...rightClickedSquares,
      [square]:
        rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
          ? undefined
          : { backgroundColor: colour }
    });
  }
  return (
    <div>
      <Chessboard
        id="PlayVsEngine"
        animationDuration={200}
        arePremovesAllowed={true}
        boardWidth={boardWidth}
        boardOrientation={boardOrientation}
        customArrows={arrows}
        position={game.fen()}
        onMouseOverSquare={onMouseOverSquare}
        onMouseOutSquare={onMouseOutSquare}
        onSquareClick={onSquareClick}
        onSquareRightClick={onSquareRightClick}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
        }}
        customSquareStyles={{
          ...moveSquares,
          ...optionSquares,
          ...rightClickedSquares
        }}
        ref={chessboardRef}
      />
      <button
        className="rc-button"
        onClick={() => {
          safeGameMutate((game) => {
            game.reset();
            console.log("Resetted game")
          });
          // clear premove queue
          chessboardRef.current.clearPremoves();
          // stop any current timeouts
          clearTimeout(currentTimeout);
          if (boardOrientation === 'black' || boardOrientation === null || boardOrientation === undefined){
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
          console.log(prevGameStates)
          game.load(prevGameStates[prevGameStates.length - 2]);
          console.log("Attempted undo")
          // clear premove queue

          // bugged thing
          // safeGameMutate((game) => {
          //   game.undo()
          // })
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
        <h1>
        {color}

        </h1>
        <h2>
        {stateOfGame}
        </h2>

        <h3>
        {game.pgn()}
        </h3>
    </div>
  );
}