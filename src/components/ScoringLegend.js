/* ===================================================================
   SCORING LEGEND - ADD TO STATS PAGE
   Collapsible section explaining how scoring works
   =================================================================== */

// ADD THIS TO YOUR STATS COMPONENT (StatsScreen.js or similar)

import React, { useState } from 'react';

function ScoringLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="scoring-legend-container">
      {/* Collapsible Button */}
      <button 
        className="legend-toggle-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="legend-icon">📖</span>
        <span className="legend-text">How Am I Scored?</span>
        <span className={`legend-arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>

      {/* Expandable Legend Content */}
      {isExpanded && (
        <div className="legend-content">
          {/* Overall Test Rewards */}
          <div className="legend-section">
            <h3 className="legend-heading">🏆 Overall Test Rewards</h3>
            <div className="legend-item">
              <span className="legend-symbol">👑</span>
              <span className="legend-label">Champion</span>
              <span className="legend-value">100% Perfect!</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">🥈</span>
              <span className="legend-label">Silver</span>
              <span className="legend-value">91-99% accuracy</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">🥉</span>
              <span className="legend-label">Bronze</span>
              <span className="legend-value">81-90% accuracy</span>
            </div>
          </div>

          {/* Star Ratings */}
          <div className="legend-section">
            <h3 className="legend-heading">⭐ Star Ratings (Per Word)</h3>
            <div className="legend-item">
              <span className="legend-symbol">⭐⭐⭐</span>
              <span className="legend-label">3 Stars</span>
              <span className="legend-value">80%+ accuracy</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">⭐⭐</span>
              <span className="legend-label">2 Stars</span>
              <span className="legend-value">60-79% accuracy</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">⭐</span>
              <span className="legend-label">1 Star</span>
              <span className="legend-value">40-59% accuracy</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">🎉</span>
              <span className="legend-label">Keep Trying!</span>
              <span className="legend-value">Below 40%</span>
            </div>
          </div>

          {/* Other Stats */}
          <div className="legend-section">
            <h3 className="legend-heading">📊 Other Stats</h3>
            <div className="legend-item">
              <span className="legend-symbol">👑</span>
              <span className="legend-label">"X Perfect!"</span>
              <span className="legend-value">100% attempts for this word</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">✅</span>
              <span className="legend-label">Total Correct</span>
              <span className="legend-value">All correct answers</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">📝</span>
              <span className="legend-label">Total Attempts</span>
              <span className="legend-value">All your tries</span>
            </div>
            <div className="legend-item">
              <span className="legend-symbol">🔥</span>
              <span className="legend-label">Day Streak</span>
              <span className="legend-value">Days practicing in a row</span>
            </div>
          </div>

          {/* Tip Box */}
          <div className="legend-tip-box">
            <div className="tip-icon">💡</div>
            <div className="tip-text">
              <strong>Pro Tip:</strong> Try to get 100% accuracy to earn the Champion Crown! 
              Each body part you spell correctly helps you level up!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoringLegend;