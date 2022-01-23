// top 7 teemo rules
// #1 never underestimate the power of the scouts code
// #2 hut 2 3 4
// #3 captain teemo on duty
// #4 size doesn't mean everything
// #5 yes sir
// #6 ill scout ahead
// #7 armed and ready
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
import {moveOrdering, squareToInt, intToSquare, pieceValue} from './utils.js';
import {pawn, knight, bishop, rook, queen, king} from './pieceTables.js';
//import {intToSquare} from './utils.js';
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
  var [gameState, setGameState] = useState('opening') //opening, middlegame, endgame
  var nodeNum = 0;
  var [pieceNum, setPieceNum] = useState(32);
  const tempGame = new Chess();
  var [prevGameStates, setPrevGameStates] = useState([tempGame.pgn()]);  // undo thing

  var [currentEval, setEval] = useState();
  var [searchDepth, setSearchDepth] = useState(4);
  var count = 0;

  const isFirstRender = useRef(true)
  const runEffect = useRef(true)
  useEffect(async () => {
    if (isFirstRender.current) {
      isFirstRender.current = false // toggle flag after first render/mounting
      return;
    }
    makeMove(engineColor)
  }, [runEffect.current])
  function testing2(){
    var testGame = new Chess();
    var testGameCopy = new Chess();
    testGameCopy.load_pgn(testGame.pgn())
    var prevEval = 0;
    var t1 = testGame.move("e4")
    var curEval = trackingEval(testGameCopy, prevEval, t1, "e4")
    console.log(curEval)
    
    prevEval = curEval;
    testGameCopy.load_pgn(testGame.pgn())
    t1 = testGame.move("d5")
    curEval = trackingEval(testGameCopy, prevEval, t1, "d5")
    console.log(curEval)



    prevEval = curEval;
    testGameCopy.load_pgn(testGame.pgn())
    t1 = testGame.move("exd5")
    curEval = trackingEval(testGameCopy, prevEval, t1, "exd5")
    console.log(curEval)
  }

  function makeMove(colorToMove) {
    //testing();
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
    console.time("Move time")
    game.move(minimax(game, searchDepth, 0, -10000, 10000, evaluation(game)));
    console.timeEnd("Move time")
    console.log("Positions Searched: " + nodeNum)
  }
  // eval of current board at targetdepth

  function minimax(game, depth, distanceFromRoot, alpha, beta, gameEval) {//returns gameEval
    if (depth === 0) {
      nodeNum++;
      if(game.turn() === 'b'){
        return (-gameEval / 8);// + quiescenceEval(game); //returns the cumulative eval
      }else{
        return (gameEval / 8);// - quiescenceEval(game);
      }
    }

    // run eval 
    var prevEval = gameEval;

    var moves = game.moves();
    //console.log(moves)
    moveOrdering(moves);
    //console.log(moves)
    var bestMove = null;
    var bestEval = null;
    for (let i = 0; i < moves.length; i++) {
      var gameCopy = new Chess()//dummy board to pass down
      gameCopy.load(game.fen())
      const moveInfo = gameCopy.move(moves[i])

      var curGameCopy = new Chess()//static board to eval, before the move so we know which piece was taken if a capture occurs
      curGameCopy.load(game.fen())
      var curEval = trackingEval(curGameCopy, prevEval, moveInfo, moves[i]); //returns the OBJECTIVE eval for the current move for current move sequence
      var evaluated = -minimax(gameCopy, depth - 1, distanceFromRoot + 1, -beta, -alpha, curEval);//pass down the current eval for that move
      if (evaluated >= beta) {
        //console.log("pruned")
        return beta;
      }else{
        //console.log("didn't prune")
      }

      if (evaluated > alpha){
        alpha = evaluated
        bestMove = moves[i]
        bestEval = evaluated;
        if (distanceFromRoot === 0) {
          bestEval = evaluated;
        }
      }
    }
    
    if(distanceFromRoot === 0){
      setEval(-bestEval)
      //if(bestMove.includes("x") === true){
        //var temp = pieceNum - 1;
        //setPieceNum(temp)
      //}
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

  function quiescenceEval(game) {//returns a boolean that decides whether the position is quiet or not\
    
    var moves = game.moves()
    var max = 0;
    for (let i = 0; i < moves.length; i++){
      var result = moves[i].includes("x")
      if(result === true){
        console.log(game.ascii())
        var square = moves[i].substring(moves[i].indexOf("x") + 1, moves[i].indexOf("x") + 3)
        var gameCopy = new Chess();
        gameCopy.load_pgn(game.pgn())
        var t = gameCopy.move(moves[i])
        if(t.flags === 'e'){
          console.log(game.turn())
          console.log(moves[i])
          console.log(square)
          if(game.turn() === 'w'){
            square = intToSquare(squareToInt(square) + 8)
          }else{
            square = intToSquare(squareToInt(square) - 8)
          }
          console.log(square)
        }
        var piece = game.get(square).type;
        if(piece === 'q'){
          if(9 > max){
            max = 9;
          }
        }
        if(piece === 'b'){
          if(3 > max){
            max = 3;
          }
        }
        if(piece === 'n'){
          if(3 > max){
            max = 3;
          }
          return 3;
        }
        if(piece === 'r'){
          if(5 > max){
            max = 5;
          }
          return 5;
        }
        if(1 > max){
          max = 1;
        }
      }
    }
    //console.log("quiet")
    return max;
  }

  
  

  

  function trackingEval(game, prevEval, moveInfo, move){//"game" is before the move
    //console.time("trackingEval")
    var score = 0;
    var afterMove = new Chess()
    
    //console.time("fen")
    afterMove.load(game.fen())
    //console.timeEnd("fen")
    //console.time("middle code")
    afterMove.move(move);
    if(afterMove.in_checkmate() === true){
       score = 10000
       return score;
    }

    if(afterMove.in_draw() === true){
      score = 0;
      return score;
    }
    
    var fromSq = moveInfo.from;
    var toSq = moveInfo.to;
    var piece = moveInfo.piece;
    var color = game.turn()//the one making this move
    
    if(move === 'O-O' || move === 'O-O-O'){ //should implement a check for pawn structure
      //shortcastles
      score += 2
      if(color === 'b'){
        return prevEval - score; 
      }else{
        return prevEval - score;
      }
    }
    //console.timeEnd("middle code")
    //console.time("piece calc")
    var preValue = pieceValue(piece, fromSq, color)
    var postValue = pieceValue(piece, toSq, color)
    if(color === 'w'){
      score += postValue - preValue
    }else{
      score -= postValue - preValue
    }
    if(move.includes("x") === true){
      if(moveInfo.flags === 'e'){
        if(color === 'w'){
          toSq = intToSquare(squareToInt(toSq) + 8)
        }else{
          toSq = intToSquare(squareToInt(toSq) - 8)
        }
      }
      var opposingColor = 'w'
      if(color === 'w'){
        opposingColor = 'b'
      }
      var captured = pieceValue(game.get(toSq).type, toSq, opposingColor)
      if(color === 'w'){
        score += captured
      }else{
        score -= captured
      }
    }
    //console.timeEnd("piece calc")
    //console.timeEnd("trackingEval")
    return prevEval + score;
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
    score = (white - black);
    if (game.turn() === 'b') {
      score -= 0//quiescenceEval(game)
      return -score;
    }else{
      score += 0//quiescenceEval(game)
    }
    //console.log(game.ascii())
    //console.log(game.pgn())
    //console.log(score)
    return score;
  }

  

  

  function onDrop(sourceSquare, targetSquare) {
    
    var temp = new Chess()
    temp.load_pgn(game.pgn())
    var prevGameStatesCopy = prevGameStates
    prevGameStatesCopy.push(temp.pgn())
    setPrevGameStates(prevGameStatesCopy)
    var possibleMoves = temp.moves();

    if(pieceNum <= 27){
      setGameState('middlegame')
    }
    if(pieceNum <= 14){
      setGameState('endgame')
      setSearchDepth(5);
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

          game.load_pgn(prevGameStates[prevGameStates.length - 1]);
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