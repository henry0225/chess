// top 7 teemo rules
// #1 never underestimate the power of the scouts code
// #2 hut 2 3 4
// #3 captain teemo on duty
// #4 size doesn't mean everything
// #5 yes sir
// #6 scouting ahead
// #7 on the way
// 10 joker rules to live by
// 1. “The only sensible way to live in this world is without rules.”  ― The Joker
// 2. “Smile, because it confuses people. Smile, because it’s easier than explaining what is killing you inside.” ― The Joker
// 3. “What doesn’t kill you, simply makes you stranger!” ― The Joker
// 4. “April sweet is coming in, let the feast of fools begin!” – The Joker
// 5. “They need you right now, but when they don’t, they’ll cast you out like a leper!” – The Joker
// 6. “As you know, madness is like gravity…all it takes is a little push.” ― The Joker
// 7. “Let’s put a smile on that face!” – The Joker
// 8. “We stopped checking for monsters under our bed, when we realized they were inside us.” – The Joker
// 9. “If you’re good at something, never do it for free.” ― The Joker
// 18. “‎Introduce a little anarchy. Upset the established order, and everything becomes chaos. I’m an agent of chaos…” ― The Joker 


// bugs:
// can't make checkmate move
// crashes before engine will get checkmated (minimax returns null)

/*
Future plans:
Back end:
-Improve quiescence checking to increase discourage higher piece loss and decrease the discouragement for pawns
-Look into potential ways to map board onto array in O(1)
endgame can make pawns worth more etc.
-make engine play checkmate
Front end:
-Make the buttons look prettier and display color as well as current game state

-column for move order
*/
import { useRef, useState, useEffect } from 'react';
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
  var [engineColor, setEngineColor] = useState('black')
  var [stateOfGame, setStateOfGame] = useState('') //in game, checkmate, stalemate
  var [gameState, setGameState] = useState('') //opening, middlegame, endgame
  var nodeNum = 0;
  var [pieces, setPieces] = useState(['a1, b1, c1, d1, e1, f1, g1, h1, a2, b2, c2, d2, e2, f2, g2, h2, a7, b7, c7, d7, e7, f7, g7, h7, a8, b8, c8, d8, e8, f8, g8, h8']);//R, N, B, Q, K, B, N, R, P1, P2, P3, P4, P5, P6, P7, P8, p1, r, n, b, q, k, b, n, r, p2, p3, p4, p5, p6, p7, p8
  const tempGame = new Chess();
  var [prevGameStates, setPrevGameStates] = useState([tempGame.fen()]);  // undo thing

  var [currentEval, setEval] = useState();
  var [searchDepth, setSearchDepth] = useState(3);
  var count = 0;

  const isFirstRender = useRef(true)
  const runEffect = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false // toggle flag after first render/mounting
      return;
    }
    makeMove(engineColor)
  }, [runEffect.current])
  
  function makeMove(colorToMove) {
    console.log("new turn")
    count = 0;
    if (game.turn() === 'w' && colorToMove === 'black') {
      colorToMove = 'white'
    }
    const possibleMoves = game.moves();
    //console.log(possibleMoves)
    if (game.game_over() || possibleMoves.length === 0) {
      if(game.in_checkmate()) {
        if (game.turn() === 'b') {
          setStateOfGame('White wins by checkmate')
        } else {
          setStateOfGame('Black wins by checkmate')
        }
      }

      if (game.in_draw()) {
        if (game.insufficient_material()) {
          setStateOfGame('Game over - draw by insufficient material')
        }
        setStateOfGame('Game over - draw by 50 move rule')
      }

      if (game.in_stalemate()) {
        setStateOfGame('Draw by stalemate')
      }

      if (game.in_threefold_repetition()) {
        setStateOfGame('Draw by reptition')
      }
      return;
    }
    console.log(searchDepth)
    var gameCopy = new Chess(game.fen())
    gameCopy.move(minimax(gameCopy, searchDepth, 0, -10000, 10000));
    setGame(gameCopy)
    setEval(evaluation(gameCopy));
    console.log(nodeNum)
  }
  // eval of current board at targetdepth

  function minimax(game, depth, distanceFromRoot, alpha, beta) {

    if (depth === 0) {
      var value = evaluation(game);
      return value;
    }
    var moves = game.moves();
    //console.log(moves)
    moveOrdering(moves);
    //console.log(moves)
    var bestMove = null;
    var bestEval = null;
    
    for (let i = 0; i < moves.length; i++) {
      var gameCopy = new Chess(game.fen())
      gameCopy.move(moves[i])
      var evaluated = -minimax(gameCopy, depth - 1, distanceFromRoot + 1, -beta, -alpha);

      if (evaluated >= beta) {
        console.log("pruned")
        return beta;
      }else{
        console.log("didn't prune")
      }

      if (evaluated > alpha){
        alpha = evaluated
        bestMove = moves[i]
        //why tf does this not compile nvm it work!
        //BIG DICK BIG DICK
        if (distanceFromRoot === 0) {
          bestEval = evaluated;
        }
      }
    }
    //console.log("Depth: " + depth + " Distance From Root: " + distanceFromRoot)
    if(distanceFromRoot === 0){
      setEval(-bestEval)
      return bestMove;
    }
    return alpha;
  }

  function quiescenceChecking(moves) {//returns a boolean that decides whether the position is quiet or not
    for (let i = 0; i < moves.length; i++){
      var result = moves[i].includes("x")
      if(result === true){
        return true;
      }
    }
    //console.log("quiet")
    return false;
  }

  function moveOrdering(moves) {
      var counter = 0;
      for (let i = 0; i < moves.length; i++){
        var captures = moves[i].includes("x")
        var checks = moves[i].includes("+")
        if (captures === true || checks === true){
          var temp = moves[counter];
          moves[counter] = moves[i];
          moves[i] = temp;
          counter++
        }
      }
  }

  function countPcs(temporaryGame){
    var squares = [
      "a8", "b8", "c8", "d8", "e8", "f8", "g8", "h8",
      "a7", "b7", "c7", "d7", "e7", "f7", "g7", "h7",
      "a6", "b6", "c6", "d6", "e6", "f6", "g6", "h6",
      "a5", "b5", "c5", "d5", "e5", "f5", "g5", "h5",
      "a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4",
      "a3", "b3", "c3", "d3", "e3", "f3", "g3", "h3",
      "a2", "b2", "c2", "d2", "e2", "f2", "g2", "h2",
      "a1", "b1", "c1", "d1", "e1", "f1", "g1", "h1"]

    var counter = 0;
    for(let i = 0; i < 64; i++){
      if(temporaryGame.get(squares[i]) != null){
        counter++;
      }
    }
    console.log(counter)
    return counter;
  }
  

  function squareToInt(square){
    var number = 0;
    if(square.substring(0, 1) === 'b'){
      number += 1;
    } 
    else if(square.substring(0, 1) === 'c'){
      number += 2;
    }
    else if(square.substring(0, 1) === 'd'){
      number += 3;
    }
    else if(square.substring(0, 1) === 'e'){
      number += 4;
    }
    else if(square.substring(0, 1) === 'f'){
      number += 5;
    }
    else if(square.substring(0, 1) === 'g'){
      number += 6;
    }
    else if(square.substring(0, 1) === 'h'){
      number += 7;
    }
    number += 8 * (8 - parseInt(square.substring(1)))
    return number;
  }


  function evaluation(game) {
    //check player color and begin scanning board
    //keep count of each color's "score" by checking with piece-value matrices
    //add up and find an equation to represent the board as a number
    nodeNum++
    var score = 0;

    if (game.in_checkmate()) {
      if (game.turn() === 'w') {
        return -10000;
      } else {
        return 10000
      }
    }

    if (game.in_draw()) {
      return 0;
    }

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
    for (let i = 0; i < 64; i++) {
      if (game.get(squares[i]) != null) {
        if (game.get(squares[i]).type === "p") {
          if (game.get(squares[i]).color === "w") {
            white += pawn(i, 'w')
          } else {
            black += pawn(i, 'b')
          }
        }

        if (game.get(squares[i]).type === "n") {
          if (game.get(squares[i]).color === "w") {
            white += knight(i)
          } else {
            black += knight(i)
          }
        }

        if (game.get(squares[i]).type === "b") {
          if (game.get(squares[i]).color === "w") {
            white += bishop(i)
          } else {
            black += bishop(i)
          }
        }

        if (game.get(squares[i]).type === "r") {
          if (game.get(squares[i]).color === "w") {
            white += rook(i, "w")
          } else {
            black += rook(i, "b")
          }
        }

        if (game.get(squares[i]).type === "q") {
          if (game.get(squares[i]).color === "w") {
            white += queen(i)
          } else {
            black += queen(i)
          }
        }

        if (game.get(squares[i]).type === "k") {
          if (game.get(squares[i]).color === "w") {
            white += king(i, "w")
          } else {
            black += king(i, "b")
          }
        }
      }
    }
    count++
    score = (white - black) / 8;
    if (game.turn() === 'b') {
      if(quiescenceChecking(game.moves()) === true){
      score -= 0.5
      }
      return -score;
    }
    if(quiescenceChecking(game.moves()) === true){
      score += 0.5
    }
    console.log(score)
    return score;
  }

  function knight(square) {
    let matrix =
      [25, 30, 27, 27, 27, 27, 30, 25,
        27, 30, 30, 31, 31, 30, 30, 27,
        28, 32, 32, 33, 33, 32, 32, 28,
        29, 33, 33, 33, 33, 33, 33, 29,
        29, 33, 33, 33, 33, 33, 33, 29,
        28, 32, 32, 33, 33, 32, 32, 28,
        27, 30, 30, 31, 31, 30, 30, 27,
        25, 30, 27, 27, 27, 27, 30, 25]

    return matrix[square];
  }

  function pawn(square, color) {
    let whiteMatrix =
      [90, 90, 90, 90, 90, 90, 90, 90,
        18, 18, 18, 19, 19, 18, 18, 18,
        13, 14, 14, 15, 15, 14, 14, 14,
        12, 13, 13, 14, 14, 13, 13, 13,
        11, 12, 12, 13, 13, 12, 12, 12,
        11, 11, 11, 11, 11, 11, 11, 11,
        10, 10, 10, 10, 10, 10, 10, 10,
        0, 0, 0, 0, 0, 0, 0, 0]

    let blackMatrix =
      [0, 0, 0, 0, 0, 0, 0, 0,
        10, 10, 10, 10, 10, 10, 10, 10,
        11, 11, 11, 11, 11, 11, 11, 11,
        11, 12, 12, 13, 13, 12, 12, 12,
        12, 13, 13, 14, 14, 13, 13, 13,
        13, 14, 14, 15, 15, 14, 14, 14,
        18, 18, 18, 19, 19, 18, 18, 18,
        0, 0, 0, 0, 0, 0, 0, 0]

    if (color === 'w') {
      return whiteMatrix[square];
    } else {
      return blackMatrix[square];
    }
  }

  function bishop(square) {
    let matrix =
      [28, 29, 32, 32, 32, 32, 29, 28,
        30, 33, 33, 33, 33, 33, 33, 30,
        31, 33, 33, 33, 33, 33, 33, 31,
        32, 34, 34, 34, 34, 34, 34, 32,
        32, 34, 34, 34, 34, 34, 34, 32,
        31, 33, 33, 33, 33, 33, 33, 31,
        30, 33, 33, 33, 33, 33, 33, 30,
        28, 29, 32, 32, 32, 32, 29, 28]

    return matrix[square];
  }

  function rook(square, color) {
    let whiteMatrix =
      [53, 53, 54, 54, 54, 54, 53, 53,
        52, 52, 53, 53, 53, 53, 52, 52,
        50, 50, 50, 50, 50, 50, 50, 50,
        50, 50, 50, 50, 50, 50, 50, 50,
        50, 50, 50, 50, 50, 50, 50, 50,
        50, 50, 50, 50, 50, 50, 50, 50,
        50, 50, 50, 52, 52, 50, 50, 50,
        50, 50, 50, 53, 52, 53, 50, 50]

    let blackMatrix =
      [50, 50, 50, 53, 52, 53, 50, 50,
        50, 50, 50, 52, 52, 50, 50, 50,
        50, 50, 50, 50, 50, 50, 50, 50,
        50, 50, 50, 50, 50, 50, 50, 50,
        50, 50, 50, 50, 50, 50, 50, 50,
        50, 50, 50, 50, 50, 50, 50, 50,
        52, 52, 53, 53, 53, 53, 52, 52,
        53, 53, 54, 54, 54, 54, 53, 53]

    if (color === 'w') return whiteMatrix[square]
    return blackMatrix[square];
  }

  function queen(square) {
    let matrix =
      [90, 90, 90, 90, 90, 90, 90, 90,
        90, 91, 91, 91, 91, 91, 91, 90,
        91, 91, 91, 91, 91, 91, 91, 91,
        91, 91, 91, 92, 92, 91, 91, 91,
        91, 91, 91, 92, 92, 91, 91, 91,
        91, 91, 91, 91, 91, 91, 91, 91,
        90, 91, 91, 91, 91, 91, 91, 90,
        90, 90, 90, 90, 90, 90, 90, 90]

    return matrix[square]
  }

  function king(square, color) {
    let blackMatrix =
      [1, 2, 3, -1, -1, -1, 3, 2,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1,
        -1, -1, -1, -1, -1, -1, -1, -1]

    let whiteMatrix =
      [-1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1,
      -1, -1, -1, -1, -1, -1, -1, -1,
        1, 2, 3, -1, -1, -1, 3, 2]

    if (color === 'w') return whiteMatrix[square]
    return blackMatrix[square]
  }

  function onDrop(sourceSquare, targetSquare) {
    var temp = new Chess(game.fen())
    var prevGameStatesCopy = prevGameStates
    prevGameStatesCopy.push(temp.fen())
    setPrevGameStates(prevGameStatesCopy)
    var possibleMoves = temp.moves();

    if(searchDepth === null){
      setSearchDepth(3);
      setGameState('opening')
    }else if(countPcs(game) <= 27){
      setGameState('middlegame')
    }
    if(countPcs(game) <= 14){
      setGameState('endgame')
      setSearchDepth(5);
    }else{
      setSearchDepth(3);
    }
    if (game.game_over() || possibleMoves.length === 0) {
      if (game.in_checkmate()) {
        if (game.turn() === 'b') {
          setStateOfGame('White wins by checkmate')
        } else {
          setStateOfGame('Black wins by checkmate')
        }
      }

      if (game.in_draw()) {
        if (game.insufficient_material()) {
          setStateOfGame('Game over - draw by insufficient material')
        }
        setStateOfGame('Game over - draw by 50 move rule')
      }

      if (game.in_stalemate()) {
        setStateOfGame('Draw by stalemate')
      }

      if (game.in_threefold_repetition()) {
        setStateOfGame('Draw by reptition')
      }
      return;
    }
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

    runEffect.current = !runEffect.current
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
          game.reset()
          console.log("Game Resetted")
          const start = new Chess()
          var states = [start]
          setPrevGameStates(states)
          // clear premove queue
          chessboardRef.current.clearPremoves();
          // stop any current timeouts
          clearTimeout(currentTimeout);
          setGameState('')
          setStateOfGame('')
          if (boardOrientation === 'black' || boardOrientation === null || boardOrientation === undefined) {
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

          game.load(prevGameStates[prevGameStates.length - 1]);
          var copy = prevGameStates.splice(prevGameStates.length - 2, 1)
          setPrevGameStates(copy)
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

          console.log("Game Resetted")
          const start = new Chess()
          var states = [start]
          setPrevGameStates(states)
          // clear premove queue
          chessboardRef.current.clearPremoves();
          // stop any current timeouts
          clearTimeout(currentTimeout);

          setBoardOrientation((currentOrientation) => (currentOrientation === 'black' ? 'white' : 'black'));
          game.reset();
          if (color === 'white') {
            console.log("Attempted Color swap")
            setColor('black')
            setEngineColor('white')
          } else {
            setColor('white')
            setEngineColor('black')
          }
          if (color === 'white') {
            console.log("Move Attempted")
            makeMove(engineColor);
          }

          // if (boardOrientation === 'white' || boardOrientation === null || boardOrientation === undefined){
          //   makeMove();
          // }
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridGap: 30 }}>
        <h1>
          {color}
          {" "}
          {currentEval}
          {" "}
          {"Depth: " + searchDepth}
        </h1>
        <h2>
          {stateOfGame}
        </h2>

        <h3>
          {game.pgn()}
        </h3>
      </div>
    </div>
  );
}