import {useRef, useState} from 'react';
import { Chessboard } from 'react-chessboard';
import './App.css';
import Chess from 'chess.js';
import clone from 'just-clone';

export default function App({ boardWidth }) {
  const [game, setGame] = useState(new Chess());
  const [currentTimeout, setCurrentTimeout] = useState(undefined);
  const chessboardRef = useRef();

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
      nextBoard.push()
    }
    return 1;
  }

  function evaluation(game){
    
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
    const newTimeout = setTimeout(makeMove, 2000);
    setCurrentTimeout(newTimeout);
    return true;
  }

  return (
    <div>
      <Chessboard
        id="PlayVsRandom"
        animationDuration={200}
        arePremovesAllowed={true}
        boardWidth={boardWidth}
        position={game.fen()}
        isDraggablePiece={({ piece }) => piece[0] === 'w'}
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
    </div>
  );
}