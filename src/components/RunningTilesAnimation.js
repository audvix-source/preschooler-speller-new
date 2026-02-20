import React, { useState, useEffect } from 'react';
import './RunningTilesAnimation.css';

/**
 * RunningTilesAnimation
 *
 * TIMING:
 * - t=0ms   : tiles animate randomly (original logic restored)
 * - t=300ms : narration fires "You got X out of Y. Perfect!" / "Great work!"
 * - t=1800ms: score card appears as overlay
 * - t=3800ms: speech hard-cancelled + onComplete fires
 */
function RunningTilesAnimation({ score, total, onComplete, speak }) {
  const [animationPhase, setAnimationPhase] = useState('tiles');

  useEffect(() => {
    window.speechSynthesis.cancel();

    // ✅ New narration format: "You got 4 out of 5. Perfect!"
    const speakTimer = setTimeout(() => {
      if (speak) {
        const isPerfect = score === total;
        const phrase = isPerfect
          ? `You got ${score} out of ${total}. Perfect!`
          : `You got ${score} out of ${total}. Great work!`;
        speak(phrase);
      }
    }, 300);

    const scoreTimer = setTimeout(() => {
      setAnimationPhase('score');
    }, 1800);

    // Hard-cancel speech BEFORE onComplete — prevents bleed into next screen
    const completeTimer = setTimeout(() => {
      window.speechSynthesis.cancel();
      if (onComplete) onComplete();
    }, 3800);

    return () => {
      window.speechSynthesis.cancel();
      clearTimeout(speakTimer);
      clearTimeout(scoreTimer);
      clearTimeout(completeTimer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  const getPerformanceMessage = () => {
    if (accuracy === 100) return { emoji: '👑', text: 'PERFECT!',   color: '#FFD700' };
    if (accuracy >= 80)  return { emoji: '🌟', text: 'EXCELLENT!',  color: '#4CAF50' };
    if (accuracy >= 60)  return { emoji: '⭐', text: 'GREAT JOB!',  color: '#2196F3' };
    return                      { emoji: '💪', text: 'KEEP GOING!', color: '#FF9800' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="grammar-overlay">
      <div className="tile-animation-container">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="tile"
            // ✅ REVERTED: original random delay logic
            style={{ animationDelay: `${Math.random() * 1.5}s` }}
          />
        ))}
      </div>

      {animationPhase === 'score' && (
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
          <div className="score-accuracy">
            {accuracy}% Accuracy
          </div>
        </div>
      )}
    </div>
  );
}

export default RunningTilesAnimation;