import React, { useState, useEffect } from 'react';
import './GrammarRulePage.css';
import lipSingleImage from '../assets/lip-single.png';

function GrammarRulePage({ onContinue, speak, skipCelebration }) {
  const [showRules, setShowRules] = useState(false);
  const [showTileAnimation, setShowTileAnimation] = useState(false);
  const [showChestScreen, setShowChestScreen] = useState(false);
  const [rocketExplosions, setRocketExplosions] = useState([]);
  const [confettiWaves, setConfettiWaves] = useState([]);

  // Handle skipCelebration prop changes
  useEffect(() => {
    if (skipCelebration) {
      // Show tile animation first
      setShowTileAnimation(true);
      setTimeout(() => {
        setShowTileAnimation(false);
        setShowChestScreen(true);
      }, 2000);
    }
  }, [skipCelebration]);

  // Rocket and confetti management for perfect score
  useEffect(() => {
    let rocketInterval;
    let confettiInterval;
    
    if (!showRules && !skipCelebration) {
      // ROCKETS - Fire in pairs with delays
      rocketInterval = setInterval(() => {
        // First pair - outer rockets
        setTimeout(() => {
          setRocketExplosions([
            { id: Date.now(), left: 5, delay: 0 },
            { id: Date.now() + 1, left: 95, delay: 0 }
          ]);
        }, 0);

        // Second pair - center rockets (500ms later)
        setTimeout(() => {
          setRocketExplosions(prev => [
            ...prev,
            { id: Date.now() + 2, left: 35, delay: 0 },
            { id: Date.now() + 3, left: 65, delay: 0 }
          ]);
        }, 500);

        // Clear all rockets after animations
        setTimeout(() => setRocketExplosions([]), 2500);
      }, 3500); // Repeat every 3.5 seconds

      // CONFETTI - Start falling after center rockets explode
      confettiInterval = setInterval(() => {
        // First wave
        setTimeout(() => {
          setConfettiWaves([{ id: Date.now(), wave: 1 }]);
        }, 1000); // 1 second after rockets start

        // Second wave (500ms later)
        setTimeout(() => {
          setConfettiWaves(prev => [...prev, { id: Date.now() + 1, wave: 2 }]);
        }, 1500);

        // Clear confetti
        setTimeout(() => setConfettiWaves([]), 3000);
      }, 3500);
    }

    return () => {
      if (rocketInterval) clearInterval(rocketInterval);
      if (confettiInterval) clearInterval(confettiInterval);
    };
  }, [showRules, skipCelebration]);

  const handleViewRules = () => {
    if (speak) speak("Here's something important to remember!");
    setShowRules(true);
  };

  const handleChestClick = () => {
    if (speak) speak("Let's see what we can learn!");
    setShowChestScreen(false);
    setShowRules(true);
  };

  const handleContinue = () => {
    if (speak) speak("Awesome! Let's keep going!");
    onContinue();
  };

  // Tile animation screen
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

  // Chest screen (for error attempts)
  if (showChestScreen) {
    return (
      <div className="chest-overlay">
        <div className="chest-container">
          <div className="chest-image">
            <div className="chest-glow"></div>
            <div className="chest-body">
              <div className="chest-lid-top"></div>
              <div className="chest-lid-bottom"></div>
              <div className="chest-main"></div>
              <div className="chest-lock">🔓</div>
            </div>
          </div>
          
          <button className="chest-banner-button" onClick={handleChestClick}>
            <div className="banner-ribbon">
              <span>LET'S SEE IT!</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // Page 1 - Perfect score celebration
  if (!showRules) {
    return (
      <div className="reward-overlay">
        {/* Rocket Explosions */}
        <div className="rocket-explosion-container">
          {rocketExplosions.map(exp => (
            <div 
              key={exp.id} 
              className="rocket-explosion" 
              style={{ 
                left: `${exp.left}%`, 
                animationDelay: `${exp.delay}s` 
              }}
            >
              🚀
            </div>
          ))}
        </div>

        {/* Confetti Waves */}
        <div className="confetti-container">
          {confettiWaves.map((wave, waveIndex) => (
            <React.Fragment key={wave.id}>
              <div className="confetti" style={{ left: '10%', animationDelay: `${waveIndex * 0.5}s` }}>🎉</div>
              <div className="confetti" style={{ left: '20%', animationDelay: `${waveIndex * 0.5 + 0.1}s` }}>⭐</div>
              <div className="confetti" style={{ left: '30%', animationDelay: `${waveIndex * 0.5 + 0.2}s` }}>🎊</div>
              <div className="confetti" style={{ left: '40%', animationDelay: `${waveIndex * 0.5 + 0.3}s` }}>✨</div>
              <div className="confetti" style={{ left: '60%', animationDelay: `${waveIndex * 0.5 + 0.15}s` }}>🎉</div>
              <div className="confetti" style={{ left: '70%', animationDelay: `${waveIndex * 0.5 + 0.25}s` }}>⭐</div>
              <div className="confetti" style={{ left: '80%', animationDelay: `${waveIndex * 0.5 + 0.35}s` }}>🎊</div>
              <div className="confetti" style={{ left: '90%', animationDelay: `${waveIndex * 0.5 + 0.05}s` }}>✨</div>
            </React.Fragment>
          ))}
        </div>

        <div className="reward-container">
          <div className="reward-banner">
            <span className="banner-text">
  {'REMEMBER!'.split('').map((letter, i) => (
    <span key={i} className="letter-cascade" style={{ '--delay': `${i * 0.15}s` }}>
      {letter}
    </span>
  ))}
</span>
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

  // Page 2 - Grammar Rules (with split animation)
  return (
    <div className="grammar-overlay">
      <div className="grammar-game-container split-animation">
        {/* Top half - 10 parts falling */}
        <div className="split-top">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`top-${i}`} className="split-piece split-piece-top" style={{ '--index': i }} />
          ))}
        </div>
        
        {/* Bottom half - 10 parts rising */}
        <div className="split-bottom">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={`bottom-${i}`} className="split-piece split-piece-bottom" style={{ '--index': i }} />
          ))}
        </div>

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
                      <img src={lipSingleImage} alt="Single Lip" style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                    </div>
                    <strong>Lip</strong>
                  </td>
                  <td><span className="emoji-large">💋</span> <strong>Lips</strong></td>
                </tr>
                <tr>
                  <td>
                    <span className="emoji-large">😊😊</span>
                    <strong>Cheek</strong>
                  </td>
                  <td>
                    <span className="emoji-large">😊</span>
                    <strong>Cheeks</strong>
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
