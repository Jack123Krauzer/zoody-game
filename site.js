import { drawGame } from './renderer.js';
import { loadLeaderboard } from './leaderboard.js';

const homeView=document.getElementById('homeView');
const gameView=document.getElementById('gameView');
const backBtn=document.getElementById('backToArcade');
const launchers=[...document.querySelectorAll('[data-launch-game]')];
const gameTile=document.querySelector('.game-tile');
const homeBoard=document.getElementById('homeLeaderboard');
const homeBoardStatus=document.getElementById('homeLeaderboardStatus');
const preview=document.getElementById('heroPreview');
const pctx=preview.getContext('2d');
const gameTopbar=gameView.querySelector('.topbar');
const gameShell=gameView.querySelector('.shell');
const gameWrap=gameView.querySelector('.game-wrap');

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarsePointer=matchMedia('(pointer: coarse)').matches;
const lowMemory=typeof navigator.deviceMemory==='number'&&navigator.deviceMemory<=4;
const lowCpu=typeof navigator.hardwareConcurrency==='number'&&navigator.hardwareConcurrency<=4;
const lowPower=coarsePointer||lowMemory||lowCpu;

if(lowPower){
  preview.width=640;
  preview.height=360;
}
const W=preview.width,H=preview.height;

function fitGameViewport(){
  if(gameView.hidden)return;

  const mobile=innerWidth<=720;
  const shellWidth=Math.max(220,gameShell?.clientWidth||0);
  const topbarHeight=gameTopbar?.offsetHeight||56;
  const outerGap=mobile?10:20;
  const availableW=Math.max(220,shellWidth);
  const availableH=Math.max(160,gameView.clientHeight-topbarHeight-outerGap);
  const ratio=16/9;

  let width=Math.min(availableW,availableH*ratio);
  let height=width/ratio;

  if(height>availableH){
    height=availableH;
    width=height*ratio;
  }

  gameWrap.style.width=`${Math.floor(width)}px`;
  gameWrap.style.height=`${Math.floor(height)}px`;
}

function openGame(){
  stopPreview();
  homeView.hidden=true;
  gameView.hidden=false;
  document.body.classList.add('playing-game');
  window.scrollTo(0,0);
  requestAnimationFrame(fitGameViewport);
}
function openHome(){
  const pause=document.getElementById('pauseBtn');
  if(pause&&!gameView.hidden&&pause.textContent.includes('Pause'))pause.click();
  gameView.hidden=true;
  homeView.hidden=false;
  document.body.classList.remove('playing-game');
  gameWrap.style.removeProperty('width');
  gameWrap.style.removeProperty('height');
  window.scrollTo(0,0);
  startPreview();
}

launchers.forEach(el=>el.addEventListener('click',openGame));
gameTile?.addEventListener('keydown',e=>{
  if(e.key==='Enter'||e.key===' '){
    e.preventDefault();
    openGame();
  }
});
backBtn?.addEventListener('click',openHome);
addEventListener('resize',()=>requestAnimationFrame(fitGameViewport),{passive:true});
addEventListener('orientationchange',()=>setTimeout(fitGameViewport,80),{passive:true});

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}

function rankMarkup(rows){
  if(!rows?.length)return '<li><span class="rank-num">01</span><span class="rank-name">No ranked runs yet<small>The throne is embarrassingly empty.</small></span><strong>—</strong></li>';
  return rows.map((r,i)=>`<li>
    <span class="rank-num">${String(i+1).padStart(2,'0')}</span>
    <span class="rank-name">${escapeHtml(r.name)}<small>Wave ${r.wave} · ${r.distance}m</small></span>
    <strong>${r.score}</strong>
  </li>`).join('');
}

async function loadHomeLeaderboard(){
  const temp=document.createElement('ol');
  const tempStatus=document.createElement('span');
  await loadLeaderboard(temp,tempStatus);
  const rows=[...temp.querySelectorAll('li')].map(li=>{
    const score=li.querySelector('span')?.textContent||'—';
    const raw=li.textContent.replace(score,'').trim();
    const name=raw.split(' W')[0].trim();
    const waveMatch=raw.match(/W(\d+)/);
    const distMatch=raw.match(/(\d+)m/);
    return {name:name||'Player',score,wave:waveMatch?.[1]||'1',distance:distMatch?.[1]||'0'};
  });
  homeBoard.innerHTML=rankMarkup(rows);
  homeBoardStatus.textContent=tempStatus.textContent==='Live'?'LIVE':'SYNCED';
}
loadHomeLeaderboard().catch(()=>{
  homeBoardStatus.textContent='OFFLINE';
  homeBoard.innerHTML=rankMarkup([]);
});

const rand=(a,b)=>a+Math.random()*(b-a);
const previewState={
  W,H,time:0,wave:4,bossTimer:8,shieldTimer:3.5,distance:2840,combo:6,comboTimer:1.1,screenShake:0,
  player:{x:W*.25,y:H*.53,inv:0,wing:0,trail:[]},
  stars:Array.from({length:lowPower?34:90},()=>({x:rand(0,W),y:rand(0,H),s:rand(.7,2.2),alpha:rand(.2,.7)})),
  clouds:lowPower
    ? [{x:W*.16,y:H*.2,w:130,h:26,alpha:.13},{x:W*.7,y:H*.28,w:145,h:28,alpha:.12}]
    : [{x:100,y:110,w:190,h:36,alpha:.16},{x:500,y:150,w:220,h:42,alpha:.13},{x:820,y:90,w:180,h:34,alpha:.15}],
  islands:lowPower
    ? [{x:W*.22,y:H*.88,w:180,h:58},{x:W*.72,y:H*.84,w:165,h:52}]
    : [{x:160,y:470,w:260,h:80},{x:540,y:448,w:220,h:72},{x:860,y:482,w:250,h:88}],
  crystals:[
    {x:W*.54,y:H*.44,r:15,spin:.2},
    {x:W*.68,y:H*.67,r:16,spin:1.2},
    {x:W*.84,y:H*.35,r:14,spin:2.5}
  ],
  powerups:[{type:'shield',x:W*.77,y:H*.54,r:18,pulse:0,spin:0}],
  enemies:lowPower
    ? [{kind:'fireball',x:W*.92,y:H*.63,r:22,phase:0},{kind:'boss',x:W*.98,y:H*.45,r:46,phase:0}]
    : [{kind:'fireball',x:880,y:340,r:22,phase:0},{kind:'shard',x:710,y:150,r:15,phase:0},{kind:'boss',x:935,y:245,r:50,phase:0}],
  particles:[]
};

let previewRaf=0;
let previewRunning=false;
let previewVisible=true;
let previewLast=performance.now();
let previewLastPaint=0;
const previewFrameMs=lowPower?50:16;

function paintPreview(now){
  if(!previewRunning)return;
  previewRaf=requestAnimationFrame(paintPreview);
  if(homeView.hidden||document.hidden||!previewVisible)return;
  if(now-previewLastPaint<previewFrameMs)return;

  const dt=Math.min((now-previewLast)/1000,.05);
  previewLast=now;
  previewLastPaint=now;
  previewState.time+=dt;
  previewState.player.wing+=dt*10;
  previewState.player.y=H*.53+Math.sin(previewState.time*1.8)*(H*.026);

  if(!lowPower){
    previewState.player.trail.push({
      x:previewState.player.x-W*.033,
      y:previewState.player.y+rand(-4,4),
      life:.45,
      r:rand(3,7)
    });
    previewState.player.trail.forEach(t=>t.life-=dt);
    previewState.player.trail=previewState.player.trail.filter(t=>t.life>0).slice(-24);
  }

  previewState.crystals.forEach(c=>{
    c.spin+=dt*4;
    c.x-=dt*(W*.023);
    if(c.x<W*.43)c.x=W*.88;
  });
  previewState.powerups.forEach(p=>{p.pulse+=dt*5;p.spin+=dt*2});
  previewState.enemies.forEach(e=>{
    e.phase+=dt;
    e.x-=dt*(e.kind==='boss'?W*.01:W*.025);
    if(e.x<W*.68)e.x=e.kind==='boss'?W*.99:W*.94;
  });
  drawGame(pctx,previewState);
}

function startPreview(){
  if(reducedMotion){
    drawGame(pctx,previewState);
    return;
  }
  if(previewRunning)return;
  previewRunning=true;
  previewLast=performance.now();
  previewLastPaint=0;
  previewRaf=requestAnimationFrame(paintPreview);
}
function stopPreview(){
  previewRunning=false;
  if(previewRaf)cancelAnimationFrame(previewRaf);
  previewRaf=0;
}

if('IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
    previewVisible=entries[0]?.isIntersecting??true;
    if(previewVisible&&!homeView.hidden)startPreview();
    else if(!previewVisible)stopPreview();
  },{rootMargin:'120px 0px'});
  observer.observe(preview);
}

document.addEventListener('visibilitychange',()=>{
  if(document.hidden)stopPreview();
  else if(!homeView.hidden&&previewVisible)startPreview();
});

drawGame(pctx,previewState);
startPreview();

const stage=document.querySelector('.stage-frame');
if(!lowPower&&matchMedia('(pointer:fine)').matches){
  stage?.addEventListener('pointermove',e=>{
    const r=stage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    stage.style.transform=`rotateY(${x*5-5}deg) rotateX(${-y*4+2}deg) translateY(-2px)`;
  });
  stage?.addEventListener('pointerleave',()=>{
    stage.style.transform='rotateY(-5deg) rotateX(2deg)';
  });
}
