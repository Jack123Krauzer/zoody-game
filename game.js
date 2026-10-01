const canvas=document.getElementById('game');const ctx=canvas.getContext('2d');
const scoreEl=document.getElementById('score'),healthEl=document.getElementById('health'),bestEl=document.getElementById('best');
const overlay=document.getElementById('overlay'),startBtn=document.getElementById('startBtn');
const W=canvas.width,H=canvas.height;let running=false,last=0,score=0,best=Number(localStorage.getItem('zoody-best')||0),health=3,time=0,spawnCrystal=0,spawnEnemy=0;bestEl.textContent=`🏆 ${best}`;
const keys={};const player={x:160,y:H/2,vx:0,vy:0,r:28,speed:340,inv:0};let crystals=[],enemies=[],particles=[],stars=[];
for(let i=0;i<90;i++)stars.push({x:Math.random()*W,y:Math.random()*H,s:Math.random()*2+0.5,p:Math.random()*W});
addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault()});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
let pointer=false;canvas.addEventListener('pointerdown',e=>{pointer=true;canvas.setPointerCapture(e.pointerId);movePointer(e)});canvas.addEventListener('pointermove',e=>{if(pointer)movePointer(e)});canvas.addEventListener('pointerup',()=>pointer=false);
function movePointer(e){const r=canvas.getBoundingClientRect();player.x=(e.clientX-r.left)*W/r.width;player.y=(e.clientY-r.top)*H/r.height}
function reset(){score=0;health=3;time=0;spawnCrystal=0;spawnEnemy=0;crystals=[];enemies=[];particles=[];Object.assign(player,{x:160,y:H/2,vx:0,vy:0,inv:0});updateHud()}
function start(){reset();running=true;overlay.classList.remove('visible');last=performance.now();requestAnimationFrame(loop)}startBtn.onclick=start;
function updateHud(){scoreEl.textContent=`💎 ${score}`;healthEl.textContent='❤️'.repeat(health)+'🖤'.repeat(3-health);bestEl.textContent=`🏆 ${best}`}
function rand(a,b){return a+Math.random()*(b-a)}function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function burst(x,y,char,count=8){for(let i=0;i<count;i++)particles.push({x,y,vx:rand(-130,130),vy:rand(-130,130),life:rand(.35,.8),char})}
function hit(){if(player.inv>0)return;health--;player.inv=1.2;burst(player.x,player.y,'🔥',6);updateHud();if(health<=0)gameOver()}
function gameOver(){running=false;if(score>best){best=score;localStorage.setItem('zoody-best',best)}bestEl.textContent=`🏆 ${best}`;overlay.querySelector('h1').textContent='Adventure Over';overlay.querySelector('p').textContent=`Zoody collected ${score} crystal${score===1?'':'s'}. The sky remains dramatically unsafe.`;startBtn.textContent='Fly Again';overlay.classList.add('visible')}
function update(dt){time+=dt;player.inv=Math.max(0,player.inv-dt);let dx=0,dy=0;if(keys.a||keys.arrowleft)dx--;if(keys.d||keys.arrowright)dx++;if(keys.w||keys.arrowup)dy--;if(keys.s||keys.arrowdown)dy++;if(dx||dy){const l=Math.hypot(dx,dy);player.x+=dx/l*player.speed*dt;player.y+=dy/l*player.speed*dt}player.x=clamp(player.x,35,W-35);player.y=clamp(player.y,35,H-35);
spawnCrystal-=dt;if(spawnCrystal<=0){crystals.push({x:W+30,y:rand(65,H-65),r:17,spin:rand(0,6)});spawnCrystal=rand(.75,1.35)}
spawnEnemy-=dt;if(spawnEnemy<=0){enemies.push({x:W+50,y:rand(55,H-55),r:24,v:rand(220,310)+Math.min(time*4,130),w:rand(0,6)});spawnEnemy=rand(.9,1.45)}
for(const c of crystals){c.x-=190*dt;c.spin+=dt*4}for(const e of enemies){e.x-=e.v*dt;e.y+=Math.sin(time*3+e.w)*40*dt}crystals=crystals.filter(c=>{if(Math.hypot(c.x-player.x,c.y-player.y)<c.r+player.r-6){score++;burst(c.x,c.y,'✨',7);updateHud();return false}return c.x>-40});enemies=enemies.filter(e=>{if(Math.hypot(e.x-player.x,e.y-player.y)<e.r+player.r-5){hit();return false}return e.x>-70});for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt}particles=particles.filter(p=>p.life>0)}
function roundRect(x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.lineTo(x+w-r,y);
  ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);
  ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);
  ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);
  ctx.quadraticCurveTo(x,y,x+r,y);
  ctx.closePath();
  ctx.fill();
}
function draw(){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#215f94');g.addColorStop(.55,'#123b61');g.addColorStop(1,'#071727');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(const s of stars){const x=(s.x-time*25*s.s+s.p)%W;ctx.globalAlpha=.25+.15*s.s;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x<0?x+W:x,s.y,s.s,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
ctx.fillStyle='#ffffff12';for(let i=0;i<6;i++){const x=((i*210-time*70)%1300)-150;ctx.beginPath();ctx.ellipse(x,90+i*68,120,24,0,0,Math.PI*2);ctx.fill()}
for(const c of crystals){ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.spin);ctx.shadowBlur=22;ctx.shadowColor='#67e8ff';ctx.font='34px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('💎',0,0);ctx.restore()}
for(const e of enemies){ctx.font='42px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('☄️',e.x,e.y)}
ctx.save();ctx.globalAlpha=player.inv>0&&Math.floor(player.inv*12)%2?0.35:1;ctx.translate(player.x,player.y);ctx.shadowBlur=24;ctx.shadowColor='#9cff8a';ctx.font='54px serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.scale(-1,1);ctx.fillText('🐉',0,0);ctx.restore();
for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.font='18px serif';ctx.textAlign='center';ctx.fillText(p.char,p.x,p.y)}ctx.globalAlpha=1;
ctx.fillStyle='#07111e99';roundRect(18,18,235,38,18);ctx.fillStyle='#d9f6ff';ctx.font='700 17px system-ui';ctx.textAlign='left';ctx.fillText(`Distance  ${Math.floor(time*52)} m`,34,44)}
function loop(now){if(!running)return;const dt=Math.min((now-last)/1000,.033);last=now;update(dt);draw();requestAnimationFrame(loop)}draw();