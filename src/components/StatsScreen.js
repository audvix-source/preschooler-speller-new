import React, { useState, useEffect } from 'react';
import scoreDB from '../services/scoreDatabase';
import './StatsScreen.css';

function StatsScreen({ onNavigate, speak }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRewards, setNewRewards] = useState([]);
  const [showNewRewardsBanner, setShowNewRewardsBanner] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await scoreDB.getOverallProgress();
      setStats(data);
      
      // Check for new rewards
      const lastViewedRewards = JSON.parse(localStorage.getItem('lastViewedRewards') || '{}');
      const currentRewards = {
        stars: data.stars || 0,
        bronze: data.bronze || 0,
        silver: data.silver || 0,
        champion: data.champion || 0
      };
      
      const rewards = [];
      if (currentRewards.stars > (lastViewedRewards.stars || 0)) {
        rewards.push({ type: 'stars', count: currentRewards.stars - (lastViewedRewards.stars || 0) });
      }
      if (currentRewards.bronze > (lastViewedRewards.bronze || 0)) {
        rewards.push({ type: 'bronze', count: currentRewards.bronze - (lastViewedRewards.bronze || 0) });
      }
      if (currentRewards.silver > (lastViewedRewards.silver || 0)) {
        rewards.push({ type: 'silver', count: currentRewards.silver - (lastViewedRewards.silver || 0) });
      }
      if (currentRewards.champion > (lastViewedRewards.champion || 0)) {
        rewards.push({ type: 'champion', count: currentRewards.champion - (lastViewedRewards.champion || 0) });
      }
      
      if (rewards.length > 0) {
        setNewRewards(rewards);
        setShowNewRewardsBanner(true);
        if (speak) speak("Congratulations! You earned new rewards!");
      }
      
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissNewRewards = () => {
    if (!stats) return;
    
    const currentRewards = {
      stars: stats.stars || 0,
      bronze: stats.bronze || 0,
      silver: stats.silver || 0,
      champion: stats.champion || 0
    };
    localStorage.setItem('lastViewedRewards', JSON.stringify(currentRewards));
    setShowNewRewardsBanner(false);
    setNewRewards([]);
  };

  if (loading) {
    return (
      <div className="stats-screen">
        <div className="loading-message">Loading your progress...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="stats-screen">
        <div className="stats-container">
          <div className="stats-header">
            <h1>🏆 My Progress 🏆</h1>
          </div>
          <div className="stats-scrollable-content">
            <div className="no-data-message">
              No progress data yet. Start practicing to see your stats!
            </div>
          </div>
          <button className="stats-back-button" onClick={() => onNavigate('menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-screen">
      <div className="stats-container">
        <div className="stats-header">
          <h1>🏆 My Progress 🏆</h1>
        </div>

        <div className="stats-scrollable-content">
          {/* Rewards Section */}
          <div className="rewards-section">
            <h2>✨ My Rewards ✨</h2>
            <div className="rewards-grid">
              <div className={`reward-card ${newRewards.some(r => r.type === 'stars') ? 'blinking' : ''}`}>
                <div className="reward-icon">⭐</div>
                <div className="reward-count">{stats.stars || 0}</div>
                <div className="reward-label">Stars</div>
              </div>
              <div className={`reward-card ${newRewards.some(r => r.type === 'bronze') ? 'blinking' : ''}`}>
                <div className="reward-icon">🥉</div>
                <div className="reward-count">{stats.bronze || 0}</div>
                <div className="reward-label">Bronze</div>
              </div>
              <div className={`reward-card ${newRewards.some(r => r.type === 'silver') ? 'blinking' : ''}`}>
                <div className="reward-icon">🥈</div>
                <div className="reward-count">{stats.silver || 0}</div>
                <div className="reward-label">Silver</div>
              </div>
              <div className={`reward-card ${newRewards.some(r => r.type === 'champion') ? 'blinking' : ''}`}>
                <div className="reward-icon">👑</div>
                <div className="reward-count">{stats.champion || 0}</div>
                <div className="reward-label">Champion</div>
              </div>
            </div>

            {showNewRewardsBanner && (
              <div className="new-rewards-banner">
                <p>🎉 New Rewards Earned! 🎉</p>
                <button className="dismiss-rewards-btn" onClick={dismissNewRewards}>
                  Awesome!
                </button>
              </div>
            )}
          </div>

          {/* Learning Progress Section */}
          <div className="learning-progress-section">
            <h2>📚 Body Parts Mastery 📚</h2>
            {stats.wordStats && stats.wordStats.length > 0 ? (
              <div className="learning-list">
                {stats.wordStats.map((word, index) => {
                  const accuracy = word.totalAttempts > 0 
                    ? Math.round((word.correctAttempts / word.totalAttempts) * 100) 
                    : 0;
                  const stars = accuracy >= 80 ? '⭐⭐⭐' : accuracy >= 60 ? '⭐⭐' : accuracy >= 40 ? '⭐' : '';
                  
                  return (
                    <div key={index} className="learning-item">
                      <div className="learning-word">{word.word}</div>
                      <div className="learning-stats">
                        <div className="stat">
                          <span className="stat-label">Accuracy:</span>
                          <span className="stat-value">{accuracy}%</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Attempts:</span>
                          <span className="stat-value">{word.totalAttempts}</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Correct:</span>
                          <span className="stat-value">{word.correctAttempts}</span>
                        </div>
                        {stars && <div className="mastery-stars">{stars}</div>}
                      </div>
                      {word.perfectCount > 0 && (
                        <div className="perfect-badge">
                          🏆 {word.perfectCount} Perfect!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="no-data-message">
                Start practicing to see your progress!
              </div>
            )}
          </div>

          {/* Overall Stats Section */}
          <div className="overall-stats-section">
            <h2>📊 Overall Stats 📊</h2>
            <div className="stats-summary">
              <div className="summary-item">
                <div className="summary-icon">✅</div>
                <div className="summary-value">{stats.totalCorrect || 0}</div>
                <div className="summary-label">Total Correct</div>
              </div>
              <div className="summary-item">
                <div className="summary-icon">📝</div>
                <div className="summary-value">{stats.totalAttempts || 0}</div>
                <div className="summary-label">Total Attempts</div>
              </div>
              <div className="summary-item">
                <div className="summary-icon">🔥</div>
                <div className="summary-value">{stats.dayStreak || 0}</div>
                <div className="summary-label">Day Streak</div>
              </div>
            </div>
          </div>
        </div>

        <button className="stats-back-button" onClick={() => onNavigate('menu')}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

export default StatsScreen;