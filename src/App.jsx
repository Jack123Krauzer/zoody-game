import React, { useState } from 'react';
import { Global, css } from '@emotion/react';
import HomeScreen from './HomeScreen.jsx';
import GameScreen from './GameScreen.jsx';

const globalStyles=css`
  :root{
    font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
    color:#f4f8ff;
    background:#05070b;
    font-synthesis:none;
    text-rendering:optimizeLegibility;
  }
  *{box-sizing:border-box}
  html{scroll-behavior:smooth;background:#05070b}
  body{margin:0;min-width:320px;min-height:100vh;background:#05070b;color:#f4f8ff}
  button,input{font:inherit}
  button,a{-webkit-tap-highlight-color:transparent}
  ::selection{background:rgba(89,243,255,.24);color:#fff}
  @media(prefers-reduced-motion:reduce){
    html{scroll-behavior:auto}
    *,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important}
  }
`;

export default function App(){
  const [view,setView]=useState('home');
  const gameActive=view==='game';

  const openGame=()=>{
    setView('game');
    window.scrollTo(0,0);
  };

  const openHome=()=>{
    setView('home');
    requestAnimationFrame(()=>window.scrollTo(0,0));
  };

  return (
    <>
      <Global styles={globalStyles}/>
      <HomeScreen hidden={gameActive} onPlay={openGame}/>
      <GameScreen active={gameActive} onBack={openHome}/>
    </>
  );
}
