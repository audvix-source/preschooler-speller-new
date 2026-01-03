import React, { useState, useEffect } from 'react';
import './GrammarRulePage.css';
import lipSingleImage from '../assets/lip-single.png';

function GrammarRulePage({ onContinue, speak }) {
  const [showRules, setShowRules] = useState(false);
  const [rocketExplosions, setRocketExplosions] = useState([]);

  // Trigger rocket explosions every 3 seconds (every alternate confetti cycle)
  useEffect(() => {
    if (!showRules) {
      const explosionInterval = setInterval(() => {
        // Create 3-5 rocket explosions at random positions at the top
        const newExplosions = [];
        const count = Math.floor(Math.random() * 3) + 3; // 3-5 rockets
        
        for (let i = 0; i < count; i++) {
          newExplosions.push({
            id: Date.now() + i,
            left: Math.random() * 90 + 5, // 5-95% from left
            delay: Math.random() * 0.3 // Stagger the explosions slightly
          });
        }
        
        setRocketExplosions(newExplosions);
        
        // Clear explosions after animation completes
        setTimeout(() => setRocketExplosions([]), 1500);
      }, 3000); // Every 3 seconds (every other confetti cycle since confetti is 1.5s)

      return () => clearInterval(explosionInterval);
    }
  }, [showRules]);

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
        {/* Confetti Shower */}
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

        {/* Rocket Explosions at Top */}
        <div className="rocket-explosion-container">
          {rocketExplosions.map(explosion => (
            <div
              key={explosion.id}
              className="rocket-explosion"
              style={{
                left: `${explosion.left}%`,
                animationDelay: `${explosion.delay}s`
              }}
            >
              🎆
            </div>
          ))}
        </div>
        
        <div className="reward-container">
          <div className="reward-banner">
            <span className="banner-text">
              <span className="letter-cascade" style={{ '--delay': '0s' }}>R</span>
              <span className="letter-cascade" style={{ '--delay': '0.1s' }}>E</span>
              <span className="letter-cascade" style={{ '--delay': '0.2s' }}>M</span>
              <span className="letter-cascade" style={{ '--delay': '0.3s' }}>E</span>
              <span className="letter-cascade" style={{ '--delay': '0.4s' }}>M</span>
              <span className="letter-cascade" style={{ '--delay': '0.5s' }}>B</span>
              <span className="letter-cascade" style={{ '--delay': '0.6s' }}>E</span>
              <span className="letter-cascade" style={{ '--delay': '0.7s' }}>R</span>
              <span className="letter-cascade" style={{ '--delay': '0.8s' }}>!</span>
            </span>
          </div>

          <div className="reward-box">
            <div className="reward-subtitle">YOU UNLOCKED</div>
            <div className="reward-circle">
              <div className="trophy-icon">🏆</div>
            </div>
            <div className="reward-title">Grammar Tip!</div>
            <div className="reward-description">
              Special rules about body parts
            </div>
          </div>

          <button className="reward-okay-button" onClick={handleViewRules}>
            SHOW ME!
          </button>
        </div>
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
                    <div className="lip-image-container">
                      <img
                        src={lipSingleImage}
                        alt="Single Lip"
                        className="lip-custom-image"
                        style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                      />
                    </div>
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
                    <span className="emoji-large">😊😊</span>
                    <strong>Cheek</strong>
                    <span className="example-small">(left or right painted red)</span>
                  </td>
                  <td>
                    <span className="emoji-large">😊</span>
                    <strong>Cheeks</strong>
                    <span className="example-small">(both sides red)</span>
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
                  <strong>Hair</strong> stays <strong>Hair</strong><br/>
                  <span className="sub-rule">But: 2 white <strong>hairs</strong> (countable)</span>
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