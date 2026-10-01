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
const W=preview.width,H=preview.height;

function openGame(){
  homeView.hidden=true;
  gameView.hidden=false;
  document.body.classList.add('playing-game');
  window.scrollTo(0,0);
}
function openHome(){
  const pause=document.getElementById('pauseBtn');
  if(pause&&!gameView.hidden&&pause.textContent.includes('Pause'))pause.click();
  gameView.hidden=true;
  homeView.hidden=false;
  document.body.classList.remove('playing-game');
  window.scrollTo(0,0);
}
launchers.forEach(el=>el.addEventListener('click',openGame));
gameTile?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openGame()}});
backBtn?.addEventListener('click',openHome);

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
    return {name:name||'SkyRider',score,wave:waveMatch?.[1]||'1',distance:distMatch?.[1]||'0'};
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
  player:{x:240,y:286,inv:0,wing:0,trail:[]},
  stars:Array.from({length:90},()=>({x:rand(0,W),y:rand(0,H),s:rand(.7,2.2),alpha:rand(.2,.7)})),
  clouds:[
    {x:100,y:110,w:190,h:36,alpha:.16},{x:500,y:150,w:220,h:42,alpha:.13},{x:820,y:90,w:180,h:34,alpha:.15}
  ],
  islands:[
    {x:160,y:470,w:260,h:80},{x:540,y:448,w:220,h:72},{x:860,y:482,w:250,h:88}
  ],
  crystals:[
    {x:520,y:240,r:15,spin:.2},{x:650,y:360,r:16,spin:1.2},{x:805,y:190,r:14,spin:2.5}
  ],
  powerups:[{type:'shield',x:735,y:290,r:18,pulse:0,spin:0}],
  enemies:[
    {kind:'fireball',x:880,y:340,r:22,phase:0},
    {kind:'shard',x:710,y:150,r:15,phase:0},
    {kind:'boss',x:935,y:245,r:50,phase:0}
  ],
  particles:[]
};

let last=performance.now();
function animatePreview(now){
  const dt=Math.min((now-last)/1000,.033);last=now;
  if(!homeView.hidden){
    previewState.time+=dt;previewState.player.wing+=dt*10;
    previewState.player.y=286+Math.sin(previewState.time*1.8)*14;
    previewState.player.trail.push({x:previewState.player.x-32,y:previewState.player.y+rand(-4,4),life:.45,r:rand(3,7)});
    previewState.player.trail.forEach(t=>t.life-=dt);
    previewState.player.trail=previewState.player.trail.filter(t=>t.life>0).slice(-34);
    previewState.crystals.forEach(c=>{c.spin+=dt*4;c.x-=dt*22;if(c.x<420)c.x=840});
    previewState.powerups.forEach(p=>{p.pulse+=dt*5;p.spin+=dt*2});
    previewState.enemies.forEach(e=>{e.phase+=dt;e.x-=dt*(e.kind==='boss'?10:24);if(e.x<660)e.x=e.kind==='boss'?950:900});
    drawGame(pctx,previewState);
  }
  requestAnimationFrame(animatePreview);
}
drawGame(pctx,previewState);
requestAnimationFrame(animatePreview);

const stage=document.querySelector('.stage-frame');
if(matchMedia('(pointer:fine)').matches){
  stage?.addEventListener('pointermove',e=>{
    const r=stage.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
    stage.style.transform=`rotateY(${x*5-5}deg) rotateX(${-y*4+2}deg) translateY(-2px)`;
  });
  stage?.addEventListener('pointerleave',()=>stage.style.transform='rotateY(-5deg) rotateX(2deg)');
}
