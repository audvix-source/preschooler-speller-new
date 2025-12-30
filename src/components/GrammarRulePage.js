import React, { useState } from 'react';
import './GrammarRulePage.css';

function GrammarRulePage({ onContinue, speak }) {
  const [showRules, setShowRules] = useState(false);

  const handleViewRules = () => {
    if (speak) speak("Here's something important to remember!");
    setShowRules(true);
  };

  const handleContinue = () => {
    if (speak) speak("Awesome! Let's keep going!");
    onContinue();
  };

  if (!showRules) {
    return (
      <div className="reward-overlay">
        <div className="reward-sparkles">✨✨✨</div>
        <div className="reward-container">
          {/* Top Banner */}
          <div className="reward-banner">
            <span className="banner-text">REMEMBER!</span>
          </div>

          {/* Main Reward Box */}
          <div className="reward-box">
            <div className="reward-subtitle">YOU UNLOCKED</div>
            
            {/* Coin/Trophy Display */}
            <div className="reward-circle">
              <div className="trophy-icon">🏆</div>
              <div className="sparkle sparkle-1">⭐</div>
              <div className="sparkle sparkle-2">⭐</div>
              <div className="sparkle sparkle-3">⭐</div>
            </div>

            <div className="reward-title">Grammar Tip!</div>
            <div className="reward-description">
              Special rules about body parts
            </div>

            {/* Multiplier Badge */}
            <div className="multiplier-badge">
              <span className="multiplier-icon">💡</span>
            </div>
          </div>

          {/* Bottom Button */}
          <button className="reward-okay-button" onClick={handleViewRules}>
            SHOW ME!
          </button>
        </div>
        <div className="reward-sparkles bottom">✨✨✨</div>
      </div>
    );
  }

  // Rules Screen (after clicking SHOW ME)
  return (
    <div className="grammar-overlay">
      <div className="grammar-game-container">
        <div className="grammar-header-game">
          <h1>💡 Grammar Rules 💡</h1>
          <p className="grammar-subtitle-game">Body parts often come in pairs!</p>
        </div>

        <div className="grammar-content-game">
          {/* Rules Table */}
          <div className="rules-card">
            <table className="grammar-table-game">
              <thead>
                <tr>
                  <th>ONE</th>
                  <th>TWO</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="emoji-large">👁️</span>
                    <strong>Eye</strong>
                    <span className="example-small">(left or right)</span>
                  </td>
                  <td>
                    <span className="emoji-large">👁️👁️</span>
                    <strong>Eyes</strong>
                    <span className="example-small">(both)</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="emoji-large">👂</span>
                    <strong>Ear</strong>
                    <span className="example-small">(left or right)</span>
                  </td>
                  <td>
                    <span className="emoji-large">👂👂</span>
                    <strong>Ears</strong>
                    <span className="example-small">(both)</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="emoji-large">👄</span>
                    <strong>Lip</strong>
                    <span className="example-small">(upper/lower)</span>
                  </td>
                  <td>
                    <span className="emoji-large">💋</span>
                    <strong>Lips</strong>
                    <span className="example-small">(both)</span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <span className="emoji-large">😊</span>
                    <strong>Cheek</strong>
                    <span className="example-small">(left or right)</span>
                  </td>
                  <td>
                    <span className="emoji-large">😊😊</span>
                    <strong>Cheeks</strong>
                    <span className="example-small">(both)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Special Rules */}
          <div className="special-card">
            <h3>✨ Special Words ✨</h3>
            <div className="special-grid">
              <div className="special-item-game">
                <span className="special-emoji-large">🦷</span>
                <span className="special-text-game">
                  <strong>Tooth</strong> → <strong>Teeth</strong>
                </span>
              </div>
              <div className="special-item-game">
                <span className="special-emoji-large">💇</span>
                <span className="special-text-game">
                  <strong>Hair</strong> stays <strong>Hair</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <button className="continue-game-button" onClick={handleContinue}>
          GOT IT! 🚀
        </button>
      </div>
    </div>
  );
}

export default GrammarRulePage;