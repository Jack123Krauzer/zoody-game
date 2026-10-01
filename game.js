import { drawGame } from './renderer.js';
import { cleanName, loadLeaderboard, submitScore } from './leaderboard.js';

const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),comboEl=document.getElementById('combo'),healthEl=document.getElementById('health');
const waveEl=document.getElementById('wave'),bestEl=document.getElementById('best'),overlay=document.getElementById('overlay');
const overlayText=document.getElementById('overlayText'),startBtn=document.getElementById('startBtn'),pauseBtn=document.getElementById('pauseBtn');
const soundBtn=document.getElementById('soundBtn'),nameEl=document.getElementById('playerName'),tipBar=document.getElementById('tipBar');
const waveBanner=document.getElementById('waveBanner'),leaderboardEl=document.getElementById('leaderboard');
const leaderboardStatus=document.getElementById('leaderboardStatus'),dpad=[...document.querySelectorAll('.dpad button')];
const lowFx=matchMedia('(pointer: coarse)').matches
  || (typeof navigator.deviceMemory==='number'&&navigator.deviceMemory<=4)
  || (typeof navigator.hardwareConcurrency==='number'&&navigator.hardwareConcurrency<=4);
const W=960,H=540,MAX_HEALTH=3,keys=Object.create(null);
if(lowFx){
  canvas.width=640;
  canvas.height=360;
}
const renderScale=canvas.width/W;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a);

function getLocal(k,d=''){try{return localStorage.getItem(k)??d}catch{return d}}
function setLocal(k,v){try{localStorage.setItem(k,String(v))}catch{}}

let running=false,paused=false,last=0,time=0,score=0,best=Number(getLocal('zoody-best','0'))||0;
let health=MAX_HEALTH,distance=0,wave=1,nextWaveAt=650,combo=1,comboTimer=0,bestCombo=1;
let shieldTimer=0,bossTimer=0,spawnCrystal=0,spawnEnemy=.8,spawnPower=5,spawnBoss=0,screenShake=0;
let soundOn=getLocal('zoody-sound','1')!=='0',scoreSubmitted=false,bannerTimer=0;
let crystals=[],enemies=[],powerups=[],particles=[];
const player={x:160,y:H*.5,r:25,speed:355,inv:0,trail:[],wing:0};
const stars=Array.from({length:lowFx?54:120},()=>({x:rand(0,W),y:rand(0,H),s:rand(.7,2.4),speed:rand(10,42),alpha:rand(.25,.75)}));
const clouds=Array.from({length:lowFx?4:8},()=>({x:rand(0,W),y:rand(55,H-160),w:rand(110,230),h:rand(24,48),speed:rand(12,30),alpha:rand(.1,.24)}));
const islands=Array.from({length:lowFx?3:5},(_,i)=>({x:i*(lowFx?340:240)+rand(-40,40),y:rand(420,505),w:rand(150,250),h:rand(45,90),speed:rand(28,42)}));

nameEl.value='';
soundBtn.textContent=soundOn?'🔊':'🔇';

let audioCtx=null;
function audio(){
  if(!soundOn)return null;
  if(!audioCtx){
    const A=window.AudioContext||window.webkitAudioContext;
    if(!A)return null;
    audioCtx=new A();
  }
  if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});
  return audioCtx;
}
function tone(freq,d=.08,type='sine',gain=.03,slide=0){
  const a=audio();if(!a)return;
  const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(freq,a.currentTime);
  if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),a.currentTime+d);
  g.gain.setValueAtTime(gain,a.currentTime);g.gain.exponentialRampToValueAtTime(.0001,a.currentTime+d);
  o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+d);
}
function sfx(k){
  if(k==='crystal'){tone(740,.07,'triangle',.026,190);setTimeout(()=>tone(980,.05,'triangle',.018,110),45)}
  if(k==='hit')tone(150,.16,'sawtooth',.04,-70);
  if(k==='shield'){tone(420,.08,'sine',.03,220);setTimeout(()=>tone(720,.12,'sine',.024,180),65)}
  if(k==='blast')tone(130,.24,'sawtooth',.045,420);
  if(k==='heart'){tone(520,.1,'triangle',.028,120);setTimeout(()=>tone(690,.1,'triangle',.024,130),90)}
  if(k==='wave'){tone(300,.08,'square',.018,100);setTimeout(()=>tone(470,.09,'square',.018,160),90)}
  if(k==='boss'){tone(105,.35,'sawtooth',.04,-25);setTimeout(()=>tone(85,.4,'sawtooth',.035,30),190)}
  if(k==='gameover'){tone(300,.18,'triangle',.03,-120);setTimeout(()=>tone(180,.28,'triangle',.028,-70),150)}
}

function state(){
  return {W,H,time,wave,bossTimer,stars,clouds,islands,player,shieldTimer,crystals,enemies,powerups,particles,distance,combo,comboTimer,screenShake};
}
function hud(){
  scoreEl.textContent=`💎 ${score}`;comboEl.textContent=`⚡ x${combo}`;
  healthEl.textContent='❤️'.repeat(health)+'🖤'.repeat(MAX_HEALTH-health);
  waveEl.textContent=`🌊 ${wave}`;bestEl.textContent=`🏆 ${best}`;
  comboEl.style.opacity=combo>1?'1':'.68';
}
function tip(t){tipBar.textContent=t}
function banner(t,boss=false){
  clearTimeout(bannerTimer);waveBanner.textContent=t;waveBanner.style.borderColor=boss?'#ff7a5a88':'#ffffff22';
  waveBanner.style.color=boss?'#ffd8cc':'#fff';waveBanner.classList.add('show');
  bannerTimer=setTimeout(()=>waveBanner.classList.remove('show'),1700);
}
function burst(x,y,color,count=12,speed=190,size=5){
  const particleCount=lowFx?Math.min(count,14):count;
  for(let i=0;i<particleCount;i++){
    const a=rand(0,Math.PI*2),v=rand(speed*.35,speed);
    particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.3,.9),size:rand(2,size),color});
  }
}

function reset(){
  score=0;health=MAX_HEALTH;distance=0;wave=1;nextWaveAt=650;combo=1;comboTimer=0;bestCombo=1;
  shieldTimer=0;bossTimer=0;spawnBoss=0;time=0;spawnCrystal=0;spawnEnemy=.8;spawnPower=5;screenShake=0;
  scoreSubmitted=false;crystals=[];enemies=[];powerups=[];particles=[];
  Object.assign(player,{x:160,y:H*.5,inv:0,trail:[],wing:0});hud();tip('Collect crystals • Chain combos • Survive each wave');
}
function startGame(){
  const typedName=nameEl.value.trim();
  if(!typedName){
    nameEl.setCustomValidity('Enter a pilot name to start.');
    nameEl.reportValidity();
    nameEl.focus();
    return;
  }
  nameEl.setCustomValidity('');
  nameEl.value=cleanName(typedName);
  audio();
  reset();
  running=true;paused=false;overlay.classList.remove('visible');pauseBtn.textContent='⏸ Pause';startBtn.textContent='Start Adventure';
  last=performance.now();banner('WAVE 1 · OPEN SKIES');requestAnimationFrame(loop);
}
function pauseGame(){
  if(!running||paused)return;paused=true;pauseBtn.textContent='▶ Resume';overlay.classList.add('visible');
  overlay.querySelector('h1').textContent='Game Paused';
  overlayText.textContent=`Zoody is hovering at ${Math.floor(distance)}m with ${score} points. The meteors have grudgingly agreed to wait.`;
  startBtn.textContent='Resume Adventure';
}
function resumeGame(){
  if(!running||!paused)return;paused=false;overlay.classList.remove('visible');pauseBtn.textContent='⏸ Pause';
  last=performance.now();requestAnimationFrame(loop);
}
function gameOver(){
  if(!running)return;running=false;paused=false;sfx('gameover');
  if(score>best){best=score;setLocal('zoody-best',best)}hud();overlay.classList.add('visible');
  overlay.querySelector('h1').textContent=score===best&&score>0?'New Personal Best!':'Adventure Over';
  overlayText.textContent=`${cleanName(nameEl.value)} flew ${Math.floor(distance)}m, reached wave ${wave}, and scored ${score} with a best combo of x${bestCombo}.`;
  startBtn.textContent='Fly Again';pauseBtn.textContent='⏸ Pause';tip('Run complete • Score submitted to the global board');
  if(!scoreSubmitted&&score>0){
    scoreSubmitted=true;
    submitScore({playerName:nameEl.value,score,distance,wave}).then(ok=>{if(ok)loadLeaderboard(leaderboardEl,leaderboardStatus)}).catch(()=>{});
  }
}

function addCrystal(){crystals.push({x:W+30,y:rand(75,H-75),r:rand(13,17),spin:rand(0,6),bob:rand(0,6)})}
function addEnemy(force=null){
  const kind=force||(Math.random()<Math.min(.18+wave*.025,.4)?'shard':'fireball');
  if(kind==='boss'){enemies.push({kind,x:W+90,y:rand(125,H-125),r:49,speed:145+wave*5,wobble:rand(0,6),phase:rand(0,6)});return}
  const shard=kind==='shard';
  enemies.push({kind,x:W+55,y:rand(60,H-60),r:shard?15:21,speed:(shard?rand(330,430):rand(230,325))+wave*8,wobble:rand(0,6),phase:rand(0,6)});
}
function addPower(){
  const r=Math.random(),type=r<.5?'shield':r<.82?'blast':'heart';
  powerups.push({type,x:W+45,y:rand(90,H-90),r:18,pulse:rand(0,6),spin:0});
}
function collectCrystal(c){
  combo=comboTimer>0?Math.min(8,combo+1):1;comboTimer=1.55;bestCombo=Math.max(bestCombo,combo);score+=combo;sfx('crystal');
  burst(c.x,c.y,'#77f7ff',14+combo,180+combo*10,5);if(combo>=4)tip(`Combo x${combo}! Keep chaining crystals.`);hud();
}
function collectPower(p){
  if(p.type==='shield'){
    shieldTimer=Math.max(shieldTimer,6.5);sfx('shield');tip('Shield online for 6.5 seconds!');burst(p.x,p.y,'#ffe66b',22,230,6);
  }else if(p.type==='blast'){
    const n=enemies.filter(e=>e.kind!=='boss').length;enemies=enemies.filter(e=>e.kind==='boss');score+=n*3;sfx('blast');screenShake=.35;
    tip(`Sky burst! ${n} hazards cleared.`);burst(player.x,player.y,'#ffad66',32,310,7);
  }else{
    const wasFull=health>=MAX_HEALTH;if(!wasFull)health++;else score+=8;sfx('heart');
    tip(wasFull?'Full health bonus +8!':'Heart restored!');burst(p.x,p.y,'#ff7fa6',20,210,6);
  }hud();
}
function hit(e){
  if(player.inv>0)return;
  if(shieldTimer>0){
    shieldTimer=0;sfx('shield');screenShake=.2;tip('Shield shattered. Better it than Zoody.');burst(player.x,player.y,'#ffe46d',24,260,6);return;
  }
  health-=e.kind==='boss'?2:1;health=Math.max(0,health);combo=1;comboTimer=0;player.inv=1.15;
  screenShake=e.kind==='boss'?.55:.28;sfx('hit');burst(player.x,player.y,'#ff704f',24,260,7);
  tip(e.kind==='boss'?'Boss impact! That one was expensive.':'Hit! Combo reset.');hud();if(health<=0)gameOver();
}
function waveName(n){
  const names=['OPEN SKIES','CLOUD RUSH','STORM BELT','EMBER FRONT','AURORA RUN','STARFALL','VOID WIND'];
  return names[(n-1)%names.length];
}
function nextWave(){
  wave++;nextWaveAt+=650+wave*55;spawnEnemy=.35;
  if(wave%4===0){bossTimer=11;spawnBoss=.7;sfx('boss');banner(`🔥 BOSS WAVE ${wave} · METEOR TITAN`,true);tip('Boss wave! Giant cores deal two hearts of damage.')}
  else{sfx('wave');banner(`WAVE ${wave} · ${waveName(wave)}`);tip(`Wave ${wave}: hazard speed increased.`)}
  hud();
}

function update(dt){
  time+=dt;distance+=dt*(96+wave*3.5);player.inv=Math.max(0,player.inv-dt);shieldTimer=Math.max(0,shieldTimer-dt);
  bossTimer=Math.max(0,bossTimer-dt);screenShake=Math.max(0,screenShake-dt);
  if(comboTimer>0){comboTimer-=dt;if(comboTimer<=0&&combo!==1){combo=1;hud()}}
  if(distance>=nextWaveAt)nextWave();

  let dx=0,dy=0;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(keys.w||keys.arrowup)dy--;if(keys.s||keys.arrowdown)dy++;
  if(dx||dy){const l=Math.hypot(dx,dy);player.x+=dx/l*player.speed*dt;player.y+=dy/l*player.speed*dt}
  player.x=clamp(player.x,52,W-55);player.y=clamp(player.y,52,H-55);player.wing+=dt*11;
  player.trail.push({x:player.x-33,y:player.y+rand(-5,5),life:.45,r:rand(3,8)});
  const trailLimit=lowFx?24:44;
  if(player.trail.length>trailLimit)player.trail.shift();for(const t of player.trail)t.life-=dt;player.trail=player.trail.filter(t=>t.life>0);

  if((spawnCrystal-=dt)<=0){addCrystal();spawnCrystal=rand(.48,.92)}
  if((spawnEnemy-=dt)<=0){addEnemy();spawnEnemy=rand(.72,1.14)*(bossTimer>0?.62:1)/Math.min(1.45,1+wave*.035)}
  if(bossTimer>0&&(spawnBoss-=dt)<=0){addEnemy('boss');spawnBoss=rand(3.8,5.2)}
  if((spawnPower-=dt)<=0){addPower();spawnPower=rand(7.5,11.5)}

  for(const s of stars){s.x-=s.speed*dt*(1+wave*.015);if(s.x<-8){s.x=W+8;s.y=rand(0,H)}}
  for(const c of clouds){c.x-=c.speed*dt;if(c.x<-c.w){c.x=W+c.w;c.y=rand(55,H-160)}}
  for(const i of islands){i.x-=i.speed*dt;if(i.x<-i.w)i.x=W+rand(80,250)}
  for(const c of crystals){c.x-=(235+wave*5)*dt;c.spin+=dt*5;c.y+=Math.sin(time*4.2+c.bob)*18*dt}
  for(const e of enemies){e.x-=e.speed*dt;e.y+=Math.sin(time*(e.kind==='boss'?1.8:4)+e.wobble)*(e.kind==='boss'?58:e.kind==='shard'?18:42)*dt;e.phase+=dt}
  for(const p of powerups){p.x-=205*dt;p.pulse+=dt*5;p.spin+=dt*2.4}

  crystals=crystals.filter(c=>{if(Math.hypot(c.x-player.x,c.y-player.y)<c.r+player.r){collectCrystal(c);return false}return c.x>-50});
  powerups=powerups.filter(p=>{if(Math.hypot(p.x-player.x,p.y-player.y)<p.r+player.r){collectPower(p);return false}return p.x>-60});
  enemies=enemies.filter(e=>{if(Math.hypot(e.x-player.x,e.y-player.y)<e.r+player.r-3){hit(e);return false}return e.x>-110});
  for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.985;p.vy*=.985;p.life-=dt}
  particles=particles.filter(p=>p.life>0);
}
function draw(){
  ctx.setTransform(renderScale,0,0,renderScale,0,0);
  drawGame(ctx,state());
}
function loop(now){
  if(!running||paused)return;const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();
  if(running&&!paused)requestAnimationFrame(loop);
}

addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();keys[k]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();
  if(k==='p'&&running)(paused?resumeGame():pauseGame());
});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

dpad.forEach(btn=>{
  const k=btn.dataset.key,on=e=>{e.preventDefault();keys[k]=true},off=e=>{e.preventDefault();keys[k]=false};
  btn.addEventListener('pointerdown',on);btn.addEventListener('pointerup',off);btn.addEventListener('pointercancel',off);btn.addEventListener('pointerleave',off);
});

let dragging=false;
canvas.addEventListener('pointerdown',e=>{dragging=true;canvas.setPointerCapture(e.pointerId);movePointer(e)});
canvas.addEventListener('pointermove',e=>{if(dragging)movePointer(e)});
canvas.addEventListener('pointerup',()=>dragging=false);canvas.addEventListener('pointercancel',()=>dragging=false);
function movePointer(e){
  if(!running||paused)return;const r=canvas.getBoundingClientRect();
  player.x=clamp((e.clientX-r.left)*W/r.width,52,W-55);player.y=clamp((e.clientY-r.top)*H/r.height,52,H-55);
}

startBtn.addEventListener('click',()=>{if(running&&paused)resumeGame();else if(!running)startGame()});
pauseBtn.addEventListener('click',()=>{if(running)(paused?resumeGame():pauseGame())});
soundBtn.addEventListener('click',()=>{
  soundOn=!soundOn;setLocal('zoody-sound',soundOn?'1':'0');soundBtn.textContent=soundOn?'🔊':'🔇';
  if(soundOn){audio();sfx('crystal')}
});
nameEl.addEventListener('input',()=>nameEl.setCustomValidity(''));
nameEl.addEventListener('change',()=>{if(nameEl.value.trim())nameEl.value=cleanName(nameEl.value)});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused)pauseGame()});

hud();draw();loadLeaderboard(leaderboardEl,leaderboardStatus).catch(()=>leaderboardStatus.textContent='Offline');
