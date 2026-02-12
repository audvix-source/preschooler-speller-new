import React, { useState, useEffect } from 'react';
import './RunningTilesAnimation.css';

/**
 * RunningTilesAnimation - Beautiful grid tile animation before score reveal
 * Uses the SAME gorgeous animation from GrammarRulePage
 * 
 * Props:
 * - score: Final score (e.g., 4)
 * - total: Total questions (e.g., 5)
 * - onComplete: Callback when animation finishes
 */
function RunningTilesAnimation({ score, total, onComplete }) {
  const [animationPhase, setAnimationPhase] = useState('tiles'); // 'tiles' | 'score'

  useEffect(() => {
    // Phase 1: Show tiles (2.5 seconds - let them pulse)
    const scoreTimer = setTimeout(() => {
      setAnimationPhase('score');
    }, 2500);

    // Phase 2: Complete and callback (at 5 seconds total)
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Calculate accuracy percentage
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;

  // Get performance message
  const getPerformanceMessage = () => {
    if (accuracy === 100) return { emoji: '👑', text: 'PERFECT!', color: '#FFD700' };
    if (accuracy >= 80) return { emoji: '🌟', text: 'EXCELLENT!', color: '#4CAF50' };
    if (accuracy >= 60) return { emoji: '⭐', text: 'GREAT JOB!', color: '#2196F3' };
    return { emoji: '💪', text: 'KEEP GOING!', color: '#FF9800' };
  };

  const performance = getPerformanceMessage();

  return (
    <div className="grammar-overlay">
      {/* Beautiful Tile Grid - EXACTLY like GrammarRulePage */}
      <div className="tile-animation-container">
        {Array.from({ length: 48 }).map((_, i) => (
          <div
            key={i}
            className="tile"
            style={{
              animationDelay: `${Math.random() * 1.5}s`
            }}
          />
        ))}
      </div>

      {/* Score Reveal (appears after tiles pulse) */}
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