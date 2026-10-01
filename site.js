import { loadLeaderboard } from './leaderboard.js';

const homeView=document.getElementById('homeView');
const gameView=document.getElementById('gameView');
const backBtn=document.getElementById('backToArcade');
const launchers=[...document.querySelectorAll('[data-launch-game]')];
const gameTile=document.querySelector('.feature-game');
const homeBoard=document.getElementById('homeLeaderboard');
const homeBoardStatus=document.getElementById('homeLeaderboardStatus');
const gameTopbar=gameView.querySelector('.topbar');
const gameShell=gameView.querySelector('.shell');
const gameWrap=gameView.querySelector('.game-wrap');

function fitGameViewport(){
  if(gameView.hidden)return;

  const mobile=innerWidth<=720;
  const shellWidth=Math.max(220,gameShell?.clientWidth||0);
  const topbarHeight=gameTopbar?.offsetHeight||56;
  const gap=mobile?8:16;
  const availableW=shellWidth;
  const availableH=Math.max(160,gameView.clientHeight-topbarHeight-gap);
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
  homeView.hidden=true;
  gameView.hidden=false;
  document.body.classList.add('playing-game');
  window.scrollTo(0,0);
  requestAnimationFrame(()=>{
    fitGameViewport();
    setTimeout(fitGameViewport,80);
  });
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
addEventListener('orientationchange',()=>setTimeout(fitGameViewport,100),{passive:true});

function escapeHtml(value){
  return String(value).replace(/[&<>'"]/g,c=>({
    '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'
  }[c]));
}

function rankMarkup(rows){
  if(!rows?.length){
    return '<li><span class="rank-num">01</span><span class="rank-name">No ranked runs yet<small>The board is waiting.</small></span><strong>—</strong></li>';
  }

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

    return {
      name:name||'Player',
      score,
      wave:waveMatch?.[1]||'1',
      distance:distMatch?.[1]||'0'
    };
  });

  homeBoard.innerHTML=rankMarkup(rows);
  homeBoardStatus.textContent=tempStatus.textContent==='Live'?'LIVE':'SYNCED';
}

loadHomeLeaderboard().catch(()=>{
  homeBoardStatus.textContent='OFFLINE';
  homeBoard.innerHTML=rankMarkup([]);
});

const reducedMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reducedMotion&&'IntersectionObserver'in window){
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },{threshold:.12,rootMargin:'40px 0px -20px'});

  document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}else{
  document.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
}
