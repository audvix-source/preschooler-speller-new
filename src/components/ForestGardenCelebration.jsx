import React, { useEffect, useRef, useState } from 'react';
import './ForestGardenCelebration.css';

function ForestGardenCelebration({ score, total, onComplete, speak }) {
  const [showCard, setShowCard]       = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  const getPerformance = () => {
    if (accuracy === 100) return { emoji: '👑', text: 'PERFECT!',   color: '#4CAF50' };
    if (accuracy >= 80)  return { emoji: '🌟', text: 'EXCELLENT!',  color: '#4CAF50' };
    if (accuracy >= 60)  return { emoji: '⭐', text: 'GREAT JOB!',  color: '#2196F3' };
    return                      { emoji: '💪', text: 'KEEP GOING!', color: '#FF9800' };
  };

  const perf = getPerformance();

  useEffect(() => {
    window.speechSynthesis.cancel();

    const narrationTimer = setTimeout(() => {
      let message = "Good try! Keep practicing!";
      if (accuracy === 100) message = "Perfect! You got them all!";
      else if (accuracy >= 80) message = "Excellent! Almost perfect!";
      else if (accuracy >= 60) message = "Great job! You're getting there!";
      if (speak) speak(message);
    }, 400);

    const cardTimer    = setTimeout(() => setShowCard(true),    1800);
    const buttonsTimer = setTimeout(() => setShowButtons(true), 3200);

    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(narrationTimer);
      clearTimeout(cardTimer);
      clearTimeout(buttonsTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rays = [
    {angle:-72,w:14,h:380,delay:0},   {angle:-62,w:22,h:420,delay:0.2},
    {angle:-52,w:32,h:460,delay:0.4}, {angle:-42,w:44,h:500,delay:0.6},
    {angle:-32,w:56,h:540,delay:0.8}, {angle:-22,w:66,h:570,delay:1.0},
    {angle:-12,w:72,h:590,delay:1.2}, {angle:-3, w:68,h:580,delay:1.1},
    {angle:8,  w:58,h:550,delay:0.9}, {angle:18, w:44,h:510,delay:0.7},
    {angle:28, w:32,h:460,delay:0.5}, {angle:38, w:20,h:400,delay:0.3},
  ];

  const cloudConfigs = [
    {top:2, dur:16,delay:0,   clouds:[{t:0,l:0,s:40},{t:-12,l:32,s:48},{t:6,l:60,s:36},{t:-6,l:88,s:42}]},
    {top:6, dur:22,delay:-6,  clouds:[{t:0,l:0,s:34},{t:-8,l:26,s:42},{t:4,l:52,s:32}]},
    {top:1, dur:18,delay:-12, clouds:[{t:0,l:0,s:44},{t:-10,l:34,s:50},{t:6,l:66,s:40},{t:-4,l:96,s:36}]},
    {top:10,dur:25,delay:-4,  clouds:[{t:0,l:0,s:36},{t:-10,l:28,s:44},{t:4,l:56,s:34}]},
    {top:4, dur:20,delay:-16, clouds:[{t:0,l:0,s:38},{t:-8,l:30,s:46},{t:6,l:58,s:36},{t:-4,l:84,s:40}]},
    {top:14,dur:28,delay:-8,  clouds:[{t:0,l:0,s:32},{t:-8,l:24,s:40},{t:4,l:48,s:30},{t:-6,l:70,s:36}]},
    {top:8, dur:19,delay:-20, clouds:[{t:0,l:0,s:42},{t:-12,l:36,s:50},{t:8,l:70,s:38}]},
    {top:17,dur:23,delay:-10, clouds:[{t:0,l:0,s:30},{t:-6,l:22,s:38},{t:4,l:44,s:28},{t:-8,l:64,s:34}]},
    {top:3, dur:26,delay:-3,  clouds:[{t:0,l:0,s:36},{t:-10,l:28,s:44},{t:6,l:54,s:34},{t:-4,l:78,s:38}]},
    {top:12,dur:21,delay:-14, clouds:[{t:0,l:0,s:40},{t:-8,l:30,s:48},{t:4,l:60,s:36}]},
  ];

  const trees = [
    {emoji:'🌳',left:2, size:90,delay:0},
    {emoji:'🌲',left:12,size:75,delay:0.4},
    {emoji:'🌳',left:72,size:95,delay:0.2},
    {emoji:'🌲',left:82,size:70,delay:0.6},
    {emoji:'🌴',left:45,size:65,delay:0.3},
  ];

  const bushes = ['🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀','🌿','🍀'];

  const leafEmojis = ['🌱','🌾','🌿','🍃','🌱','🌾','🌿','🍃'];
  const leafLayers = [];
  for(let layer = 0; layer < 5; layer++) {
    for(let i = 0; i < 32; i++) {
      leafLayers.push({ layer, i, emoji: leafEmojis[(i+layer) % leafEmojis.length] });
    }
  }

  const flowers = [
    {e:'🌸',b:115,l:5}, {e:'🌺',b:125,l:10},{e:'🌼',b:110,l:18},{e:'🌷',b:132,l:25},
    {e:'🌻',b:118,l:32},{e:'🌸',b:128,l:38},{e:'💐',b:115,l:46},{e:'🌹',b:135,l:53},
    {e:'🪷',b:120,l:60},{e:'🌺',b:112,l:67},{e:'🌼',b:130,l:74},{e:'🌸',b:116,l:80},
    {e:'🌷',b:125,l:87},{e:'🌻',b:113,l:93},{e:'🌸',b:138,l:14},{e:'🌺',b:108,l:43},
    {e:'🌼',b:122,l:70},{e:'🌷',b:135,l:22},{e:'🌻',b:117,l:56},{e:'💐',b:128,l:78},
  ];

  const butterflies = [
    {b:150,l:5}, {b:160,l:10},{b:145,l:18},{b:168,l:25},{b:153,l:32},
    {b:163,l:38},{b:150,l:46},{b:170,l:53},{b:155,l:60},{b:147,l:67},
    {b:165,l:74},{b:151,l:80},{b:160,l:87},{b:148,l:93},{b:173,l:14},
    {b:143,l:43},{b:157,l:70},{b:170,l:22},{b:152,l:56},{b:163,l:78},
  ];

  const bees = [
    {b:140,l:7}, {b:155,l:15},{b:138,l:28},{b:162,l:35},{b:145,l:50},
    {b:158,l:58},{b:142,l:65},{b:165,l:72},{b:150,l:83},{b:135,l:90},
    {b:160,l:2}, {b:148,l:42},
  ];

  const dragonflies = [
    {b:175,l:12},{b:168,l:30},{b:182,l:48},
    {b:165,l:65},{b:178,l:82},{b:172,l:20},{b:185,l:55},
  ];

  // Stable random values using index as seed
  const rng = (seed, min, max) => {
    const x = Math.sin(seed + 1) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  return (
    <div className="fgc__scene">

      {/* Sun */}
      <div className="fgc__sun">☀️</div>

      {/* Sun rays */}
      {rays.map((r, i) => (
        <div key={i} className="fgc__ray"
          style={{
            width: r.w + 'px', height: r.h + 'px',
            transform: `rotate(${r.angle}deg)`,
            animationDuration: (2.2 + i * 0.25) + 's',
            animationDelay: r.delay + 's',
          }}
        />
      ))}

      {/* Clouds */}
      {cloudConfigs.map((g, gi) => (
        <div key={gi} className="fgc__cloud-group"
          style={{ top: g.top + '%', animationDuration: g.dur + 's', animationDelay: g.delay + 's' }}
        >
          {g.clouds.map((c, ci) => (
            <span key={ci} style={{ top: c.t + 'px', left: c.l + 'px', fontSize: c.s + 'px' }}>☁️</span>
          ))}
        </div>
      ))}

      {/* Trees */}
      {trees.map((t, i) => (
        <div key={i} className="fgc__tree"
          style={{
            left: t.left + '%', fontSize: t.size + 'px',
            animationDelay: t.delay + 's',
            animationDuration: (2.5 + rng(i, 0, 1)) + 's',
          }}
        >{t.emoji}</div>
      ))}

      {/* Bushes */}
      {bushes.map((b, i) => (
        <div key={i} className="fgc__bush"
          style={{
            bottom: (60 + (i%3)*18 + rng(i,0,20)) + 'px',
            left: (i*4.1-1) + '%',
            fontSize: (28 + rng(i,0,22)) + 'px',
            animationDelay: rng(i,0,2) + 's',
            animationDuration: (1.8 + rng(i+10,0,1.5)) + 's',
            transform: `rotate(${-15 + rng(i+20,0,30)}deg)`,
          }}
        >{b}</div>
      ))}

      {/* Leaf layers */}
      {leafLayers.map(({layer, i, emoji}, idx) => (
        <div key={idx} className="fgc__leaf"
          style={{
            left: (i*3.2 + (layer%2)*1.6) + '%',
            bottom: (layer*22 + rng(idx,0,14)) + 'px',
            fontSize: (14 + layer*3 + rng(idx+5,0,10)) + 'px',
            animationDelay: rng(idx,0,2) + 's',
            animationDuration: (1.5 + rng(idx+15,0,1.5)) + 's',
            zIndex: 3 + layer,
            transform: `rotate(${-20 + rng(idx+30,0,40)}deg)`,
          }}
        >{emoji}</div>
      ))}

      {/* Flowers */}
      {flowers.map((f, i) => (
        <div key={i} className="fgc__flower"
          style={{
            bottom: f.b + 'px', left: f.l + '%',
            fontSize: (22 + rng(i,0,18)) + 'px',
            animationDelay: rng(i,0,2) + 's',
            animationDuration: (1.8 + rng(i+5,0,1.5)) + 's',
          }}
        >{f.e}</div>
      ))}

      {/* Butterflies */}
      {butterflies.map((p, i) => (
        <div key={i} className="fgc__butterfly"
          style={{
            bottom: p.b + 'px', left: p.l + '%',
            fontSize: (16 + rng(i,0,14)) + 'px',
            animationDuration: (3 + rng(i,0,4)) + 's',
            animationDelay: -rng(i+3,0,3) + 's',
          }}
        >🦋</div>
      ))}

      {/* Bees */}
      {bees.map((p, i) => (
        <div key={i} className="fgc__bee"
          style={{
            bottom: p.b + 'px', left: p.l + '%',
            fontSize: (14 + rng(i,0,10)) + 'px',
            animationDuration: (2 + rng(i,0,2.5)) + 's',
            animationDelay: -rng(i+2,0,2) + 's',
          }}
        >🐝</div>
      ))}

      {/* Dragonflies */}
      {dragonflies.map((p, i) => (
        <div key={i} className="fgc__dragonfly"
          style={{
            bottom: p.b + 'px', left: p.l + '%',
            fontSize: (16 + rng(i,0,12)) + 'px',
            animationDuration: (3 + rng(i,0,3)) + 's',
            animationDelay: -rng(i+1,0,3) + 's',
          }}
        >🪲</div>
      ))}

      {/* Score card */}
      <div className="fgc__content">
        {showCard && (
          <div className="fgc__card">
            <div className="fgc__card-emoji">{perf.emoji}</div>
            <div className="fgc__card-message" style={{ color: perf.color }}>{perf.text}</div>
            <div className="fgc__card-numbers">
              <span className="fgc__score-val">{score}</span>
              <span className="fgc__score-sep">/</span>
              <span className="fgc__score-tot">{total}</span>
            </div>
            <div className="fgc__card-accuracy">{accuracy}% Accuracy</div>
          </div>
        )}
        <div className={`fgc__buttons ${showButtons ? 'fgc__buttons--visible' : ''}`}>
          <button className="fgc__btn fgc__btn--again"  onClick={() => onComplete && onComplete('again')}>🔁 Try Again</button>
          <button className="fgc__btn fgc__btn--change" onClick={() => onComplete && onComplete('change')}>🔀 Change Quiz</button>
          <button className="fgc__btn fgc__btn--menu"   onClick={() => onComplete && onComplete('menu')}>🏠 Main Menu</button>
        </div>
      </div>
    </div>
  );
}

export default ForestGardenCelebration;