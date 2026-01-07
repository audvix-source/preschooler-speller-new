import React, { useState, useEffect } from 'react';
import './GrammarRulePage.css';
import lipSingleImage from '../assets/lip-single.png';

function GrammarRulePage({ onContinue, speak, skipCelebration }) {
  const [showRules, setShowRules] = useState(false);
  const [showTileAnimation, setShowTileAnimation] = useState(false);
  const [rocketExplosions, setRocketExplosions] = useState([]);

  // Handle skipCelebration prop changes
  useEffect(() => {
    if (skipCelebration) {
      // Show tile animation first, then rules
      setShowTileAnimation(true);
      setTimeout(() => {
        setShowTileAnimation(false);
        setShowRules(true);
      }, 2000); // 2 seconds of tile animation
    }
  }, [skipCelebration]);

  useEffect(() => {
    let explosionInterval;
    if (!showRules && !skipCelebration) {
      explosionInterval = setInterval(() => {
        const newExplosions = [
          { id: Date.now(), left: 5, delay: 0 },
          { id: Date.now() + 1, left: 35, delay: 0.15 },
          { id: Date.now() + 2, left: 65, delay: 0.3 },
          { id: Date.now() + 3, left: 95, delay: 0.45 }
        ];
        setRocketExplosions(newExplosions);
        setTimeout(() => setRocketExplosions([]), 2000);
      }, 3000);
    }
    return () => { if (explosionInterval) clearInterval(explosionInterval); };
  }, [showRules, skipCelebration]);

  const handleViewRules = () => {
    if (speak) speak("Here's something important to remember!");
    setShowRules(true);
  };

  const handleContinue = () => {
    if (speak) speak("Awesome! Let's keep going!");
    onContinue();
  };

  // Tile animation screen (for error attempts)
  if (showTileAnimation) {
    return (
      <div className="grammar-overlay">
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
      </div>
    );
  }

  // Page 1 - Celebration (perfect score) OR Error explanation (mistakes made)
  if (!showRules) {
    if (skipCelebration) {
      // This shouldn't show because we go straight to tile animation
      return null;
    }

    // Perfect score celebration
    return (
      <div className="reward-overlay">
        <div className="confetti-container">
          <div className="confetti" style={{ left: '10%', animationDelay: '0s' }}>🎉</div>
          <div className="confetti" style={{ left: '20%', animationDelay: '0.2s' }}>⭐</div>
          <div className="confetti" style={{ left: '30%', animationDelay: '0.4s' }}>🎊</div>
          <div className="confetti" style={{ left: '40%', animationDelay: '0.6s' }}>✨</div>
          <div className="confetti" style={{ left: '60%', animationDelay: '0.3s' }}>🎉</div>
          <div className="confetti" style={{ left: '70%', animationDelay: '0.5s' }}>⭐</div>
          <div className="confetti" style={{ left: '80%', animationDelay: '0.7s' }}>🎊</div>
          <div className="confetti" style={{ left: '90%', animationDelay: '0.1s' }}>✨</div>
        </div>

        <div className="rocket-explosion-container">
          {rocketExplosions.map(exp => (
            <div key={exp.id} className="rocket-explosion" style={{ left: `${exp.left}%`, animationDelay: `${exp.delay}s` }}>
              🎇
            </div>
          ))}
        </div>

        <div className="reward-container">
          <div className="reward-banner">
            <span className="banner-text">REMEMBER!</span>
          </div>
          <div className="reward-box">
            <div className="reward-subtitle">YOU UNLOCKED</div>
            <div className="reward-circle"><div className="trophy-icon">🏆</div></div>
            <div className="reward-title">Grammar Tip!</div>
            <div className="reward-description">Special rules about body parts</div>
          </div>
          <button className="reward-okay-button" onClick={handleViewRules}>SHOW ME!</button>
        </div>
      </div>
    );
  }

  // Page 2 - Grammar Rules
  return (
    <div className="grammar-overlay">
      <div className="grammar-game-container">
        <div className="grammar-header-game">
          <h1>💡 Grammar Rules 💡</h1>
          <p className="grammar-subtitle-game">Body parts often come in pairs!</p>
        </div>
        <div className="grammar-content-game">
          <div className="rules-card">
            <table className="grammar-table-game">
              <thead><tr><th>ONE</th><th>TWO</th></tr></thead>
              <tbody>
                <tr>
                  <td><span className="emoji-large">👁️</span> <strong>Eye</strong></td>
                  <td><span className="emoji-large">👁️👁️</span> <strong>Eyes</strong></td>
                </tr>
                <tr>
                  <td><span className="emoji-large">👂</span> <strong>Ear</strong></td>
                  <td><span className="emoji-large">👂👂</span> <strong>Ears</strong></td>
                </tr>
                <tr>
                  <td>
                    <div className="lip-image-container">
                      <img src={lipSingleImage} alt="Single Lip" className="lip-custom-image" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    </div>
                    <strong>Lip</strong>
                  </td>
                  <td><span className="emoji-large">💋</span> <strong>Lips</strong></td>
                </tr>
                <tr>
                  <td>
                    <span className="emoji-large"> 😊😊 </span>
                    <strong>Cheek</strong>
                    <span className="example-small">(left or right painted red)</span>
                  </td>
                  <td>
                    <span className="emoji-large"> 😊 </span>
                    <strong>Cheeks</strong>
                    <span className="example-small">(both sides red)</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="special-card">
            <h3>✨ Special Words ✨</h3>
            <div className="special-grid">
              <div className="special-item-game">
                <span className="special-emoji-large">🦷</span>
                <span className="special-text-game"><strong>Tooth</strong> → <strong>Teeth</strong></span>
              </div>
              <div className="special-item-game">
                <span className="special-emoji-large">💇</span>
                <span className="special-text-game"><strong>Hair</strong> stays <strong>Hair</strong></span>
              </div>
            </div>
          </div>
        </div>
        <button className="continue-game-button" onClick={handleContinue}>GOT IT! 🚀</button>
      </div>
    </div>
  );
}

export default GrammarRulePage;