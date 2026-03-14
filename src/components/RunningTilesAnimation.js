import React, { useState, useEffect, useRef } from 'react';
import './RunningTilesAnimation.css';

const CONFETTI_COLORS = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98FB98'];
const PARADE_SETS = [
  ['🎉','🌟','🏆','🎊','⭐','💫','🎈','🌈'],
  ['🦄','🐬','🦋','🌸','🍭','🎠','🎡','🎪'],
  ['👑','💎','🏅','🥇','🎖️','✨','🌠','🎆'],
  ['🚀','⚡','🌊','🔥','💥','🌺','🎯','🎵'],
];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function FireworkParticle({ x, y, color, angle, speed, delay }) {
  return (
    <div className="rta__firework-particle" style={{
      left: `${x}%`, top: `${y}%`, background: color,
      '--angle': `${angle}deg`, '--speed': `${speed}px`, animationDelay: `${delay}s`,
    }} />
  );
}

function Fireworks() {
  const bursts = Array.from({ length: 6 }, (_, i) => ({
    id: i, x: randomBetween(15, 85), y: randomBetween(10, 55),
    delay: i * 0.35, color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  }));
  return (
    <div className="rta__fireworks-layer">
      {bursts.map(burst =>
        Array.from({ length: 12 }, (_, j) => (
          <FireworkParticle key={`${burst.id}-${j}`} x={burst.x} y={burst.y}
            color={CONFETTI_COLORS[j % CONFETTI_COLORS.length]}
            angle={j * 30} speed={randomBetween(60, 130)} delay={burst.delay + j * 0.02} />
        ))
      )}
    </div>
  );
}

function ConfettiPiece({ left, color, size, duration, delay, shape }) {
  return (
    <div className={`rta__confetti rta__confetti--${shape}`} style={{
      left: `${left}%`, background: color, width: `${size}px`,
      height: shape === 'rect' ? `${size * 1.8}px` : `${size}px`,
      animationDuration: `${duration}s`, animationDelay: `${delay}s`,
    }} />
  );
}

function ConfettiLayer({ count = 40 }) {
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i, left: randomBetween(0, 100), color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: randomBetween(6, 12), duration: randomBetween(2.5, 4.5),
    delay: randomBetween(0, 2), shape: ['rect', 'circle', 'rect'][i % 3],
  }));
  return (
    <div className="rta__confetti-layer">
      {pieces.map(p => <ConfettiPiece key={p.id} {...p} />)}
    </div>
  );
}

function StarRain({ count = 25 }) {
  return (
    <div className="rta__star-layer">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="rta__star" style={{
          left: `${randomBetween(0, 100)}%`,
          fontSize: `${randomBetween(14, 28)}px`,
          animationDuration: `${randomBetween(1.5, 3)}s`,
          animationDelay: `${randomBetween(0, 2.5)}s`,
        }}>
          {['⭐','🌟','✨','💫'][i % 4]}
        </div>
      ))}
    </div>
  );
}

function EmojiParade({ accuracy }) {
  const setIndex = accuracy === 100 ? 2 : accuracy >= 80 ? 0 : accuracy >= 60 ? 1 : 3;
  const emojis = PARADE_SETS[setIndex];
  const items = Array.from({ length: 16 }, (_, i) => ({
    id: i, emoji: emojis[i % emojis.length], row: i < 8 ? 0 : 1,
    delay: (i % 8) * 0.18, size: randomBetween(28, 42),
  }));
  return (
    <div className="rta__parade-layer">
      {items.map(item => (
        <div key={item.id}
          className={`rta__parade-emoji rta__parade-emoji--row${item.row}`}
          style={{ fontSize: `${item.size}px`, animationDelay: `${item.delay}s` }}>
          {item.emoji}
        </div>
      ))}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
// onComplete(action):
//   action = 'again'       → Try Again (same quiz)
//   action = 'change'      → Change Quiz (go to HexagonTransition)
//   action = 'menu'        → Main Menu
//   action = undefined     → legacy auto-complete (no buttons shown)

function RunningTilesAnimation({ score, total, onComplete, speak, milestone }) {
  const [animationPhase, setAnimationPhase] = useState('tiles');
  const [showButtons,    setShowButtons]    = useState(false);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  useEffect(() => {
    window.speechSynthesis.cancel();

    const narrationTimer = setTimeout(() => {
      let message = "Good try! Keep practicing!";
      if (accuracy === 100) message = "Perfect! You got them all!";
      else if (accuracy >= 80) message = "Excellent! Almost perfect!";
      else if (accuracy >= 60) message = "Great job! You're getting there!";
      if (speak) speak(message);
    }, 400);

    // Score card appears at 1.8s
    const scoreTimer = setTimeout(() => setAnimationPhase('score'), 1800);

    // Buttons fade in 1.5s after score card
    const buttonsTimer = setTimeout(() => setShowButtons(true), 3300);

    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(narrationTimer);
      clearTimeout(scoreTimer);
      clearTimeout(buttonsTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPerformanceMessage = () => {
    if (accuracy === 100) return { emoji: '👑', text: 'PERFECT!',   color: '#FFD700' };
    if (accuracy >= 80)  return { emoji: '🌟', text: 'EXCELLENT!',  color: '#4CAF50' };
    if (accuracy >= 60)  return { emoji: '⭐', text: 'GREAT JOB!',  color: '#2196F3' };
    return                      { emoji: '💪', text: 'KEEP GOING!', color: '#FF9800' };
  };

  const getMilestoneLabel = () => {
    switch (milestone) {
      case 'quarter': return '🎯 1/4 of pictures done!';
      case 'third':   return '🎯 1/3 of pictures done!';
      case 'half':    return '🎯 Half of pictures done!';
      case 'all':     return '🏆 All pictures done!';
      default:        return null;
    }
  };

  const performance    = getPerformanceMessage();
  const milestoneLabel = getMilestoneLabel();

  return (
    <div className="grammar-overlay">
      {/* Base tile grid */}
      <div className="tile-animation-container">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className="tile" style={{ animationDelay: `${Math.random() * 1.5}s` }} />
        ))}
      </div>

      {/* Celebration layers */}
      {accuracy === 100 && <Fireworks />}
      {accuracy >= 80  && <ConfettiLayer count={accuracy === 100 ? 60 : 40} />}
      {accuracy >= 60  && <StarRain count={accuracy >= 80 ? 30 : 18} />}
      <EmojiParade accuracy={accuracy} />

      {/* Score card + buttons */}
      {animationPhase === 'score' && (
        <div className="rta__score-area">
          <div className="score-reveal">
            <div className="score-emoji">{performance.emoji}</div>
            <div className="score-message" style={{ color: performance.color }}>
              {performance.text}
            </div>
            <div className="score-numbers">
              <span className="score-value">{score}</span>
              <span className="score-separator">/</span>
              <span className="score-total">{total}</span>
            </div>
            <div className="score-accuracy">{accuracy}% Accuracy</div>
            {milestoneLabel && (
              <div className="score-milestone">{milestoneLabel}</div>
            )}
          </div>

          {/* Post-quiz action buttons — fade in after 1.5s */}
          <div className={`rta__action-buttons ${showButtons ? 'rta__action-buttons--visible' : ''}`}>
            <button
              className="rta__btn rta__btn--again"
              onClick={() => onComplete && onComplete('again')}
            >
              🔁 Try Again
            </button>
            <button
              className="rta__btn rta__btn--change"
              onClick={() => onComplete && onComplete('change')}
            >
              🔀 Change Quiz
            </button>
            <button
              className="rta__btn rta__btn--menu"
              onClick={() => onComplete && onComplete('menu')}
            >
              🏠 Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RunningTilesAnimation;