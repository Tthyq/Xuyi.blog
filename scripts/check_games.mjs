import assert from 'node:assert/strict';
import {lineWinner,ticMove,flipLights,makePuzzle,slideNeighbors,makeMaze,makeSudoku,sudokuCount,sudokuAllowed} from '../src/scripts/game-math.js';
function explore(b){const winner=lineWinner(b,3,3,3);assert.notEqual(winner,'X','Computer must never lose');if(winner||b.every(Boolean))return;for(let i=0;i<9;i++)if(!b[i]){b[i]='X';assert.notEqual(lineWinner(b,3,3,3),'X');if(!b.every(Boolean)){const ai=ticMove(b);assert(ai>=0&&!b[ai]);b[ai]='O';explore(b);b[ai]=''}b[i]=''}}explore(Array(9).fill(''));
for(const [dx,dy,x,y] of [[1,0,0,3],[0,1,2,0],[1,1,0,0],[1,-1,0,4]]){const b=Array(42).fill('');for(let i=0;i<4;i++)b[(y+dy*i)*7+x+dx*i]='A';assert.equal(lineWinner(b,6,7,4),'A')}
for(let trial=0;trial<40;trial++){
 const b=makePuzzle();assert.equal(new Set(b).size,16);let inversions=0;for(let i=0;i<16;i++)for(let j=i+1;j<16;j++)if(b[i]&&b[j]&&b[i]>b[j])inversions++;assert.equal((inversions+4-Math.floor(b.indexOf(0)/4))%2,1);assert(!slideNeighbors(3).includes(4));
 const lights=Array(25).fill(false),moves=Array.from({length:20},()=>Math.floor(Math.random()*25));moves.forEach(i=>flipLights(lights,i));moves.reverse().forEach(i=>flipLights(lights,i));assert(lights.every(v=>!v));
 const maze=makeMaze(),seen=new Set([16]),queue=[16];for(let at=0;at<queue.length;at++){const p=queue[at];for(const d of [-15,15,-1,1])if(p+d>=0&&p+d<225&&!maze[p+d]&&!seen.has(p+d)){seen.add(p+d);queue.push(p+d)}}assert(seen.has(13*15+13));
 const s=makeSudoku();assert.equal(sudokuCount(s.puzzle),1);s.solution.forEach((v,i)=>assert(sudokuAllowed(s.solution,i,v)));
}
console.log('Passed: unbeatable tic-tac-toe, four-direction connect-four, 40 solvable sliding puzzles, light reversibility, connected mazes and unique 4×4 sudoku puzzles.');
