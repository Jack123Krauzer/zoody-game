const clamp = (v,a,b) => Math.max(a, Math.min(b,v));

function rounded(ctx,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);
  ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);
  ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath();
}

function palette(wave){
  const list=[
    ['#50b8ff','#1764b5','#063461'],
    ['#68d4ff','#3971d5','#10265a'],
    ['#7256d9','#293d92','#071d49'],
    ['#f07a65','#8d3d68','#251e52'],
    ['#53d9c0','#2077a8','#102b63'],
    ['#7189ff','#3f43a1','#17133d'],
    ['#b25ee8','#542d9b','#171237']
  ];
  return list[(wave-1)%list.length];
}

function drawBackground(ctx,s){
  const [top,mid,bottom]=palette(s.wave);
  const g=ctx.createLinearGradient(0,0,0,s.H);
  g.addColorStop(0,top);g.addColorStop(.52,mid);g.addColorStop(1,bottom);
  ctx.fillStyle=g;ctx.fillRect(0,0,s.W,s.H);

  const glow=ctx.createRadialGradient(s.W*.78,s.H*.16,5,s.W*.78,s.H*.16,190);
  glow.addColorStop(0,s.bossTimer>0?'#ffb36a88':'#ffffff70');
  glow.addColorStop(1,'#ffffff00');
  ctx.fillStyle=glow;ctx.fillRect(0,0,s.W,s.H);

  ctx.fillStyle='#fff';
  for(const star of s.stars){
    ctx.globalAlpha=star.alpha;
    ctx.beginPath();ctx.arc(star.x,star.y,star.s,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  for(const c of s.clouds){
    ctx.fillStyle=`rgba(255,255,255,${c.alpha})`;
    ctx.beginPath();
    ctx.ellipse(c.x,c.y,c.w*.5,c.h,0,0,Math.PI*2);
    ctx.ellipse(c.x+c.w*.28,c.y+6,c.w*.31,c.h*.85,0,0,Math.PI*2);
    ctx.ellipse(c.x-c.w*.3,c.y+9,c.w*.27,c.h*.72,0,0,Math.PI*2);
    ctx.fill();
  }

  for(const island of s.islands){
    ctx.fillStyle='rgba(5,28,52,.48)';
    ctx.beginPath();ctx.ellipse(island.x,island.y,island.w*.52,island.h*.5,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(55,142,123,.34)';
    ctx.beginPath();ctx.ellipse(island.x,island.y-island.h*.18,island.w*.4,island.h*.24,0,0,Math.PI*2);ctx.fill();
  }

  if(s.bossTimer>0){
    ctx.fillStyle=`rgba(255,72,32,${.025+Math.sin(s.time*5)*.012})`;
    ctx.fillRect(0,0,s.W,s.H);
  }
}

function drawTrail(ctx,s){
  for(const t of s.player.trail){
    ctx.globalAlpha=clamp(t.life*1.7,0,1);
    ctx.fillStyle=s.shieldTimer>0?'#ffe97a':'#8dffe5';
    ctx.beginPath();ctx.arc(t.x,t.y,t.r*t.life*2,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawCrystal(ctx,c){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.spin);
  ctx.shadowColor='#6ff6ff';ctx.shadowBlur=22;
  ctx.beginPath();
  ctx.moveTo(0,-c.r);ctx.lineTo(c.r*.78,-c.r*.15);ctx.lineTo(c.r*.5,c.r);
  ctx.lineTo(-c.r*.5,c.r);ctx.lineTo(-c.r*.78,-c.r*.15);ctx.closePath();
  const g=ctx.createLinearGradient(0,-c.r,0,c.r);
  g.addColorStop(0,'#d0ffff');g.addColorStop(.42,'#55edff');g.addColorStop(1,'#1784ff');
  ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#ffffffda';ctx.lineWidth=1.8;ctx.stroke();ctx.restore();
}

function drawFireball(ctx,e){
  ctx.save();ctx.translate(e.x,e.y);ctx.shadowColor='#ff6d3d';ctx.shadowBlur=22;
  const tail=ctx.createLinearGradient(-46,0,10,0);
  tail.addColorStop(0,'#ff5a1f00');tail.addColorStop(1,'#ffbf46cc');
  ctx.fillStyle=tail;ctx.beginPath();ctx.moveTo(-50,0);ctx.lineTo(-8,-14);ctx.lineTo(8,0);ctx.lineTo(-8,14);ctx.closePath();ctx.fill();
  const g=ctx.createRadialGradient(-5,-7,2,0,0,e.r);
  g.addColorStop(0,'#fff4b8');g.addColorStop(.28,'#ffb447');g.addColorStop(.72,'#ff5b2d');g.addColorStop(1,'#7e1e13');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawShard(ctx,e){
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(-.6+Math.sin(e.phase)*.08);
  ctx.shadowColor='#c2e6ff';ctx.shadowBlur=13;ctx.fillStyle='#d9efff';
  ctx.beginPath();ctx.moveTo(-28,0);ctx.lineTo(13,-10);ctx.lineTo(22,0);ctx.lineTo(13,10);ctx.closePath();ctx.fill();
  ctx.fillStyle='#6aa8de';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(15,0);ctx.lineTo(0,5);ctx.closePath();ctx.fill();ctx.restore();
}

function drawBoss(ctx,e){
  ctx.save();ctx.translate(e.x,e.y);ctx.shadowColor='#ff452f';ctx.shadowBlur=34;
  const g=ctx.createRadialGradient(-12,-16,6,0,0,e.r);
  g.addColorStop(0,'#fff0a5');g.addColorStop(.25,'#ff9c3a');g.addColorStop(.62,'#d63b24');g.addColorStop(1,'#50131c');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,e.r,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#ffdb7b';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,e.r*.66,e.phase,e.phase+Math.PI*1.25);ctx.stroke();
  ctx.fillStyle='#35101a';
  for(let i=0;i<5;i++){
    const a=i*Math.PI*.4+e.phase*.2;
    ctx.beginPath();ctx.arc(Math.cos(a)*e.r*.52,Math.sin(a)*e.r*.52,6,0,Math.PI*2);ctx.fill();
  }
  ctx.restore();
}

function drawPowerup(ctx,p){
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spin);
  const pulse=1+Math.sin(p.pulse)*.08;ctx.scale(pulse,pulse);
  const color=p.type==='shield'?'#ffe46d':p.type==='blast'?'#ff8f57':'#ff78a8';
  ctx.shadowColor=color;ctx.shadowBlur=24;ctx.fillStyle='#071a2c';
  ctx.beginPath();ctx.arc(0,0,p.r+6,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle=color;ctx.lineWidth=4;ctx.stroke();ctx.rotate(-p.spin);
  ctx.fillStyle=color;ctx.font='900 22px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(p.type==='shield'?'S':p.type==='blast'?'✦':'+',0,1);ctx.restore();
}

function drawZoody(ctx,s){
  const p=s.player;
  ctx.save();ctx.translate(p.x,p.y);
  if(p.inv>0&&Math.floor(p.inv*13)%2)ctx.globalAlpha=.45;
  const flap=Math.sin(p.wing)*8;
  ctx.shadowColor=s.shieldTimer>0?'#ffe66d':'#54ff82';ctx.shadowBlur=s.shieldTimer>0?28:15;

  ctx.strokeStyle='#258f48';ctx.lineWidth=11;ctx.lineCap='round';
  ctx.beginPath();ctx.moveTo(-28,6);ctx.quadraticCurveTo(-50,12,-62,-3);ctx.stroke();
  ctx.fillStyle='#9cff78';ctx.beginPath();ctx.moveTo(-63,-4);ctx.lineTo(-79,-14);ctx.lineTo(-73,5);ctx.closePath();ctx.fill();

  ctx.fillStyle='#238f55';ctx.beginPath();ctx.moveTo(-9,-10);ctx.lineTo(-39,-37-flap);ctx.lineTo(-25,-4);ctx.closePath();ctx.fill();
  ctx.fillStyle='#58e878';ctx.beginPath();ctx.moveTo(-5,-6);ctx.lineTo(-28,-28-flap*.65);ctx.lineTo(-18,0);ctx.closePath();ctx.fill();

  const body=ctx.createLinearGradient(-28,-20,25,22);
  body.addColorStop(0,'#64f06d');body.addColorStop(1,'#21994b');
  ctx.fillStyle=body;ctx.beginPath();ctx.ellipse(-4,3,34,24,-.04,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#b5ff89';ctx.beginPath();ctx.ellipse(5,10,18,10,.08,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#75f27a';ctx.beginPath();ctx.arc(23,-10,18,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#8aff85';ctx.beginPath();ctx.ellipse(34,-5,14,9,0,0,Math.PI*2);ctx.fill();

  ctx.fillStyle='#d8ffab';
  ctx.beginPath();ctx.moveTo(14,-25);ctx.lineTo(17,-41);ctx.lineTo(23,-24);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(27,-25);ctx.lineTo(34,-39);ctx.lineTo(35,-20);ctx.closePath();ctx.fill();

  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(28,-14,5.4,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#102e1b';ctx.beginPath();ctx.arc(30,-14,2.7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#1f6d38';ctx.beginPath();ctx.arc(39,-7,1.8,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#1b6635';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(33,-2,8,.15,1.7);ctx.stroke();

  ctx.fillStyle='#34b85b';ctx.beginPath();ctx.moveTo(-2,5);ctx.lineTo(-29,31+flap);ctx.lineTo(7,19);ctx.closePath();ctx.fill();
  ctx.fillStyle='#71ef7f';ctx.beginPath();ctx.moveTo(2,7);ctx.lineTo(-18,25+flap*.7);ctx.lineTo(9,16);ctx.closePath();ctx.fill();

  if(s.shieldTimer>0){
    ctx.strokeStyle='#ffe66d';ctx.lineWidth=4;ctx.beginPath();
    ctx.arc(-2,0,49+Math.sin(s.time*6)*2,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

function drawParticles(ctx,s){
  for(const p of s.particles){
    ctx.globalAlpha=clamp(p.life*1.7,0,1);ctx.fillStyle=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;
}

function drawHud(ctx,s){
  ctx.fillStyle='#061729c9';rounded(ctx,16,16,238,42,18);ctx.fill();
  ctx.fillStyle='#eefaff';ctx.font='800 17px system-ui';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillText(`Distance  ${Math.floor(s.distance)} m`,33,43);

  if(s.shieldTimer>0){
    ctx.fillStyle='#061729c9';rounded(ctx,s.W-192,16,176,42,18);ctx.fill();
    ctx.fillStyle='#ffe66d';ctx.fillText(`Shield  ${s.shieldTimer.toFixed(1)}s`,s.W-173,43);
  } else if(s.bossTimer>0){
    ctx.fillStyle='#38131ed8';rounded(ctx,s.W-192,16,176,42,18);ctx.fill();
    ctx.fillStyle='#ffc2ae';ctx.fillText(`Boss  ${s.bossTimer.toFixed(1)}s`,s.W-173,43);
  }

  if(s.combo>1){
    const progress=clamp(s.comboTimer/1.55,0,1);
    ctx.fillStyle='#061729c9';rounded(ctx,16,67,176,29,13);ctx.fill();
    ctx.fillStyle='#69efff';ctx.fillRect(25,86,158*progress,3);
    ctx.fillStyle='#fff';ctx.font='750 13px system-ui';ctx.fillText(`COMBO x${s.combo}`,28,84);
  }
}

export function drawGame(ctx,s){
  ctx.save();
  if(s.screenShake>0){
    ctx.translate((Math.random()-.5)*16*s.screenShake*2,(Math.random()-.5)*14*s.screenShake*2);
  }

  drawBackground(ctx,s);
  drawTrail(ctx,s);
  for(const c of s.crystals)drawCrystal(ctx,c);
  for(const p of s.powerups)drawPowerup(ctx,p);
  for(const e of s.enemies){
    if(e.kind==='boss')drawBoss(ctx,e);
    else if(e.kind==='shard')drawShard(ctx,e);
    else drawFireball(ctx,e);
  }
  drawZoody(ctx,s);
  drawParticles(ctx,s);
  drawHud(ctx,s);
  ctx.restore();
}
