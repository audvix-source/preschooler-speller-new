import React, { useState, useEffect, useRef } from 'react';
import './RunningTilesAnimation.css';

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