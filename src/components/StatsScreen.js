import React, { useState, useEffect } from 'react';
import scoreDB from '../services/scoreDatabase';
import { getWordsByCategory } from '../wordList.js';
import './StatsScreen.css';
import ScoringLegend from './ScoringLegend';

function StatsScreen({ onNavigate, speak, userId = 'user_1', users = [], setActiveUserId, onViewedOtherPlayer }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newRewards, setNewRewards] = useState([]);
  const [showNewRewardsBanner, setShowNewRewardsBanner] = useState(false);
  const [expandedReward, setExpandedReward] = useState(null);
  const [rewardDetails, setRewardDetails] = useState({});
  const [viewedRewards, setViewedRewards] = useState(new Set());
  
  // ✅ Reset Logic State
  const [resetStep, setResetStep] = useState(0); // 0=hidden, 1=explanation, 2=preview
  const [viewedUserId, setViewedUserId] = useState(userId);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);

  useEffect(() => {
    loadStats(viewedUserId);
  }, [viewedUserId]);

  const loadStats = async (uid) => {
    try {
      setLoading(true);
      const data = await scoreDB.getOverallProgress(uid || viewedUserId);
      setStats(data);

      const lastViewedRewards = JSON.parse(localStorage.getItem(`${userId}_lastViewedRewards`) || '{}');
      const currentRewards = {
        stars: data.stars || 0,
        bronze: data.bronze || 0,
        silver: data.silver || 0,
        champion: data.champion || 0
      };

      const rewards = [];
      if (currentRewards.stars > (lastViewedRewards.stars || 0))
        rewards.push({ type: 'star', count: currentRewards.stars - (lastViewedRewards.stars || 0) });
      if (currentRewards.bronze > (lastViewedRewards.bronze || 0))
        rewards.push({ type: 'bronze', count: currentRewards.bronze - (lastViewedRewards.bronze || 0) });
      if (currentRewards.silver > (lastViewedRewards.silver || 0))
        rewards.push({ type: 'silver', count: currentRewards.silver - (lastViewedRewards.silver || 0) });
      if (currentRewards.champion > (lastViewedRewards.champion || 0))
        rewards.push({ type: 'champion', count: currentRewards.champion - (lastViewedRewards.champion || 0) });

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

  // ✅ Reset Handler
  const handleReset = async () => {
    await scoreDB.resetAllData(userId);
    localStorage.removeItem(`${userId}_lastViewedRewards`);
    setResetStep(0);
    loadStats(viewedUserId);
    if (speak) speak("All scores have been reset to zero.");
  };

  const dismissNewRewards = () => {
    if (!stats) return;
    const currentRewards = {
      stars: stats.stars || 0,
      bronze: stats.bronze || 0,
      silver: stats.silver || 0,
      champion: stats.champion || 0
    };
    localStorage.setItem(`${userId}_lastViewedRewards`, JSON.stringify(currentRewards));
    setShowNewRewardsBanner(false);
    setNewRewards([]);
  };

  const handleRewardClick = async (rewardType) => {
    setViewedRewards(prev => new Set([...prev, rewardType]));
    if (expandedReward === rewardType) {
      setExpandedReward(null);
    } else {
      setExpandedReward(rewardType);
      if (!rewardDetails[rewardType]) {
        const details = await scoreDB.getRewardsByType(rewardType, viewedUserId);
        setRewardDetails(prev => ({ ...prev, [rewardType]: details }));
      }
    }
  };

  const shouldPulse = (rewardType) => {
    if (viewedRewards.has(rewardType)) return false;
    return newRewards.some(r => r.type === rewardType);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleWordClick = (wordName) => {
    if (speak) speak(`Let's practice ${wordName}!`);
    const bodyPartsWords = getWordsByCategory('Parts of the Body');
    const wordIndex = bodyPartsWords.findIndex(w => w.word === wordName);
    if (wordIndex === -1) return;
    localStorage.setItem(`${userId}_learningState_Parts of the Body`, JSON.stringify({
      viewState: 'activity',
      chosenModel: localStorage.getItem(`${userId}_lastChosenModel`) || 'boy',
      wordIndex,
      lastSaved: new Date().toISOString()
    }));
    onNavigate('learning', 'Parts of the Body');
  };

  // ── Reward card renderer ──
  const REWARD_TYPES = [
    { key: 'star',     icon: '⭐', label: 'Stars',     countKey: 'stars' },
    { key: 'bronze',   icon: '🥉', label: 'Bronze',    countKey: 'bronze' },
    { key: 'silver',   icon: '🥈', label: 'Silver',    countKey: 'silver' },
    { key: 'champion', icon: '👑', label: 'Champion', countKey: 'champion' },
  ];

  const RewardCard = ({ rtype }) => {
    const isExpanded = expandedReward === rtype.key;
    const details = rewardDetails[rtype.key];
    return (
      <div
        className={`reward-card ${shouldPulse(rtype.key) ? 'blinking' : ''} ${isExpanded ? 'expanded' : ''}`}
        onClick={() => handleRewardClick(rtype.key)}
      >
        <div className="reward-icon">{rtype.icon}</div>
        <div className="reward-count">{stats[rtype.countKey] || 0}</div>
        <div className="reward-label">{rtype.label}</div>

        {isExpanded && details && (
          <div className="reward-details">
            <div className="reward-details-header">Achievement History</div>
            {details.length > 0 ? (
              <div className="reward-details-list">
                {details.map((detail, idx) => (
                  <div key={idx} className="reward-detail-item">
                    <div className="detail-body-part">{detail.bodyPart}</div>
                    <div className="detail-info">
                      <span className="detail-accuracy">{detail.accuracy}% accuracy</span>
                      <span className="detail-date">{formatDate(detail.earnedDate)}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-details">No {rtype.label.toLowerCase()} earned yet!</div>
            )}
          </div>
        )}
      </div>
    );
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
          <div className="stats-header"><h1>🏆 My Progress 🏆</h1></div>
          <div className="stats-scrollable-content">
            <div className="no-data-message">No progress data yet. Start practicing to see your stats!</div>
          </div>
          <button className="stats-back-button" onClick={() => onNavigate('menu')}>Back to Menu</button>
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

        {/* ── Player Tabs ── */}
        <div className="player-tabs">
          {users.filter(u => u !== null).map(user => (
            <div
              key={user.id}
              className={`player-tab ${user.id === viewedUserId ? 'active' : ''}`}
              style={user.id === viewedUserId ? { backgroundColor: user.color } : {}}
              onClick={() => {
                setViewedUserId(user.id);
                setRewardDetails({});
                setExpandedReward(null);
                loadStats(user.id);
                // ✅ Only flag a session break if browsing a DIFFERENT player's scores.
                // Viewing your own tab is not a session break — no re-prompt needed.
                if (user.id !== userId && onViewedOtherPlayer) {
                  onViewedOtherPlayer();
                }
              }}
            >
              <span className="player-tab-avatar">{user.avatar}</span>
              <span className="player-tab-name">{user.name}</span>
            </div>
          ))}
        </div>

        <div className="stats-scrollable-content">
          <ScoringLegend />
          
          {/* ✅ Reset Button placed after Legend */}
          <button className="reset-scores-button" onClick={() => setResetStep(1)}>
            🗑️ Reset All Scores
          </button>

          {/* ── Rewards Section ── */}
          <div className="rewards-section">
            <h2>✨ My Rewards ✨</h2>
            <div className="rewards-grid">
              {REWARD_TYPES.map(rt => (
                <RewardCard key={rt.key} rtype={rt} />
              ))}
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

          {/* ── Learning Progress Section ── */}
          <div className="learning-progress-section">
            <h2>📚 Learning Progress 📚</h2>
            {stats.wordStats && stats.wordStats.length > 0 ? (
              <>
                <h3 className="category-header">👤 Body Parts Mastery</h3>
                <div className="learning-list">
                  {stats.wordStats
                    .filter(word => !word.word.startsWith('Mastery Check') && !word.word.includes('-'))
                    .map((word, index) => {
                      const accuracy = word.totalAttempts > 0
                        ? Math.round((word.correctAttempts / word.totalAttempts) * 100) : 0;
                      const stars = accuracy >= 80 ? '⭐⭐⭐' : accuracy >= 60 ? '⭐⭐' : accuracy >= 40 ? '⭐' : '';
                      return (
                        <div key={index} className="learning-item clickable" onClick={() => handleWordClick(word.word)}>
                          <div className="learning-word">{word.word}</div>
                          <div className="learning-stats">
                            <div className="stat"><span className="stat-label">Accuracy:</span><span className="stat-value">{accuracy}%</span></div>
                            <div className="stat"><span className="stat-label">Attempts:</span><span className="stat-value">{word.totalAttempts}</span></div>
                            <div className="stat"><span className="stat-label">Correct:</span><span className="stat-value">{word.correctAttempts}</span></div>
                            {stars && <div className="mastery-stars">{stars}</div>}
                          </div>
                          {word.perfectCount > 0 && <div className="perfect-badge">🏆 {word.perfectCount} Perfect!</div>}
                        </div>
                      );
                    })}
                </div>

                <h3 className="category-header">🔤 Alphabet Fun Mastery</h3>
                <div className="learning-list">
                  {stats.wordStats
                    .filter(word => word.word.startsWith('Mastery Check') || word.word.includes('-'))
                    .map((word, index) => {
                      const accuracy = word.totalAttempts > 0
                        ? Math.round((word.correctAttempts / word.totalAttempts) * 100) : 0;
                      const stars = accuracy >= 80 ? '⭐⭐⭐' : accuracy >= 60 ? '⭐⭐' : accuracy >= 40 ? '⭐' : '';
                      return (
                        <div key={index} className="learning-item">
                          <div className="learning-word">{word.word.charAt(0).toUpperCase() + word.word.slice(1)}</div>
                          <div className="learning-stats">
                            <div className="stat"><span className="stat-label">Accuracy:</span><span className="stat-value">{accuracy}%</span></div>
                            <div className="stat"><span className="stat-label">Attempts:</span><span className="stat-value">{word.totalAttempts}</span></div>
                            <div className="stat"><span className="stat-label">Correct:</span><span className="stat-value">{word.correctAttempts}</span></div>
                            {stars && <div className="mastery-stars">{stars}</div>}
                          </div>
                          {word.perfectCount > 0 && <div className="perfect-badge">🏆 {word.perfectCount} Perfect!</div>}
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="no-data-message">Start practicing to see your progress!</div>
            )}
          </div>

          {/* ── Overall Stats Section ── */}
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

      {/* ✅ Reset Overlay */}
      {resetStep > 0 && (
        <div className="reset-overlay">
          <div className="reset-modal">

            {resetStep === 1 && (
              <>
                <div className="reset-step-icon">⚠️</div>
                <h2 className="reset-title">Reset Scores</h2>
                <p className="reset-explanation">
                  Who would you like to reset?
                </p>
                <div className="reset-buttons">
                  <button className="reset-preview-btn" onClick={() => setResetStep(2)}>
                    👤 Reset <strong>{users.find(u => u?.id === viewedUserId)?.name || 'This Player'}</strong> only
                  </button>
                  <button className="reset-all-btn" onClick={() => setResetStep(3)}>
                    👥 Reset ALL Players
                  </button>
                  <button className="reset-cancel-btn" onClick={() => setResetStep(0)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {resetStep === 2 && (
              <>
                <div className="reset-step-icon">🔍</div>
                <h2 className="reset-title">Reset {users.find(u => u?.id === viewedUserId)?.name || 'This Player'}?</h2>
                <div className="reset-preview">
                  <div className="preview-rewards-grid">
                    <div className="preview-reward-card">⭐<br/><strong>0</strong><br/><span>Stars</span></div>
                    <div className="preview-reward-card">🥉<br/><strong>0</strong><br/><span>Bronze</span></div>
                    <div className="preview-reward-card">🥈<br/><strong>0</strong><br/><span>Silver</span></div>
                    <div className="preview-reward-card">👑<br/><strong>0</strong><br/><span>Champion</span></div>
                  </div>
                  <p className="preview-warning">⚠️ All learning and alphabet progress will be cleared.</p>
                </div>
                <div className="reset-buttons">
                  <button className="reset-confirm-btn" onClick={async () => {
                    await scoreDB.resetAllData(viewedUserId);
                    localStorage.removeItem(`${viewedUserId}_lastViewedRewards`);
                    setResetStep(0);
                    loadStats(viewedUserId);
                    if (speak) speak("Scores have been reset.");
                  }}>
                    🗑️ Yes, Reset This Player
                  </button>
                  <button className="reset-cancel-btn" onClick={() => setResetStep(0)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {resetStep === 3 && (
              <>
                <div className="reset-step-icon">⚠️</div>
                <h2 className="reset-title">Reset ALL Players?</h2>
                <p className="reset-explanation">
                  This will erase <strong>every player's</strong> stars, rewards, and learning progress.
                  <br/><br/>
                  This cannot be undone!
                </p>
                <div className="reset-buttons">
                  <button className="reset-confirm-btn" onClick={() => setResetStep(4)}>
                    👀 Show me what happens
                  </button>
                  <button className="reset-cancel-btn" onClick={() => setResetStep(0)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {resetStep === 4 && (
              <>
                <div className="reset-step-icon">🗑️</div>
                <h2 className="reset-title">All players will be reset to zero:</h2>
                <div className="reset-preview">
                  {users.filter(u => u !== null).map(user => (
                    <div key={user.id} className="reset-player-row">
                      <span>{user.avatar} {user.name}</span>
                      <span className="reset-player-zeroes">⭐0 🥉0 🥈0 👑0</span>
                    </div>
                  ))}
                  <p className="preview-warning">⚠️ All learning and alphabet progress will be cleared.</p>
                </div>
                <div className="reset-buttons">
                  <button className="reset-confirm-btn" onClick={async () => {
                    for (const user of users.filter(u => u !== null)) {
                      await scoreDB.resetAllData(user.id);
                      localStorage.removeItem(`${user.id}_lastViewedRewards`);
                    }
                    setResetStep(0);
                    loadStats(viewedUserId);
                    if (speak) speak("All scores have been reset.");
                  }}>
                    🗑️ Yes, Reset Everyone
                  </button>
                  <button className="reset-cancel-btn" onClick={() => setResetStep(0)}>
                    Cancel
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

export default StatsScreen;