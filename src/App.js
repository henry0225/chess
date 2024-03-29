// bugs:
// can't make checkmate move
// crashes before engine will get checkmated (minimax returns null)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// can't use game object during minimax (ui bugs during engine turn)


import { useRef, useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { squareToInt, intToSquare, pieceValue } from './utils.js';
import { pawn, knight, bishop, rook, queen, king } from './pieceTables.js';
//import {intToSquare} from './utils.js';
import './App.css';
import file from './samples.txt';
import Chess from 'chess.js';
import Button from '@mui/material/Button';
import axios from 'axios'
const LichessOpeningExporer = require('lichess-opening-explorer');

export default function App({ boardWidth }) {
  const chessboardRef = useRef(); // magic ref thing 
  const [game, setGame] = useState(new Chess());
  const [currentTimeout, setCurrentTimeout] = useState(undefined);  //
  // hooks
  const [rightClickedSquares, setRightClickedSquares] = useState({});
  const [moveSquares, setMoveSquares] = useState({});
  const [optionSquares, setOptionSquares] = useState({});
  const [arrows, setArrows] = useState([]);
  var [boardOrientation, setBoardOrientation] = useState('white');

  // game logic
  var [playerColor, setPlayerColor] = useState('w')
  var [engineColor, setEngineColor] = useState('black')
  var [stateOfGame, setStateOfGame] = useState('') //in game, checkmate, stalemate
  var [gameState, setGameState] = useState('opening') //opening, middlegame, endgame
  var nodeNum = 0;
  var [pieceNum, setPieceNum] = useState(32);
  const tempGame = new Chess();
  var [prevGameStates, setPrevGameStates] = useState([tempGame.pgn()]);  // undo thing

  const [text, setText] = useState()

  var [currentEval, setEval] = useState(0);
  var [prevEval, setPrevEval] = useState(currentEval)
  var [searchDepth, setSearchDepth] = useState(3);
  var [testFlags, setTestFlags] = useState();
  var [undosRemaining, setUndosRemaining] = useState(3)
  var count = 0;
  const isFirstRender = useRef(true)
  const runEffect = useRef(true)

  const [fenInput, setFenInput] = useState('')
  const [newPositionFromFen, setNewPositionFromFen] = useState(false)

  const loadFromFEN = (event) => {
    event.preventDefault()
    let tmp = new Chess(fenInput)
    setGame(tmp)

    let moveOrder = fenInput.split(' ')

    if (playerColor == 'w') {
      if (moveOrder[1] == 'b') {
        runEffect.current = !runEffect.current
      }
    }
    else {
      if (moveOrder[1] == 'w') {
        runEffect.current = !runEffect.current
      }
    }

    setNewPositionFromFen(true)

    setEval(evaluation(tmp))
  }

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false // toggle flag after first render/mounting
      return;
    }
    // if (game.move() <= 8){
    //   nothing();
    // }
    // else {
    makeMove(engineColor)
    // }
  }, [runEffect.current])

  // useEffect(() => {
  //   // const fr = new FileReader()
  //   // fr.onload = function(e){
  //   //   console.log(e.target.result)
  //   // }
  //   // fr.readAsText(file)
  //   fetch(file)
  //   .then((data) => data.text())
  //   .then((t) => {
  //     setText(JSON.parse(t))
  //     console.log(JSON.parse(t))
  //     })
  //   .catch(e => console.error(e))

  //   // const stuff = { testing : 'testing' };
  //   // fetch(file, {
  //   //   method:'POST',
  //   //   headers: {
  //   //     'Content-Type': 'application/json',
  //   //   },
  //   //   body: JSON.stringify(stuff),
  //   // })
  //   // .then(response => response.json())
  //   // .then(stuff => {
  //   //   console.log('Success:', stuff)
  //   // })
  // }, [])



  function makeRandom() {
    var moves = game.moves()
    game.move(moves[0])
  }


  async function makeMove(colorToMove) {
    // axios.post('https://7mk1yetmll.execute-api.us-east-1.amazonaws.com/prod/calculate-move', {
    //   colorToMove: colorToMove,
    //   currentEval: currentEval,
    //   fen: game.fen(),
    //   searchDepth: searchDepth
    // }, {
    //   headers: {
    //     'Content-Type': 'application/json'
    //   }
    // })
    axios.post('https://sped-cs-chess-project.herokuapp.com/api/calc_move', {
      colorToMove: colorToMove,
      currentEval: currentEval,
      fen: game.fen(),
      searchDepth: searchDepth
    })
      .then((res) => {
        console.log(res.data.move)
        let tmp = new Chess(game.fen())
        if (res.data.to != null) {
          tmp.move({ from: res.data.from, to: res.data.to })
        }
        else {
          tmp.move(res.data.move)
        }
        const newEval = evaluation(tmp)
        // im white and i want number to not go down!
        
        if (!newPositionFromFen) {
          var flag = true
          if (engineColor == 'black') {
            if (newEval - currentEval <= -5 && undosRemaining > 0) {
              if (window.confirm('Engine has detected a blunder. Would you like to undo your move? You have ' + undosRemaining + " undos left.")) {
                game.load_pgn(prevGameStates[prevGameStates.length - 1]);
                var copy = prevGameStates.splice(prevGameStates.length - 2, 1)
                setPrevGameStates(copy)
                console.log("Attempted undo")
                // clear premove queue
                setUndosRemaining(undosRemaining - 1)
                // bugged thing
                // safeGameMutate((game) => {
                //   game.undo()
                // })
                chessboardRef.current.clearPremoves();
                // stop any current timeouts
                clearTimeout(currentTimeout);
                flag = false
              }
            }
          }
          // im black and i want number to not go up!
          else {
            if (newEval - currentEval >= 5 && undosRemaining > 0) {
              if (window.confirm('Engine has detected a blunder. Would you like to undo your move? You have ' + undosRemaining + " undos left.")) {
                game.load_pgn(prevGameStates[prevGameStates.length - 1]);
                var copy = prevGameStates.splice(prevGameStates.length - 2, 1)
                setPrevGameStates(copy)
                console.log("Attempted undo")
                // clear premove queue
                setUndosRemaining(undosRemaining - 1)

                // bugged thing
                // safeGameMutate((game) => {
                //   game.undo()
                // })
                chessboardRef.current.clearPremoves();
                // stop any current timeouts
                clearTimeout(currentTimeout);
                flag = false
              }
            }
          }
          // setPrevEval(currentEval)
          if (flag) {
            setGame(tmp)
            setEval(newEval)
          }
        }
        else {
          setGame(tmp)
          setEval(newEval)
          setNewPositionFromFen(false)
        }
      })
      .catch(e => {
        console.error(e)
      })

    // let explorer = new LichessOpeningExporer();

    // explorer.analyze(game.fen(), {
    //   master: false,
    //   variant: 'standard',
    //   speeds: ['bullet', 'blitz', 'rapid', 'classical'],
    //   ratings: ["unlimited"]
    // })
    // .then(analysis => {
    //   // do something genious
    //   console.log(analysis)
    //   var randomNum = Math.floor(Math.random() * 3)
    //   if (analysis.moves.length >= 3) {game.move(analysis.moves[randomNum].san); console.log(analysis.moves[randomNum].san); return}
    //   console.log("kekw")
    //   count = 0;
    //   if (game.turn() === 'w' && colorToMove === 'black') {
    //     colorToMove = 'white'
    //   }
    //   const possibleMoves = game.moves();

    //   //console.log(possibleMoves)
    //   if (game.game_over() || possibleMoves.length === 0) {
    //     if(game.in_checkmate()) {
    //       if (game.turn() === 'b') {
    //         setStateOfGame('White wins by checkmate')
    //       } else {
    //         setStateOfGame('Black wins by checkmate')
    //       }
    //     }

    //     if (game.in_draw()) {
    //       if (game.insufficient_material()) {
    //         setStateOfGame('Game over - draw by insufficient material')
    //       }
    //       setStateOfGame('Game over - draw by 50 move rule')
    //     }

    //     if (game.in_stalemate()) {
    //       setStateOfGame('Draw by stalemate')
    //     }

    //     if (game.in_threefold_repetition()) {
    //       setStateOfGame('Draw by reptition')
    //     }
    //     return;
    //   }
    //   console.time("Move time")
    //   const moved = game.move(minimax(game, searchDepth, 0, -1000000, 1000000, currentEval));//fix
    //   console.log(moved)
    //   // console.log(moved.san)
    //   // if(moved.san.includes("x") === true){
    //   //   var temp = pieceNum - 1;
    //   //   setPieceNum(temp);
    //   // }
    //   console.timeEnd("Move time")
    //   console.log("Positions Searched: " + nodeNum)
    // })
    // .catch(err => {
    //   console.error(err);
    // });
  }
  // eval of current board at targetdepth

  function minimax(game, depth, distanceFromRoot, alpha, beta, gameEval) {//returns gameEval
    if (depth === 0) {
      nodeNum++;
      if (game.turn() === 'b') {
        return (-gameEval);
        //return (-gameEval) - (2 * (quiescenceEval(game))); //returns the cumulative eval
      } else {
        return (gameEval);
        //return (gameEval) + (2 * (quiescenceEval(game)));
      }
    }

    // run eval 
    var prevEval = gameEval;

    var moves = game.moves();
    //console.log(moves)
    moveOrdering(moves, game);
    //console.log(moves)
    var bestMove = null;
    var bestEval = null;
    for (let i = 0; i < moves.length; i++) {
      var gameCopy = new Chess()//dummy board to pass down
      gameCopy.load(game.fen())
      const moveInfo = gameCopy.move(moves[i])

      var curGameCopy = new Chess()//static board to eval, before the move so we know which piece was taken if a capture occurs
      curGameCopy.load_pgn(game.pgn())
      var curEval = trackingEval(curGameCopy, game.turn(), prevEval, moveInfo, moves[i]); //returns the OBJECTIVE eval for the current move for current move sequence
      if (gameCopy.in_checkmate() === true) {
        if (curGameCopy.turn() === 'w') {//white's turn on the current board so white made the checkmate

          return 10000
        } else {
          return -10000
        }
      }
      var evaluated = -minimax(gameCopy, depth - 1, distanceFromRoot + 1, -beta, -alpha, curEval);//pass down the current eval for that move
      if (evaluated >= beta) {
        //console.log("pruned")
        return beta;
      } else {
        //console.log("didn't prune")
      }

      if (evaluated > alpha) {
        alpha = evaluated
        bestMove = moves[i]
        //bestEval = evaluated;
        if (distanceFromRoot === 0) {
          bestEval = evaluated;
        }
      }
    }

    if (distanceFromRoot === 0) {
      if (engineColor === 'b') {
        setEval(bestEval)
      } else {
        setEval(-bestEval)
      }
      // if(bestMove.includes("x") === true){
      //   var temp = pieceNum - 1;
      //   setPieceNum(temp)
      // }
      return bestMove;
    }
    return alpha;
  }

  function moveOrdering(moves, game) {
    var counter = 0;
    for (let i = 0; i < moves.length; i++) {
      var captures = moves[i].includes("x")
      var checks = moves[i].includes("+")
      if (captures === true || checks === true) {
        var temp = moves[counter];
        moves[counter] = moves[i];
        moves[i] = temp;
        counter++
      }
    }
    var counter2 = 0;
    for (let i = 0; i < counter; i++) {
      var game = new Chess(game.fen())
      if (game.get(moves[i].substring(moves[i].includes("x") + 1, moves[i].includes("x") + 3)) !== null) {
        if (game.get(moves[i].substring(moves[i].includes("x") + 1, moves[i].includes("x") + 3).type !== 'p')) {
          var temp = moves[counter2];
          moves[counter2] = moves[i];
          moves[i] = temp;
          counter2++
        }
      }
    }
  }

  function quiescenceChecking(moves) {//returns a boolean that decides whether the position is quiet or not
    for (let i = 0; i < moves.length; i++) {
      var result = moves[i].includes("x")
      if (result === true) {
        return true;
      }
    }
    //console.log("quiet")
    return false;
  }

  function quiescenceEval(game) {//returns a boolean that decides whether the position is quiet or not\

    var moves = game.moves()
    var max = 0;
    for (let i = 0; i < moves.length; i++) {
      var result = moves[i].includes("x")
      if (result === true) {
        var square = moves[i].substring(moves[i].indexOf("x") + 1, moves[i].indexOf("x") + 3)
        var gameCopy = new Chess();
        gameCopy.load_pgn(game.pgn())
        var t = gameCopy.move(moves[i])
        // if(t === null){
        //   setTestFlags("null !")
        // }else{
        //   setTestFlags(t)
        // }
        if (t !== null) {
          if (t.flags === 'e') {
            // console.log(game.turn())
            // console.log(moves[i])
            // console.log(square)
            if (game.turn() === 'w') {
              square = intToSquare(squareToInt(square) + 8)
            } else {
              square = intToSquare(squareToInt(square) - 8)
            }
            //console.log(square)
          }
        }
        var piece = game.get(square).type;
        if (piece === 'q') {
          if (9 > max) {
            max = 9;
          }
        }
        if (piece === 'b') {
          if (3 > max) {
            max = 3;
          }
        }
        if (piece === 'n') {
          if (3 > max) {
            max = 3;
          }
          return 3;
        }
        if (piece === 'r') {
          if (5 > max) {
            max = 5;
          }
          return 5;
        }
        if (1 > max) {
          max = 1;
        }
      }
    }
    //console.log("quiet")
    return max;
  }






  function trackingEval(game, turnColor, prevEval, moveInfo, move) {//"game" is before the move
    //console.time("trackingEval")
    var score = 0;
    var afterMove = new Chess()

    //console.time("fen")
    afterMove.load(game.fen())
    //console.timeEnd("fen")
    //console.time("middle code")
    afterMove.move(move);
    if (afterMove.in_checkmate() === true) {
      score = 10000
      return score;
    }

    if (afterMove.in_draw() === true) {
      score = 0;
      return score;
    }

    var fromSq = moveInfo.from;
    var toSq = moveInfo.to;
    var piece = moveInfo.piece;
    var color = turnColor//the one making this move

    if (move === 'O-O' || move === 'O-O-O') { //should implement a check for pawn structure
      //shortcastles
      if (color === 'b') {
        score += 10
      } else {
        score -= 10
      }
      if (color === 'b') {
        return prevEval + score;
      } else {
        return prevEval - score;
      }
    }
    //console.timeEnd("middle code")
    //console.time("piece calc")
    var preValue = pieceValue(piece, fromSq, color)
    var postValue = pieceValue(piece, toSq, color)
    if (color === 'w') {
      score += postValue - preValue
    } else {
      score -= postValue - preValue
    }
    if (move.includes("x") === true) {
      if (moveInfo.flags === 'e') {
        if (color === 'w') {
          toSq = intToSquare(squareToInt(toSq) + 8)
        } else {
          toSq = intToSquare(squareToInt(toSq) - 8)
        }
      }
      var opposingColor = 'w'
      if (color === 'w') {
        opposingColor = 'b'
      }
      var captured = pieceValue(game.get(toSq).type, toSq, opposingColor)
      if (color === 'w') {
        score += captured
      } else {
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
    score = 3 * (white - black) / 7;
    if (game.turn() === 'b') {
      score -= 0//quiescenceEval(game)
      return -score;
    } else {
      score += 0//quiescenceEval(game)
    }
    return score;
  }




  function onDrop(sourceSquare, targetSquare) {
    var temp = new Chess()
    temp.load_pgn(game.pgn())
    var prevGameStatesCopy = prevGameStates
    prevGameStatesCopy.push(temp.pgn())
    setPrevGameStates(prevGameStatesCopy)
    var possibleMoves = temp.moves();

    if (pieceNum <= 27) {
      setGameState('middlegame')
    }
    if (pieceNum <= 14) {
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
    const gameCopy = new Chess(game.pgn())
    const move = game.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q'
    });
    if (move !== null) {
      if (move.san.includes("x") === true) {
        var temp = pieceNum - 1;
        setPieceNum(temp);
      }
    }
    //setGame(gameCopy);

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
      <div>{' '}</div>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <Button
        className="rc-Button"
        variant='outlined'
        onClick={() => {
          game.reset()
          setPrevEval(0)
          setEval(0)
          setUndosRemaining(3)
          console.log("Game Resetted")
          const start = new Chess()
          var states = [start]
          setPrevGameStates(states)
          // clear premove queue
          chessboardRef.current.clearPremoves();
          setPieceNum(32)
          // stop any current timeouts
          clearTimeout(currentTimeout);
          setGameState('')
          setStateOfGame('')
          if (boardOrientation === 'black' || boardOrientation === null || boardOrientation === undefined) {
            makeMove(engineColor);
          }
        }}
      >
        reset
      </Button>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <Button
        className="rc-Button"
        variant='outlined'
        onClick={() => {
          // undo twice to undo computer move too
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
      </Button>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <Button
        className="rc-Button"
        variant='outlined'
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
          if (playerColor === 'w') {
            console.log("Attempted Color swap")
            setPlayerColor('b')
            setEngineColor('white')
          } else {
            setPlayerColor('w')
            setEngineColor('black')
          }
          if (playerColor === 'w') {
            console.log("Move Attempted")
            makeMove(engineColor);
          }

          // if (boardOrientation === 'white' || boardOrientation === null || boardOrientation === undefined){
          //   makeMove();
          // }
        }}
      >
        change color
      </Button>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <Button
        className="rc-Button"
        variant='outlined'
        onClick={() => {
          setBoardOrientation((currentOrientation) => (currentOrientation === 'black' ? 'white' : 'black'));
        }}
      >
        flip board
      </Button>
      <span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <form onSubmit={loadFromFEN}>
        <label>
          Load position from FEN string:
          <input type="text" value={fenInput} onChange={(e) => setFenInput(e.target.value)} />
        </label>
        <input type="submit" value="Submit" />
      </form>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridGap: 30 }}>
        <h1>
          {currentEval}
        </h1>
      </div>
    </div>
  );
}