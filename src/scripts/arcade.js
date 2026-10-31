import {shuffle,lineWinner,ticMove,flipLights,slideNeighbors,makePuzzle,makeMaze,sudokuAllowed,makeSudoku} from './game-math.js';
let dispose=()=>{};
function initArcade(){
 dispose();const root=document.querySelector('#arcade');if(!root)return;
 const controller=new AbortController(),$=s=>root.querySelector(s),stage=$('#play-stage'),status=$('#play-status'),score=$('#play-score'),extra=$('#play-extra'),start=$('#play-start'),reset=$('#play-reset'),controls=$('#play-controls'),help=$('#play-help');
 const timers=new Set();let frame=0,alive=true;
 const on=(el,event,fn)=>el.addEventListener(event,fn,{signal:controller.signal});
 const later=(fn,ms)=>{const id=setTimeout(()=>{timers.delete(id);if(alive)fn()},ms);timers.add(id);return id};
 const say=text=>status.textContent=text,setScore=(value,label='得分')=>score.textContent=label+' '+value;
 dispose=()=>{alive=false;controller.abort();timers.forEach(clearTimeout);cancelAnimationFrame(frame)};
 stage.replaceChildren();controls.replaceChildren();extra.textContent='';start.hidden=false;start.disabled=false;start.textContent='开始游戏';
 on(reset,'click',initArcade);
 function board(className,count){stage.innerHTML=`<div class="board ${className}">${Array.from({length:count},(_,i)=>`<button type="button" data-cell="${i}" aria-label="格子 ${i+1}"></button>`).join('')}</div>`;return[...stage.querySelectorAll('button')]}
 function buttons(items){for(const [label,fn] of items){const b=document.createElement('button');b.type='button';b.textContent=label;on(b,'click',fn);controls.append(b)}}
 function keys(fn){on(document,'keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)){e.preventDefault();fn(e.key)}})}
 function finish(text){say(text);start.disabled=true;start.textContent='本局结束'}
 function staticGame(){start.hidden=true;say('点击棋盘开始');}
 const id=root.dataset.game;
 if(id==='tic-tac-toe'){
  staticGame();const b=Array(9).fill(''),cells=board('tic',9);let ended=false,busy=false;setScore('你 X / 电脑 O','对局');help.textContent='你先手。横、竖或对角线三子相连获胜；电脑会认真防守。';
  const check=()=>{const winner=lineWinner(b,3,3,3);if(winner||b.every(Boolean)){ended=true;say(winner?(winner==='X'?'你赢了！':'电脑获胜，再来一局吧。'):'平局，旗鼓相当。');return true}return false};
  cells.forEach((cell,i)=>on(cell,'click',()=>{if(ended||busy||b[i])return;b[i]='X';cell.textContent='×';cell.disabled=true;if(check())return;busy=true;say('电脑思考中…');later(()=>{const move=ticMove(b);if(move>=0){b[move]='O';cells[move].textContent='○';cells[move].disabled=true}busy=false;if(!check())say('轮到你了 · X')},250)}));
 }else if(id==='connect-four'){
  staticGame();const b=Array(42).fill(''),cells=board('connect',42);let turn='A',ended=false;setScore('A 先手','双人');say('轮到 A · 绿色');help.textContent='两位玩家轮流点击一列。棋子会落到最底部的空位，横、竖、斜连成四颗即获胜。';
  cells.forEach((cell,i)=>on(cell,'click',()=>{if(ended)return;const col=i%7;let index=-1;for(let r=5;r>=0;r--)if(!b[r*7+col]){index=r*7+col;break}if(index<0){say('这一列已满，换一列。轮到 '+turn);return}b[index]=turn;cells[index].dataset.player=turn;cells[index].setAttribute('aria-label',`${turn} 棋子，第 ${Math.floor(index/7)+1} 行第 ${col+1} 列`);if(lineWinner(b,6,7,4)){ended=true;finish(turn+' 连成四子，获胜！');return}if(b.every(Boolean)){ended=true;finish('棋盘已满，本局平局。');return}turn=turn==='A'?'B':'A';say('轮到 '+turn+(turn==='A'?' · 绿色':' · 杏色'))}));
 }else if(id==='lights-out'){
  staticGame();const b=Array(25).fill(false);for(let k=0;k<16;k++)flipLights(b,Math.floor(Math.random()*25));if(!b.some(Boolean))flipLights(b,12);const cells=board('lights',25);let moves=0,ended=false;
  function draw(){cells.forEach((c,i)=>{c.classList.toggle('on',b[i]);c.setAttribute('aria-label',`第 ${i+1} 盏灯 · ${b[i]?'亮':'灭'}`)});setScore(moves,'步数');extra.textContent='剩余 '+b.filter(Boolean).length+' 盏'}draw();help.textContent='点击任意一格，会同时翻转它自己和上下左右四格。所有灯熄灭即通关。每个局面都由合法操作生成，可以解开。';cells.forEach((c,i)=>on(c,'click',()=>{if(ended)return;flipLights(b,i);moves++;draw();if(!b.some(Boolean)){ended=true;finish('全部熄灭！用了 '+moves+' 步。')}}));
 }else if(id==='sliding-puzzle'){
  staticGame();const b=makePuzzle(),cells=board('slide',16);let moves=0,ended=false;const draw=()=>{cells.forEach((c,i)=>{c.textContent=b[i]||'';c.classList.toggle('blank',b[i]===0);c.setAttribute('aria-label',b[i]?'数字 '+b[i]:'空格')});setScore(moves,'步数')};draw();help.textContent='点击空格旁边的数字，或用方向键移动空格。将 1～15 按从左到右、从上到下排好，空格留在右下。';const move=i=>{if(ended||!slideNeighbors(b.indexOf(0)).includes(i))return;const z=b.indexOf(0);[b[i],b[z]]=[b[z],b[i]];moves++;draw();if(b.every((v,i)=>v===(i+1)%16)){ended=true;finish('拼好了！用了 '+moves+' 步。')}};cells.forEach((c,i)=>on(c,'click',()=>move(i)));keys(key=>{const z=b.indexOf(0),offset={ArrowUp:-4,ArrowDown:4,ArrowLeft:-1,ArrowRight:1}[key];if(offset)move(z+offset)});
 }else if(id==='mini-sudoku'){
  staticGame();const {puzzle}=makeSudoku(),b=[...puzzle];stage.innerHTML=`<div class="board sudoku">${b.map((v,i)=>`<input aria-label="第 ${Math.floor(i/4)+1} 行第 ${i%4+1} 列" inputmode="numeric" maxlength="1" data-index="${i}" value="${v||''}" ${v?'disabled':''}>`).join('')}</div>`;const cells=[...stage.querySelectorAll('input')];help.textContent='每行、每列、每个 2×2 宫都必须包含 1、2、3、4。浅色底为已知数字，输入冲突会标记；每局都有唯一解。';
  function check(){let conflict=false;cells.forEach((c,i)=>{const bad=b[i]&&!sudokuAllowed(b,i,b[i]);c.classList.toggle('conflict',!!bad);if(bad)conflict=true});const filled=b.filter(Boolean).length;setScore(filled+' / 16','已填写');if(filled===16&&!conflict){finish('全部正确，数独完成！');cells.forEach(c=>c.disabled=true)}else say(conflict?'有重复数字，检查行、列和 2×2 宫。':'继续填写空白格。')}cells.forEach((c,i)=>on(c,'input',()=>{const v=c.value.replace(/[^1-4]/g,'').slice(-1);c.value=v;b[i]=+v;check()}));check();
 }else if(id==='maze'){
  staticGame();const maze=makeMaze(),canvas=document.createElement('canvas');canvas.width=450;canvas.height=450;stage.append(canvas);const ctx=canvas.getContext('2d');let x=1,y=1,moves=0,ended=false;setScore(0,'步数');say('绿色圆点是你，金色方块是出口。');
  function draw(){ctx.fillStyle='#f0f3e7';ctx.fillRect(0,0,450,450);maze.forEach((v,i)=>{if(v){ctx.fillStyle='#496a48';ctx.fillRect(i%15*30,Math.floor(i/15)*30,30,30)}});ctx.fillStyle='#d7b26d';ctx.fillRect(13*30+7,13*30+7,16,16);ctx.beginPath();ctx.fillStyle='#9dbb70';ctx.arc(x*30+15,y*30+15,9,0,Math.PI*2);ctx.fill()}
  function move(dx,dy){if(ended)return;const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=15||yy>=15||maze[yy*15+xx])return;x=xx;y=yy;moves++;setScore(moves,'步数');draw();if(x===13&&y===13){ended=true;finish('走出迷宫！共 '+moves+' 步。')}}keys(k=>{const d={ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0]}[k];if(d)move(...d)});buttons([['↑',()=>move(0,-1)],['←',()=>move(-1,0)],['↓',()=>move(0,1)],['→',()=>move(1,0)]]);help.textContent='用方向键或下面的按钮移动。每局都会生成一座连通的新迷宫；点击“新一局”可重新生成。';draw();
 }else if(id==='whack-a-mole'){
  const cells=board('mole',9);let running=false,active=-1,points=0,deadline=0;cells.forEach((c,i)=>{c.textContent='·';c.setAttribute('aria-label','地洞 '+(i+1));on(c,'click',()=>{if(!running||i!==active)return;points++;setScore(points);active=-1;paint()})});function paint(){cells.forEach((c,i)=>{c.classList.toggle('up',i===active);c.textContent=i===active?'●':'·';c.setAttribute('aria-label',(i===active?'地鼠 ':'地洞 ')+(i+1))})}function pop(){if(!running)return;active=Math.floor(Math.random()*9);paint();later(pop,750)}function clock(){if(!running)return;const remaining=Math.max(0,Math.ceil((deadline-performance.now())/1000));extra.textContent='剩余 '+remaining+' 秒';if(!remaining){running=false;active=-1;paint();finish('时间到！抓到 '+points+' 只地鼠。');return}later(clock,100)}on(start,'click',()=>{if(running)return;running=true;deadline=performance.now()+30000;start.disabled=true;start.textContent='游戏中';say('只点冒出头的地鼠！');pop();clock()});setScore(0);help.textContent='点击开始后计时 30 秒。每只地鼠只能计分一次，错过就等下一只。';
 }else if(id==='aim-trainer'){
  stage.innerHTML='<div class="aim-field"><button type="button" class="aim-target" aria-label="点击目标" hidden></button></div>';const target=stage.querySelector('button');let count=0,t0=0,running=false;setScore('0 / 20','击中');help.textContent='点击开始，然后依次点中 20 个圆形目标。每次命中后，目标会出现在新的位置。';function move(){target.style.left=(8+Math.random()*84)+'%';target.style.top=(10+Math.random()*80)+'%'}on(start,'click',()=>{if(running)return;running=true;start.disabled=true;target.hidden=false;t0=performance.now();say('跟上目标，点满 20 个。');move()});on(target,'click',()=>{if(!running)return;count++;setScore(count+' / 20','击中');extra.textContent=((performance.now()-t0)/1000).toFixed(1)+' 秒';if(count===20){target.hidden=true;running=false;finish('完成！用时 '+((performance.now()-t0)/1000).toFixed(2)+' 秒。')}else move()});
 }else if(id==='typing'){
  staticGame();const text=shuffle(['stay curious and keep moving','small steps make a long journey','make room for things that matter','a little rest helps ideas grow','learn something new every day'])[0];stage.innerHTML='<div class="typing-quote" aria-label="目标短句"></div><input id="typing-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="输入目标短句" placeholder="在这里开始输入…">';const quote=stage.querySelector('.typing-quote'),input=stage.querySelector('input');quote.textContent=text;let t0=0,total=0,errors=0,previous='';setScore('0','字符/分钟');extra.textContent='错误 0 次';help.textContent='输入上方英文短句，注意空格与大小写。第一次输入时开始计时，可退格修正；完成后显示速度、错误数与累计输入准确率。';on(input,'input',()=>{const value=input.value;if(!t0)t0=performance.now();let prefix=0;while(prefix<previous.length&&prefix<value.length&&previous[prefix]===value[prefix])prefix++;for(let i=prefix;i<value.length;i++){total++;if(value[i]!==text[i])errors++}previous=value;quote.replaceChildren(...[...text].map((char,i)=>{const span=document.createElement('span');span.textContent=char;if(i<value.length)span.className=value[i]===char?'right':'wrong';return span}));const elapsed=Math.max(.05,(performance.now()-t0)/60000);setScore(Math.round(value.length/elapsed),'字符/分钟');extra.textContent='错误 '+errors+' 次 · 准确率 '+Math.round((total-errors)/Math.max(1,total)*100)+'%';if(value===text){input.disabled=true;finish('短句完成，用时 '+((performance.now()-t0)/1000).toFixed(1)+' 秒。')}else say(value.length>text.length?'输入多了，检查一下结尾。':'慢慢来，保持准确。')});
 }else{
  canvasGame(id);
 }
 function canvasGame(type){
  const canvas=document.createElement('canvas');canvas.width=480;canvas.height=360;stage.append(canvas);const ctx=canvas.getContext('2d');let running=false,ended=false,last=0,elapsed=0,points=0,playerY=140,paddleX=195,aiY=140,vx=145,vy=-155,bx=240,by=245,lives=3,keysDown=new Set(),bricks=Array(32).fill(true),birdY=180,birdV=0,pipes=[],spawn=0,aiScore=0;
  setScore(0);say('准备好了就开始，随时可以暂停。');const onKey=(k,down)=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(k))return;if(['INPUT','TEXTAREA'].includes(document.activeElement?.tagName))return;k===' '&&down?flap():null;keysDown[down?'add':'delete'](k)};on(document,'keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown',' '].includes(e.key)){e.preventDefault();onKey(e.key,true)}});on(document,'keyup',e=>onKey(e.key,false));on(window,'blur',()=>{keysDown.clear();if(running){running=false;start.textContent='继续游戏';say('已暂停')}});on(document,'visibilitychange',()=>{if(document.hidden&&running){running=false;start.textContent='继续游戏';keysDown.clear();say('已暂停')}});
  const pointer=e=>{const rect=canvas.getBoundingClientRect(),x=(e.clientX-rect.left)*480/rect.width,y=(e.clientY-rect.top)*360/rect.height;if(type==='pong')playerY=Math.max(0,Math.min(290,y-35));if(type==='breakout')paddleX=Math.max(0,Math.min(390,x-45))};on(canvas,'pointermove',pointer);on(canvas,'pointerdown',e=>{pointer(e);if(type==='flappy')flap();canvas.setPointerCapture?.(e.pointerId)});
  function flap(){if(type==='flappy'&&running)birdV=-185}
  on(start,'click',()=>{if(ended)return;running=!running;last=0;start.textContent=running?'暂停':'继续游戏';say(running?'游戏进行中':'已暂停')});
  if(type==='flappy'){help.textContent='点击开始后，点击画面、按空格或点击“抬升”控制纸飞机。穿过空隙得分，碰到障碍或上下边界结束。';buttons([['抬升',flap]])}
  if(type==='breakout'){help.textContent='用鼠标或手指在画面内移动挡板，也可按左右方向键。清空 32 块砖获胜；小球掉落会损失一次机会，共 3 次。';buttons([['←',()=>paddleX=Math.max(0,paddleX-32)],['→',()=>paddleX=Math.min(390,paddleX+32)]])}
  if(type==='pong'){help.textContent='你控制左侧挡板，用鼠标、触屏拖动或上下方向键。电脑控制右侧，先得 7 分的一方获胜。';buttons([['↑',()=>playerY=Math.max(0,playerY-30)],['↓',()=>playerY=Math.min(290,playerY+30)]])}
  function end(message){running=false;ended=true;finish(message);const note=document.createElement('div');note.className='game-over-note';note.textContent=message;const small=document.createElement('small');small.textContent='点击“新一局”重新开始';note.append(small);stage.append(note)}
  function resetBall(toward=1){bx=240;by=180;vx=150*toward;vy=Math.random()>.5?110:-110}
  function update(dt){elapsed+=dt;
   if(type==='breakout'){
    if(keysDown.has('ArrowLeft'))paddleX=Math.max(0,paddleX-280*dt);if(keysDown.has('ArrowRight'))paddleX=Math.min(390,paddleX+280*dt);
    const prevY=by;bx+=vx*dt;by+=vy*dt;if(bx<7){bx=7;vx=Math.abs(vx)}if(bx>473){bx=473;vx=-Math.abs(vx)}if(by<7){by=7;vy=Math.abs(vy)}
    if(vy>0&&prevY+7<=326&&by+7>=326&&bx>paddleX-6&&bx<paddleX+96){by=319;vy=-Math.abs(vy);vx=(bx-(paddleX+45))*4}
    for(let i=0;i<32;i++)if(bricks[i]){const x=18+(i%8)*56,y=35+Math.floor(i/8)*26;if(bx+6>x&&bx-6<x+50&&by+6>y&&by-6<y+17){bricks[i]=false;vy=-vy;points++;setScore(points);break}}
    if(by>375){lives--;if(!lives){end('机会用完了，击碎 '+points+' 块砖。');return}bx=paddleX+45;by=295;vy=-160;vx=130;say('还有 '+lives+' 次机会')}
    extra.textContent='剩余机会 '+lives;if(points===32)end('全部砖块清空，赢了！');
   }else if(type==='pong'){
    if(keysDown.has('ArrowUp'))playerY=Math.max(0,playerY-270*dt);if(keysDown.has('ArrowDown'))playerY=Math.min(290,playerY+270*dt);
    aiY+=Math.max(-155*dt,Math.min(155*dt,by-(aiY+35)));aiY=Math.max(0,Math.min(290,aiY));bx+=vx*dt;by+=vy*dt;if(by<7){by=7;vy=Math.abs(vy)}if(by>353){by=353;vy=-Math.abs(vy)}
    if(vx<0&&bx<30&&bx>8&&by>playerY-7&&by<playerY+77){bx=30;vx=Math.abs(vx)*1.04;vy=(by-playerY-35)*4.7}if(vx>0&&bx>450&&bx<472&&by>aiY-7&&by<aiY+77){bx=450;vx=-Math.abs(vx)*1.04;vy=(by-aiY-35)*4.7}
    if(bx< -12){aiScore++;resetBall(1)}if(bx>492){points++;resetBall(-1)}setScore(points+' : '+aiScore,'你 / 电脑');extra.textContent='先到 7 分';if(points>=7||aiScore>=7)end(points>=7?'你赢得了这场比赛！':'电脑赢了，再挑战一局吧。');
   }else if(type==='flappy'){
    birdV+=440*dt;birdY+=birdV*dt;spawn-=dt;if(spawn<=0){pipes.push({x:505,gap:85+Math.random()*180,passed:false});spawn=1.8}
    for(const p of pipes){p.x-=120*dt;if(p.x+42<120&&!p.passed){p.passed=true;points++;setScore(points)}if(120+12>p.x&&120-12<p.x+42&&(birdY-9<p.gap-66||birdY+9>p.gap+66)){end('飞行结束，通过 '+points+' 道障碍。');return}}pipes=pipes.filter(p=>p.x> -50);if(birdY<9||birdY>351)end('碰到边界了，通过 '+points+' 道障碍。');extra.textContent='飞行 '+elapsed.toFixed(1)+' 秒';
   }
  }
  function draw(){ctx.fillStyle='#203b2a';ctx.fillRect(0,0,480,360);ctx.strokeStyle='#ffffff08';for(let x=0;x<480;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,360);ctx.stroke()}for(let y=0;y<360;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(480,y);ctx.stroke()}
   if(type==='breakout'){bricks.forEach((v,i)=>{if(v){ctx.fillStyle=['#b1c38e','#92b6a2','#dbc18d','#b7a4bf'][Math.floor(i/8)];ctx.fillRect(18+(i%8)*56,35+Math.floor(i/8)*26,50,17)}});ctx.fillStyle='#d8e7b3';ctx.fillRect(paddleX,326,90,9);ball()}
   if(type==='pong'){ctx.setLineDash([4,7]);ctx.strokeStyle='#819a6c';ctx.beginPath();ctx.moveTo(240,0);ctx.lineTo(240,360);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#c2d59e';ctx.fillRect(15,playerY,10,70);ctx.fillStyle='#dfbd8b';ctx.fillRect(455,aiY,10,70);ball()}
   if(type==='flappy'){ctx.fillStyle='#738c5d';pipes.forEach(p=>{ctx.fillRect(p.x,0,42,p.gap-66);ctx.fillRect(p.x,p.gap+66,42,360-p.gap-66);ctx.fillStyle='#9eb781';ctx.fillRect(p.x-3,p.gap-74,48,8);ctx.fillRect(p.x-3,p.gap+66,48,8);ctx.fillStyle='#738c5d'});ctx.save();ctx.translate(120,birdY);ctx.rotate(Math.max(-.45,Math.min(.8,birdV/350)));ctx.fillStyle='#e5cf9d';ctx.beginPath();ctx.moveTo(17,0);ctx.lineTo(-13,-10);ctx.lineTo(-5,0);ctx.lineTo(-13,10);ctx.closePath();ctx.fill();ctx.restore()}
  }
  function ball(){ctx.fillStyle='#e8d6a9';ctx.beginPath();ctx.arc(bx,by,6,0,Math.PI*2);ctx.fill()}
  function loop(t){if(!alive)return;if(running){const dt=last?Math.min(.025,(t-last)/1000):0;update(dt)}last=t;draw();frame=requestAnimationFrame(loop)}draw();frame=requestAnimationFrame(loop);
 }
}
document.addEventListener('astro:page-load',initArcade);document.addEventListener('astro:before-swap',()=>dispose());
