import React,{useEffect,useState}from'react';
import styled from'@emotion/styled';
import{
  ArrowRight,Gamepad2,Network,Play,RadioTower,Trophy,Users,Volume2,Zap
}from'lucide-react';
import{fetchLeaderboard}from'../leaderboard.js';

const Page=styled('div')({
  '--bg':'#05070d',
  '--panel':'#0d1320',
  '--cyan':'#00eaff',
  '--purple':'#bc2cff',
  '--pink':'#ff168a',
  '--green':'#00ff8c',
  '--yellow':'#ffc400',
  minHeight:'100vh',
  color:'#f6f8ff',
  backgroundColor:'var(--bg)',
  backgroundImage:
    'linear-gradient(rgba(0,234,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,234,255,.03) 1px,transparent 1px),radial-gradient(circle at 18% 4%,rgba(0,234,255,.06),transparent 24%),radial-gradient(circle at 82% 14%,rgba(188,44,255,.06),transparent 26%)',
  backgroundSize:'32px 32px,32px 32px,auto,auto',
  position:'relative',
  overflowX:'hidden',
  '&:before':{
    content:'""',position:'fixed',inset:0,pointerEvents:'none',zIndex:0,
    background:'repeating-linear-gradient(to bottom,rgba(255,255,255,.018) 0,rgba(255,255,255,.018) 1px,transparent 1px,transparent 4px)',
    opacity:.3
  },
  '.max':{width:'min(1180px,calc(100% - 40px))',margin:'0 auto',position:'relative',zIndex:1},
  '.topbar':{
    height:58,display:'flex',alignItems:'center',gap:28,borderBottom:'1px solid rgba(0,234,255,.18)',
    background:'rgba(5,7,13,.95)',position:'sticky',top:0,zIndex:20,backdropFilter:'blur(10px)'
  },
  '.topinner':{display:'flex',alignItems:'center',gap:28,height:'100%'},
  '.brand':{display:'flex',alignItems:'center',gap:8,textDecoration:'none',color:'#fff',minWidth:0},
  '.brandbolt':{color:'var(--cyan)',filter:'drop-shadow(0 0 7px rgba(0,234,255,.65))'},
  '.brandname':{fontSize:'.95rem',fontWeight:1000,letterSpacing:'-.03em',color:'var(--cyan)',textShadow:'0 0 10px rgba(0,234,255,.45)'},
  '.brandsub':{marginLeft:4,fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.48rem',letterSpacing:'.22em',color:'#6d7787'},
  '.nav':{marginLeft:'auto',display:'flex',alignItems:'center',gap:24},
  '.nav a':{display:'flex',alignItems:'center',gap:6,textDecoration:'none',color:'#7f8998',fontSize:'.67rem',fontWeight:900,letterSpacing:'.07em',textTransform:'uppercase'},
  '.nav a:hover':{color:'#fff'},
  '.nav svg':{width:13,height:13},
  '.headerRight':{display:'flex',alignItems:'center',gap:8},
  '.onlineBadge':{display:'flex',alignItems:'center',gap:7,padding:'6px 10px',borderRadius:999,border:'1px solid rgba(0,255,140,.35)',color:'var(--green)',background:'rgba(0,255,140,.05)',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.56rem',fontWeight:900,letterSpacing:'.07em'},
  '.onlineBadge i':{width:6,height:6,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 9px var(--green)'},
  '.sound':{width:32,height:32,border:0,background:'transparent',color:'#788595',display:'grid',placeItems:'center'},
  '.login':{minHeight:32,padding:'0 14px',borderRadius:9,border:'1px solid rgba(0,234,255,.35)',background:'linear-gradient(180deg,#00dcff,#0b8cff)',color:'#04101a',fontSize:'.61rem',fontWeight:1000,letterSpacing:'.1em'},
  '.hero':{padding:'72px 0 54px'},
  '.playersPill':{display:'inline-flex',alignItems:'center',gap:7,padding:'6px 10px',border:'1px solid rgba(0,234,255,.4)',borderRadius:999,color:'var(--green)',background:'rgba(0,12,18,.78)',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.56rem',fontWeight:900,letterSpacing:'.05em'},
  '.playersPill i':{width:6,height:6,borderRadius:'50%',background:'var(--green)',boxShadow:'0 0 10px var(--green)'},
  '.hero h1':{margin:'22px 0 15px',fontFamily:'Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif',fontSize:'clamp(3.2rem,6vw,5.4rem)',lineHeight:.9,letterSpacing:'.01em',textTransform:'uppercase'},
  '.white':{color:'#f7f7f8',textShadow:'3px 3px 0 rgba(0,234,255,.22)'},
  '.cyan':{color:'var(--cyan)',textShadow:'0 0 18px rgba(0,234,255,.48),3px 3px 0 rgba(0,93,143,.45)'},
  '.purple':{color:'var(--purple)',textShadow:'0 0 18px rgba(188,44,255,.45),3px 3px 0 rgba(101,20,143,.45)'},
  '.hero p':{maxWidth:650,margin:0,color:'#9ba8b8',fontSize:'.93rem',lineHeight:1.65},
  '.hero p b':{color:'#f1f4f8'},
  '.heroActions':{display:'flex',gap:12,marginTop:25,flexWrap:'wrap'},
  '.quick,.browse':{minHeight:46,padding:'0 20px',borderRadius:9,display:'inline-flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:'.68rem',fontWeight:1000,letterSpacing:'.08em',textTransform:'uppercase',cursor:'pointer'},
  '.quick':{border:'1px solid rgba(0,234,255,.55)',background:'linear-gradient(90deg,#01e6f6,#1197ff)',color:'#03121d',boxShadow:'0 0 24px rgba(0,234,255,.22)'},
  '.browse':{border:'1px solid rgba(188,44,255,.55)',background:'rgba(10,10,22,.55)',color:'#e2c5ff'},
  '.stats':{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginTop:50},
  '.stat':{minHeight:112,padding:'16px 18px',border:'1px solid rgba(0,234,255,.22)',borderRadius:9,background:'linear-gradient(145deg,rgba(14,21,34,.95),rgba(11,17,28,.96))'},
  '.stat svg':{width:17,height:17,marginBottom:11},
  '.stat strong':{display:'block',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'1.12rem',letterSpacing:'-.03em'},
  '.stat small':{display:'block',marginTop:4,color:'#667384',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.48rem',letterSpacing:'.16em'},
  '.cyanStat svg,.cyanStat strong':{color:'var(--cyan)'},
  '.greenStat svg,.greenStat strong':{color:'var(--green)'},
  '.yellowStat svg,.yellowStat strong':{color:'var(--yellow)'},
  '.purpleStat svg,.purpleStat strong':{color:'var(--purple)'},
  '.section':{padding:'28px 0 72px'},
  '.sectionHead':{display:'flex',alignItems:'end',justifyContent:'space-between',gap:20,marginBottom:22},
  '.sectionEyebrow':{color:'var(--cyan)',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.53rem',letterSpacing:'.2em',fontWeight:900},
  '.section h2':{margin:'7px 0 0',fontFamily:'Impact,Haettenschweiler,"Arial Narrow Bold",sans-serif',fontSize:'2.4rem',letterSpacing:'.02em',textTransform:'uppercase'},
  '.allGames':{display:'inline-flex',alignItems:'center',gap:4,color:'var(--cyan)',textDecoration:'none',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.56rem',fontWeight:900,letterSpacing:'.06em'},
  '.arcadeGrid':{display:'grid',gridTemplateColumns:'minmax(0,1.3fr) minmax(280px,.7fr)',gap:16},
  '.gameCard':{border:'1px solid rgba(0,234,255,.27)',borderRadius:9,overflow:'hidden',background:'linear-gradient(180deg,#101724,#0d1420)',cursor:'pointer',transition:'.18s',minWidth:0},
  '.gameCard:hover':{transform:'translateY(-2px)',borderColor:'rgba(0,234,255,.55)',boxShadow:'0 0 26px rgba(0,234,255,.08)'},
  '.gameVisual':{height:250,position:'relative',overflow:'hidden',background:'radial-gradient(circle at 64% 29%,rgba(0,234,255,.36),transparent 12%),radial-gradient(circle at 32% 40%,rgba(188,44,255,.28),transparent 25%),linear-gradient(145deg,#111d2c,#121126 48%,#071019)'},
  '.gameVisual:before':{content:'""',position:'absolute',inset:0,backgroundImage:'linear-gradient(rgba(0,234,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,234,255,.04) 1px,transparent 1px)',backgroundSize:'24px 24px'},
  '.gameVisual:after':{content:'""',position:'absolute',left:'-10%',right:'-10%',bottom:'-12%',height:'54%',background:'#060b12',clipPath:'polygon(0 70%,13% 52%,23% 68%,38% 30%,52% 71%,64% 39%,76% 63%,88% 27%,100% 67%,100% 100%,0 100%)'},
  '.gameTag':{position:'absolute',left:12,top:12,zIndex:2,padding:'5px 8px',borderRadius:999,border:'1px solid rgba(0,234,255,.45)',background:'rgba(5,10,16,.86)',color:'var(--cyan)',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.46rem',fontWeight:900,letterSpacing:'.07em'},
  '.gameGlyph':{position:'absolute',left:'50%',top:'48%',transform:'translate(-50%,-50%)',zIndex:2,width:110,height:110,borderRadius:28,display:'grid',placeItems:'center',background:'linear-gradient(145deg,rgba(0,234,255,.2),rgba(188,44,255,.16))',border:'1px solid rgba(0,234,255,.32)',boxShadow:'0 0 40px rgba(0,234,255,.12),inset 0 0 25px rgba(188,44,255,.08)'},
  '.gameGlyph svg':{width:49,height:49,color:'var(--cyan)',filter:'drop-shadow(0 0 10px rgba(0,234,255,.4))'},
  '.gameInfo':{padding:'16px 18px 17px'},
  '.gameInfo h3':{margin:0,fontSize:'1rem',color:'var(--cyan)'},
  '.gameInfo p':{margin:'8px 0 13px',color:'#798697',fontSize:'.72rem',lineHeight:1.55,maxWidth:650},
  '.playNow':{display:'inline-flex',alignItems:'center',gap:5,color:'var(--cyan)',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.51rem',fontWeight:900,letterSpacing:'.08em'},
  '.sidePanel':{display:'grid',gap:12,gridTemplateRows:'auto 1fr'},
  '.sideTitle':{padding:'15px 16px',border:'1px solid rgba(188,44,255,.24)',borderRadius:9,background:'linear-gradient(145deg,#0d1320,#0b101a)'},
  '.sideTitle span':{display:'block',color:'var(--purple)',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.49rem',letterSpacing:'.15em'},
  '.sideTitle strong':{display:'block',marginTop:6,fontSize:'1rem'},
  '.rankBox':{border:'1px solid rgba(255,22,138,.22)',borderRadius:9,background:'linear-gradient(180deg,#101522,#0c111c)',padding:14,display:'flex',flexDirection:'column'},
  '.rankBoxHead':{display:'flex',alignItems:'center',justifyContent:'space-between',gap:10,paddingBottom:10,borderBottom:'1px solid rgba(255,255,255,.07)'},
  '.rankBoxHead span':{fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.5rem',letterSpacing:'.12em',color:'#667587'},
  '.rankBoxHead b':{fontSize:'.53rem',color:'var(--pink)'},
  '.rankList':{listStyle:'none',margin:0,padding:0},
  '.rankList li':{display:'grid',gridTemplateColumns:'28px 1fr auto',gap:8,alignItems:'center',padding:'10px 0',borderTop:'1px solid rgba(255,255,255,.05)'},
  '.rankList em':{fontStyle:'normal',color:'#596777',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.52rem'},
  '.rankList div':{display:'flex',flexDirection:'column',minWidth:0},
  '.rankList strong':{fontSize:'.67rem',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'},
  '.rankList small':{marginTop:2,color:'#576575',fontSize:'.49rem'},
  '.rankList b':{color:'var(--cyan)',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.62rem'},
  '.footer':{padding:'29px 0 35px;borderTop:'1px solid rgba(0,234,255,.1)',textAlign:'center',color:'#536171',fontFamily:'ui-monospace,SFMono-Regular,Menlo,monospace',fontSize:'.48rem',letterSpacing:'.14em'},
  '@media(max-width:900px)':{
    '.nav':{gap:14},'.arcadeGrid':{gridTemplateColumns:'1fr'},'.stats':{gridTemplateColumns:'1fr 1fr'},'.gameVisual':{height:220}
  },
  '@media(max-width:680px)':{
    '.max':{width:'calc(100% - 22px)'},'.topbar':{height:54},'.brandsub':{display:'none'},'.nav':{display:'none'},'.headerRight':{marginLeft:'auto'},'.onlineBadge':{display:'none'},'.login':{padding:'0 11px'},'.hero':{padding:'46px 0 38px'},'.hero h1':{fontSize:'clamp(2.8rem,14vw,4.2rem)'},'.hero p':{fontSize:'.85rem'},'.heroActions':{display:'grid',gridTemplateColumns:'1fr'},'.quick,.browse':{width:'100%'},'.stats':{marginTop:32,gap:9},'.stat':{minHeight:98,padding:14},'.section':{paddingBottom:54},'.sectionHead':{alignItems:'flex-start'},'.section h2':{fontSize:'2rem'},'.allGames':{display:'none'},'.gameVisual':{height:195},'.gameGlyph':{width:88,height:88,borderRadius:22},'.rankList li':{gridTemplateColumns:'25px 1fr auto}
  }
});

export default function HomeScreen({onPlay,hidden}){
  const[rows,setRows]=useState([]);
  const[rankStatus,setRankStatus]=useState('SYNCING');

  useEffect(()=>{
    let live=true;
    fetchLeaderboard(5)
      .then(data=>{if(live){setRows(data);setRankStatus(data.length?'LIVE':'READY')}})
      .catch(()=>live&&setRankStatus('OFFLINE'));
    return()=>{live=false};
  },[]);

  return <Page style={{display:hidden?'none':'block'}}>
    <header className="topbar">
      <div className="max topinner">
        <a className="brand" href="#top">
          <Zap className="brandbolt" size={18}/>
          <span className="brandname">KRAUZER</span>
          <span className="brandsub">// ARCADE</span>
        </a>

        <nav className="nav">
          <a href="#games"><Gamepad2/>Games</a>
          <a href="#games"><Users/>Library</a>
          <a href="#ranks"><Trophy/>Ranks</a>
        </nav>

        <div className="headerRight">
          <span className="onlineBadge"><i/> SYSTEM ONLINE</span>
          <button className="sound" aria-label="Sound status"><Volume2 size={15}/></button>
          <button className="login" type="button">LOGIN</button>
        </div>
      </div>
    </header>

    <main id="top">
      <section className="max hero">
        <span className="playersPill"><i/> ARCADE NETWORK ONLINE</span>
        <h1>
          <span className="white">JUST </span>
          <span className="cyan">JOIN </span>
          <span className="white">& </span>
          <span className="purple">PLAY</span>
        </h1>
        <p>
          <b>KRAUZER — Games United In One Interface.</b> A neon arcade hub for original games, global rankings, and future multiplayer systems. Zero launcher ritual. Pure play.
        </p>

        <div className="heroActions">
          <button className="quick" onClick={onPlay}><Play size={14}/>Quick Play</button>
          <a className="browse" href="#games"><Gamepad2 size={14}/>Browse Games</a>
        </div>

        <div className="stats">
          <div className="stat cyanStat"><Gamepad2/><strong>1</strong><small>GAME LIVE</small></div>
          <div className="stat greenStat"><Network/><strong>Online</strong><small>ARCADE NETWORK</small></div>
          <div className="stat yellowStat"><Trophy/><strong>Live</strong><small>SCORE TRACKING</small></div>
          <div className="stat purpleStat"><Zap/><strong>Zero</strong><small>SETUP NEEDED</small></div>
        </div>
      </section>

      <section className="max section" id="games">
        <div className="sectionHead">
          <div>
            <div className="sectionEyebrow">// FEATURED</div>
            <h2>The Arcade</h2>
          </div>
          <a className="allGames" href="#games">ALL GAMES <ChevronRight size={12}/></a>
        </div>

        <div className="arcadeGrid">
          <article className="gameCard" onClick={onPlay} tabIndex={0}>
            <div className="gameVisual">
              <span className="gameTag">ARCADE</span>
              <div className="gameGlyph"><Gamepad2/></div>
            </div>
            <div className="gameInfo">
              <h3>Sky Crystal Run</h3>
              <p>Fly fast, chain crystals, survive escalating waves, grab power-ups, and push your score into the global ranks.</p>
              <span className="playNow">PLAY NOW <Play size={10}/></span>
            </div>
          </article>

          <aside className="sidePanel" id="ranks">
            <div className="sideTitle">
              <span>// GLOBAL RANKS</span>
              <strong>Top Players</strong>
            </div>
            <div className="rankBox">
              <div className="rankBoxHead">
                <span>SKY CRYSTAL RUN</span>
                <b>{rankStatus}</b>
              </div>
              <ol className="rankList">
                {rows.length?rows.map((r,i)=>(
                  <li key={r.player_name+'-'+i}>
                    <em>{String(i+1).padStart(2,'0')}</em>
                    <div><strong>{r.player_name}</strong><small>Wave {r.wave} · {r.distance}m</small></div>
                    <b>{r.score}</b>
                  </li>
                )):<li><em>01</em><div><strong>No ranked runs yet</strong><small>The board is waiting.</small></div><b>—</b></li>}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </main>

    <footer className="footer">
      <div className="max">KRAUZER.GAMES // GAME PLATFORM INTERFACE // © 2026</div>
    </footer>
  </Page>;
}