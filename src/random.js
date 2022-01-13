
  //to call: minimax(game, 3, -10000, 10000, true)
  const minimax = (game, currentDepth, targetDepth, alpha, beta, maximizing) => {
    if (currentDepth === 0 || game.game_over() === true) {
      return evaluation(game);
    }
    if(maximizing){
      let maxEval = -100000
      for(let m of possibleMoves){
        const gameCopy = new Chess(game.fen())
        gameCopy.move(m)
        
        if(currentDepth === targetDepth - 1){
          const res = minimax(gameCopy, currentDepth - 1, targetDepth, alpha, beta, maximizing)
          if(maxEval >= res){
            maxEval = res
            index = i
          }
        }
        let eval = minimax(gameCopy, currentDepth - 1, targetDepth, alpha, beta, false)
        maxEval = Math.max(maxEval, eval)
        if(beta <= alpha){
          break;
        }
        return maxEval;
      }
      if(currentDepth === targetDepth){
        setEval(maxEval)
        return index
      }
    }else{
      let minEval = 100000
      for(let m of possibleMoves){
        const gameCopy = new Chess(game.fen())
        gameCopy.move(m)
        
        if(currentDepth === targetDepth - 1){
          const res = minimax(gameCopy, currentDepth - 1, targetDepth, alpha, beta, maximizing)
          if(maxEval >= res){
            maxEval = res
            index = i
          }
        }
        let eval = minimax(gameCopy, currentDepth - 1, targetDepth, alpha, beta, true)
        minEval = Math.min(minEval, eval)
        return minEval
      }
      if(currentDepth === targetDepth){
        setEval(minEval)
        return index
      }
    }
  }

//backup
const f = (game, depth, targetDepth, color) => {
    if (depth == targetDepth) {
      return evaluation(game)
    }
 
    const possibleMoves = game.moves()
 
    // ASSUME WE ARE Black (African American)
    let bestEval
    let index = -1
    if(color === 'black'){
      for (let i = 0; i < possibleMoves.length; i++) {
        let s = possibleMoves[i]
        const gameCopy = new Chess(game.fen())
        gameCopy.move(s)
        if (depth == 1) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            if (bestEval >= res) {
              bestEval = res
              index = i
            }
          }
        if (depth % 2 == 0) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.max(bestEval, res)
        }else {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.min(bestEval, res)
        }
      }
      if (depth == 1) {
        setEval(bestEval)
        return index
      }

      return bestEval
    }else{
      for (let i = 0; i < possibleMoves.length; i++) {
        let s = possibleMoves[i]
        const gameCopy = new Chess(game.fen())
        gameCopy.move(s)
        if (depth == 1) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            if (bestEval <= res) {
              bestEval = res
              index = i
            }
          }
        if (depth % 2 == 0) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.min(bestEval, res)
        }else {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.max(bestEval, res)
          }
      }
      if (depth == 1) {
        setEval(bestEval)
        return index
      }

      return bestEval
    }
  }





    // ASSUME WE ARE Black (African American)
    let bestEval
    let index = -1
    if(color === 'black'){
      for (let i = 0; i < possibleMoves.length; i++) {
        let s = possibleMoves[i]
        const gameCopy = new Chess(game.fen())
        gameCopy.move(s)
        if (depth == 1) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            if (bestEval >= res) {
              bestEval = res
              index = i
            }
          }
        if (depth % 2 == 0) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.max(bestEval, res)
        }else {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.min(bestEval, res)
          }
      }
      if (depth == 1) {
        setEval(bestEval)
        return index
      }

      return bestEval
    }else{
      for (let i = 0; i < possibleMoves.length; i++) {
        let s = possibleMoves[i]
        const gameCopy = new Chess(game.fen())
        gameCopy.move(s)
        if (depth == 1) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            if (bestEval <= res) {
              bestEval = res
              index = i
            }
          }
        if (depth % 2 == 0) {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.min(bestEval, res)
        }else {
          const res = f(gameCopy, depth + 1, targetDepth, color)
          if (bestEval == undefined || bestEval == null) bestEval = res
            bestEval = Math.max(bestEval, res)
          }
      }
      if (depth == 1) {
        setEval(bestEval)
        return index
      }

      return bestEval
    }
  }