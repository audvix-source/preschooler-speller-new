import React, { useState, useEffect } from 'react';
import './QuickCelebration.css';

const FLOWERS = ['🌸','🌺','🌻','🌼','🌷','💐','🏵️','🌹','🪷','🌾'];
const CONFETTI_COLORS = ['#FFD700','#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98FB98','#FF69B4','#87CEEB'];

function randomBetween(a, b) { return a + Math.random() * (b - a); }

function ConfettiPiece({ left, color, size, duration, delay, shape }) {
  return (
    <div
      className={`qc__confetti qc__confetti--${shape}`}
      style={{
        left: `${left}%`,
        background: color,
        width: `${size}px`,
        height: shape === 'rect' ? `${size * 1.8}px` : `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    />
  );
}

function FlowerPiece({ flower, left, size, duration, delay, swayDir }) {
  return (
    <div
      className={`qc__flower qc__flower--${swayDir}`}
      style={{
        left: `${left}%`,
        fontSize: `${size}px`,
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
      }}
    >
      {flower}
    </div>
  );
}

function QuickCelebration({ score, total, onComplete, speak }) {
  const [showCard, setShowCard] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  // Generate abundant confetti + flowers
  const confetti = Array.from({ length: 55 }, (_, i) => ({
    id: i,
    left: randomBetween(0, 100),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size: randomBetween(7, 14),
    duration: randomBetween(2.2, 4.2),
    delay: randomBetween(0, 1.8),
    shape: ['rect', 'circle', 'rect'][i % 3],
  }));

  const flowers = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    flower: FLOWERS[i % FLOWERS.length],
    left: randomBetween(0, 100),
    size: randomBetween(18, 38),
    duration: randomBetween(2.8, 5.0),
    delay: randomBetween(0, 2.2),
    swayDir: i % 2 === 0 ? 'left' : 'right',
  }));

  useEffect(() => {
    window.speechSynthesis.cancel();

    const narrationTimer = setTimeout(() => {
      let message = "Good try! Keep practicing!";
      if (accuracy === 100) message = "Perfect! You got them all!";
      else if (accuracy >= 80) message = "Excellent! Almost perfect!";
      else if (accuracy >= 60) message = "Great job! You're getting there!";
      if (speak) speak(message);
    }, 400);

    const cardTimer   = setTimeout(() => setShowCard(true),    900);
    const buttonTimer = setTimeout(() => setShowButtons(true), 2400);

    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(narrationTimer);
      clearTimeout(cardTimer);
      clearTimeout(buttonTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getPerformance = () => {
    if (accuracy === 100) return { emoji: '👑', text: 'PERFECT!',   color: '#FFD700' };
    if (accuracy >= 80)  return { emoji: '🌟', text: 'EXCELLENT!',  color: '#4CAF50' };
    if (accuracy >= 60)  return { emoji: '⭐', text: 'GREAT JOB!',  color: '#2196F3' };
    return                      { emoji: '💪', text: 'KEEP GOING!', color: '#FF9800' };
  };

  const perf = getPerformance();

  return (
    <div className="qc__overlay">
      {/* Abundant confetti */}
      <div className="qc__confetti-layer">
        {confetti.map(p => <ConfettiPiece key={p.id} {...p} />)}
      </div>

      {/* Abundant flowers */}
      <div className="qc__flower-layer">
        {flowers.map(f => <FlowerPiece key={f.id} {...f} />)}
      </div>

      {/* Score card + buttons */}
      <div className="qc__content">
        {showCard && (
          <div className="qc__card">
            <div className="qc__card-emoji">{perf.emoji}</div>
            <div className="qc__card-message" style={{ color: perf.color }}>{perf.text}</div>
            <div className="qc__card-numbers">
              <span className="qc__score-value">{score}</span>
              <span className="qc__score-sep">/</span>
              <span className="qc__score-total">{total}</span>
            </div>
            <div className="qc__card-accuracy">{accuracy}% Accuracy</div>
          </div>
        )}

        <div className={`qc__buttons ${showButtons ? 'qc__buttons--visible' : ''}`}>
          <button className="qc__btn qc__btn--again"  onClick={() => onComplete && onComplete('again')}>
            🔁 Try Again
          </button>
          <button className="qc__btn qc__btn--change" onClick={() => onComplete && onComplete('change')}>
            🔀 Change Quiz
          </button>
          <button className="qc__btn qc__btn--menu"   onClick={() => onComplete && onComplete('menu')}>
            🏠 Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuickCelebration;