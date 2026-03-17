import React, { useState, useEffect, useRef } from 'react';
import './CelebrationScreen.css';

// ── Element sets ──────────────────────────────────────────────────────────────
const FLOWERS   = ['🌸','🌺','🌼','🌷','💐','🌹','🪷','🌻'];
const FRUITS    = ['🍎','🍊','🍋','🍇','🍓','🍒','🍑','🍍','🥭','🍌','🍉','🍈'];
const LEAVES    = ['🍃','🍂','🍁','🌿','☘️','🌱'];
const POPPERS   = ['🎉','🎊','🎆','🎇','✨','🌟','💥','🎈'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

// ── Quiz type config ──────────────────────────────────────────────────────────
const QUIZ_TYPE_CONFIG = {
  'mixed':     { icon: '✏️',  label: 'Mixed',       color: '#42A5F5', bg: 'linear-gradient(135deg,#42A5F5,#1976D2)' },
  'mc-only':   { icon: '🖼️',  label: 'Picture Quiz', color: '#66BB6A', bg: 'linear-gradient(135deg,#66BB6A,#388E3C)' },
  'listening': { icon: '🔊',  label: 'Listening',    color: '#FF4081', bg: 'linear-gradient(135deg,#FF4081,#C2185B)' },
  'reading':   { icon: '📖',  label: 'Reading',      color: '#AB47BC', bg: 'linear-gradient(135deg,#AB47BC,#7B1FA2)' },
};

// ── Performance message ───────────────────────────────────────────────────────
function getPerformance(accuracy) {
  if (accuracy === 100) return { emoji: '👑', text: 'PERFECT!',   color: '#FFD700' };
  if (accuracy >= 80)  return { emoji: '🌟', text: 'EXCELLENT!',  color: '#4CAF50' };
  if (accuracy >= 60)  return { emoji: '⭐', text: 'GREAT JOB!',  color: '#2196F3' };
  return                      { emoji: '💪', text: 'KEEP GOING!', color: '#FF9800' };
}

// ── Generic falling piece ─────────────────────────────────────────────────────
function FallingPiece({ emoji, left, size, duration, delay, swayDir }) {
  return (
    <div
      className={`cs__piece cs__piece--${swayDir}`}
      style={{ left:`${left}%`, fontSize:`${size}px`,
               animationDuration:`${duration}s`, animationDelay:`${delay}s` }}
    >{emoji}</div>
  );
}

// ── Snow particle ─────────────────────────────────────────────────────────────
function SnowParticle({ left, size, duration, delay, burst }) {
  return (
    <div
      className={burst ? 'cs__snow-burst' : 'cs__snow-gentle'}
      style={{ left:`${left}%`, fontSize:`${size}px`,
               animationDuration:`${duration}s`, animationDelay:`${delay}s` }}
    >❄️</div>
  );
}

// ── Teddy bear (arc trajectory) ───────────────────────────────────────────────
function TeddyBear({ index, total, delay, size, landX }) {
  // Each bear gets a unique CSS var for landing position
  return (
    <div
      className="cs__bear"
      style={{
        '--land-x': `${landX}px`,
        '--bear-size': `${size}px`,
        animationDelay: `${delay}s`,
        fontSize: `${size}px`,
      }}
    >🧸</div>
  );
}

// ── Party popper (falls from above) ──────────────────────────────────────────
function PartyPopper({ left, size, duration, delay }) {
  return (
    <div
      className="cs__popper"
      style={{ left:`${left}%`, fontSize:`${size}px`,
               animationDuration:`${duration}s`, animationDelay:`${delay}s` }}
    >{POPPERS[Math.floor(Math.random() * POPPERS.length)]}</div>
  );
}

// ── Layer builder ─────────────────────────────────────────────────────────────
function buildLayer(emojis, count, sMin, sMax, dMin, dMax) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    emoji: emojis[i % emojis.length],
    left: randomBetween(3, 95),
    size: randomBetween(sMin, sMax),
    duration: randomBetween(dMin, dMax),
    delay: randomBetween(0, dMax * 0.7),
    swayDir: i % 2 === 0 ? 'left' : 'right',
  }));
}

// ── Small / Medium layer configs ──────────────────────────────────────────────
const SMALL_LAYERS = [
  { emojis: FLOWERS, count: 18, sMin: 18, sMax: 32, dMin: 3.0, dMax: 5.0 },
  { emojis: FRUITS,  count: 16, sMin: 16, sMax: 28, dMin: 2.5, dMax: 4.5 },
  { emojis: LEAVES,  count: 14, sMin: 16, sMax: 28, dMin: 2.8, dMax: 4.8 },
];

const MEDIUM_LAYERS = [
  { emojis: FLOWERS, count: 28, sMin: 20, sMax: 36, dMin: 2.8, dMax: 5.0 },
  { emojis: FRUITS,  count: 24, sMin: 18, sMax: 32, dMin: 2.5, dMax: 4.5 },
  { emojis: LEAVES,  count: 22, sMin: 18, sMax: 32, dMin: 2.8, dMax: 4.8 },
];

// ── Main Component ────────────────────────────────────────────────────────────
function CelebrationScreen({ score, total, size = 'small', quizType = 'mixed', onComplete, speak }) {
  const [phase,       setPhase]       = useState('snow');    // snow → bears → card → poppers
  const [showCard,    setShowCard]    = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [bearsDone,   setBearsDone]   = useState(false);

  const accuracy  = total > 0 ? Math.round((score / total) * 100) : 0;
  const perf      = getPerformance(accuracy);
  const qtCfg     = QUIZ_TYPE_CONFIG[quizType] || QUIZ_TYPE_CONFIG['mixed'];

  // Build stable random data refs
  const smallPiecesRef  = useRef(null);
  const mediumPiecesRef = useRef(null);
  const snowBurstRef    = useRef(null);
  const snowGentleRef   = useRef(null);
  const bearsRef        = useRef(null);
  const poppersRef      = useRef(null);

  if (!smallPiecesRef.current) {
    smallPiecesRef.current = SMALL_LAYERS.flatMap(l =>
      buildLayer(l.emojis, l.count, l.sMin, l.sMax, l.dMin, l.dMax));
  }
  if (!mediumPiecesRef.current) {
    mediumPiecesRef.current = MEDIUM_LAYERS.flatMap(l =>
      buildLayer(l.emojis, l.count, l.sMin, l.sMax, l.dMin, l.dMax));
  }
  if (!snowBurstRef.current) {
    snowBurstRef.current = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(14, 28),
      duration: randomBetween(0.8, 2.0),
      delay: randomBetween(0, 0.8),
    }));
  }
  if (!snowGentleRef.current) {
    snowGentleRef.current = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: randomBetween(0, 100),
      size: randomBetween(10, 20),
      duration: randomBetween(3.0, 5.5),
      delay: randomBetween(0, 4.0),
    }));
  }
  if (!bearsRef.current) {
    // 20 bears, scattered across bottom, growing from 40px to 130px (≈1/5 screen)
    bearsRef.current = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      delay: i * 0.22,
      size: 40 + i * 4.5,                        // grows from 40px to ~130px
      landX: randomBetween(-150, 150),
    }));
  }
  if (!poppersRef.current) {
    poppersRef.current = Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: randomBetween(2, 96),
      size: randomBetween(16, 32),
      duration: randomBetween(2.0, 4.0),
      delay: randomBetween(0, 3.5),
    }));
  }

  useEffect(() => {
    window.speechSynthesis.cancel();

    if (size === 'large') {
      // Snow burst: 2.5s → then bears start
      // Bears: 20 × 0.22s stagger = ~4.4s → score card
      // Score card → buttons 1.5s later
      const bearStart   = 2500;
      const cardDelay   = bearStart + 20 * 220 + 600;  // all bears + settle
      const buttonDelay = cardDelay + 1500;

      const t1 = setTimeout(() => setPhase('bears'),   bearStart);
      const t2 = setTimeout(() => {
        setPhase('poppers');
        setShowCard(true);
        if (speak) {
          let msg = "Good try! Keep practicing!";
          if (accuracy === 100) msg = "Perfect! You got them all!";
          else if (accuracy >= 80) msg = "Excellent! Almost perfect!";
          else if (accuracy >= 60) msg = "Great job! You're getting there!";
          speak(msg);
        }
      }, cardDelay);
      const t3 = setTimeout(() => setShowButtons(true), buttonDelay);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); window.speechSynthesis.cancel(); };
    } else {
      // Small / medium — straight to card
      const cardDelay   = size === 'medium' ? 1200 : 1000;
      const buttonDelay = cardDelay + 1500;
      const t1 = setTimeout(() => {
        setShowCard(true);
        setPhase('poppers');
        if (speak) {
          let msg = "Good try! Keep practicing!";
          if (accuracy === 100) msg = "Perfect! You got them all!";
          else if (accuracy >= 80) msg = "Excellent! Almost perfect!";
          else if (accuracy >= 60) msg = "Great job! You're getting there!";
          speak(msg);
        }
      }, cardDelay);
      const t2 = setTimeout(() => setShowButtons(true), buttonDelay);
      return () => { clearTimeout(t1); clearTimeout(t2); window.speechSynthesis.cancel(); };
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const bgColor = size === 'large'
    ? 'linear-gradient(135deg,#0a0015 0%,#1a0030 35%,#300060 70%,#0a1540 100%)'
    : size === 'medium'
    ? 'linear-gradient(135deg,#0d1b2a 0%,#1b2a4a 40%,#2d1b69 100%)'
    : 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)';

  const pieces = size === 'large'
    ? [
        ...buildLayer(FLOWERS, 35, 20, 38, 2.5, 4.8),
        ...buildLayer(FRUITS,  30, 18, 34, 2.5, 4.5),
        ...buildLayer(LEAVES,  28, 18, 34, 2.8, 4.8),
      ]
    : size === 'medium'
    ? mediumPiecesRef.current
    : smallPiecesRef.current;

  return (
    <div className="cs__overlay" style={{ background: bgColor }}>

      {/* ── Snow burst (large only, phase: snow) ── */}
      {size === 'large' && phase === 'snow' && (
        <div className="cs__snow-layer">
          {snowBurstRef.current.map(s => (
            <SnowParticle key={s.id} burst {...s} />
          ))}
        </div>
      )}

      {/* ── Gentle background snow (large, all phases after snow) ── */}
      {size === 'large' && phase !== 'snow' && (
        <div className="cs__snow-layer">
          {snowGentleRef.current.map(s => (
            <SnowParticle key={s.id} burst={false} {...s} />
          ))}
        </div>
      )}

      {/* ── Teddy bears (large only, phase: bears or later) ── */}
      {size === 'large' && (phase === 'bears' || phase === 'poppers') && (
        <div className="cs__bears-layer">
          {bearsRef.current.map(b => (
            <TeddyBear key={b.id} index={b.id} total={20} {...b} />
          ))}
        </div>
      )}

      {/* ── Falling objects (all sizes, phase: poppers) ── */}
      {phase === 'poppers' && (
        <div className="cs__layer">
          {pieces.map((p, i) => (
            <FallingPiece key={i} {...p} />
          ))}
        </div>
      )}

      {/* ── Party poppers falling (phase: poppers) ── */}
      {phase === 'poppers' && (
        <div className="cs__poppers-layer">
          {poppersRef.current.map(p => (
            <PartyPopper key={p.id} {...p} />
          ))}
        </div>
      )}

      {/* ── Score card + buttons ── */}
      <div className="cs__content">
        {showCard && (
          <div className="cs__card">
            {/* Quiz type badge — above emoji */}
            <div className="cs__quiz-badge" style={{ background: qtCfg.bg }}>
              {qtCfg.icon} {qtCfg.label}
            </div>
            <div className="cs__card-emoji">{perf.emoji}</div>
            <div className="cs__card-message" style={{ color: perf.color }}>
              {perf.text}
            </div>
            <div className="cs__card-numbers">
              <span className="cs__score-val">{score}</span>
              <span className="cs__score-sep">/</span>
              <span className="cs__score-tot">{total}</span>
            </div>
            <div className="cs__card-accuracy">{accuracy}% Accuracy</div>
          </div>
        )}

        <div className={`cs__buttons ${showButtons ? 'cs__buttons--visible' : ''}`}>
          <button className="cs__btn cs__btn--again"
            onClick={() => onComplete && onComplete('again')}>
            🔁 Try Again
          </button>
          <button className="cs__btn cs__btn--change"
            onClick={() => onComplete && onComplete('change')}>
            🔀 Change Quiz
          </button>
          <button className="cs__btn cs__btn--menu"
            onClick={() => onComplete && onComplete('menu')}>
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default CelebrationScreen;