import React, { useState, useEffect } from 'react';
import scoreDB from '../services/scoreDatabase';
import './StatsScreen.css';

function StatsScreen({ onNavigate, speak }) {
  const [overallProgress, setOverallProgress] = useState(null);
  const [learningScores, setLearningScores] = useState([]);
  const [recentRewards, setRecentRewards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllStats();
  }, []);

  const loadAllStats = async () => {
    try {
      // Load overall progress
      const progress = await scoreDB.getOverallProgress();
      setOverallProgress(progress);

      // Load all learning scores
      const allScores = await scoreDB.getAllRecords(
        scoreDB.db.transaction(['learningScores'], 'readonly').objectStore('learningScores')
      );
      setLearningScores(allScores);

      // Load recent rewards (last 24 hours)
      const recent = await scoreDB.getRecentRewards(24);
      setRecentRewards(recent);

      setLoading(false);
    } catch (error) {
      console.error('Error loading stats:', error);
      setLoading(false);
    }
  };

  const getMasteryStars = (accuracy) => {
    if (accuracy >= 90) return '⭐⭐⭐';
    if (accuracy >= 80) return '⭐⭐';
    if (accuracy >= 70) return '⭐';
    return '';
  };

  const handleRewardsSeen = async () => {
    await scoreDB.markRewardsAsSeen();
    setRecentRewards([]);
  };

  if (loading) {
    return (
      <div className="stats-screen">
        <div className="loading-message">Loading your progress...</div>
      </div>
    );
  }

  return (
    <div className="stats-screen">
      <div className="stats-container">
        {/* Header */}
        <div className="stats-header">
          <h1>🏆 My Progress 🏆</h1>
        </div>

        {/* Overall Rewards Section */}
        <div className="rewards-section">
          <h2>✨ My Rewards ✨</h2>
          <div className="rewards-grid">
            <div className="reward-card">
              <div className="reward-icon">⭐</div>
              <div className="reward-count">{overallProgress?.totalStars || 0}</div>
              <div className="reward-label">Stars</div>
            </div>
            <div className={`reward-card ${recentRewards.some(r => r.type === 'bronze') ? 'blinking' : ''}`}>
              <div className="reward-icon">🥉</div>
              <div className="reward-count">{overallProgress?.bronzeMedals || 0}</div>
              <div className="reward-label">Bronze</div>
            </div>
            <div className={`reward-card ${recentRewards.some(r => r.type === 'silver') ? 'blinking' : ''}`}>
              <div className="reward-icon">🥈</div>
              <div className="reward-count">{overallProgress?.silverTrophies || 0}</div>
              <div className="reward-label">Silver</div>
            </div>
            <div className={`reward-card ${recentRewards.some(r => r.type === 'gold') ? 'blinking' : ''}`}>
              <div className="reward-icon">👑</div>
              <div className="reward-count">{overallProgress?.goldCrowns || 0}</div>
              <div className="reward-label">Champion</div>
            </div>
          </div>

          {recentRewards.length > 0 && (
            <div className="new-rewards-banner">
              <p>🎉 You have new rewards! 🎉</p>
              <button onClick={handleRewardsSeen} className="dismiss-rewards-btn">
                Got it!
              </button>
            </div>
          )}
        </div>

        {/* Body Parts Progress Section */}
        <div className="learning-progress-section">
          <h2>📚 Body Parts Mastery 📚</h2>
          {learningScores.length === 0 ? (
            <p className="no-data-message">Start practicing to see your progress!</p>
          ) : (
            <div className="learning-list">
              {learningScores.map((score) => (
                <div key={score.topic} className="learning-item">
                  <div className="learning-word">{score.topic}</div>
                  <div className="learning-stats">
                    <div className="stat">
                      <span className="stat-label">Accuracy:</span>
                      <span className="stat-value">{score.accuracy}%</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Attempts:</span>
                      <span className="stat-value">{score.totalAttempts}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Correct:</span>
                      <span className="stat-value">{score.correctAttempts}</span>
                    </div>
                    <div className="mastery-stars">{getMasteryStars(score.accuracy)}</div>
                  </div>
                  {score.perfectScores > 0 && (
                    <div className="perfect-badge">🏆 {score.perfectScores} Perfect!</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Overall Stats */}
        <div className="overall-stats-section">
          <h2>📊 Overall Stats 📊</h2>
          <div className="stats-summary">
            <div className="summary-item">
              <div className="summary-icon">✅</div>
              <div className="summary-text">
                <div className="summary-value">{overallProgress?.totalCorrect || 0}</div>
                <div className="summary-label">Total Correct</div>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">📝</div>
              <div className="summary-text">
                <div className="summary-value">{overallProgress?.totalAttempts || 0}</div>
                <div className="summary-label">Total Attempts</div>
              </div>
            </div>
            <div className="summary-item">
              <div className="summary-icon">🔥</div>
              <div className="summary-text">
                <div className="summary-value">{overallProgress?.currentStreak || 0}</div>
                <div className="summary-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button className="stats-back-button" onClick={() => onNavigate('menu')}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

export default StatsScreen;