import {pawn, knight, bishop, rook, queen, king} from './pieceTables.js';
export function moveOrdering(moves) {
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

export function pieceValue(piece, squareName, color){
    var square = squareToInt(squareName);
    if(piece === 'p'){
      return pawn(square, color)
    }
    if(piece === 'n'){
      return knight(square)
    }
    if(piece === 'b'){
      return bishop(square)
    }
    if(piece === 'r'){
      return rook(square, color)
    }
    if(piece === 'q'){
      return queen(square)
    }
    if(piece === 'k'){
      return king(square, color)
    }
  }

export function squareToInt(square){
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

export function intToSquare(num){
    var str = "";
    if(num % 8 === 0){
      str += "a"
    }
    if(num % 8 === 1){
      str += "b"
    }
    if(num % 8 === 2){
      str += "c"
    }
    if(num % 8 === 3){
      str += "d"
    }
    if(num % 8 === 4){
      str += "e"
    }
    if(num % 8 === 5){
      str += "f"
    }
    if(num % 8 === 6){
      str += "g"
    }
    if(num % 8 === 7){
      str += "h"
    }
    if(Math.floor(num / 8) === 0){
      str += "8"
    }
    if(Math.floor(num / 8) === 1){
      str += "7"
    }
    if(Math.floor(num / 8) === 2){
      str += "6"
    }
    if(Math.floor(num / 8) === 3){
      str += "5"
    }
    if(Math.floor(num / 8) === 4){
      str += "4"
    }
    if(Math.floor(num / 8) === 5){
      str += "3"
    }
    if(Math.floor(num / 8) === 6){
      str += "2"
    }
    if(Math.floor(num / 8) === 7){
      str += "1"
    }
    return str;
}