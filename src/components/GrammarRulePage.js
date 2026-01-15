import React, { useState, useEffect } from 'react';
import './GrammarRulePage.css';
import lipSingleImage from '../assets/lip-single.png';
import cheekSingleImage from '../assets/cheek-single.png';
import cheeksImage from '../assets/cheeks.png';
import chestImage from '../assets/treasure-chest.png'; // Your uploaded chest image

function GrammarRulePage({ onContinue, speak, skipCelebration }) {
  const [showRules, setShowRules] = useState(false);
  const [showTileAnimation, setShowTileAnimation] = useState(false);
  const [showChestScreen, setShowChestScreen] = useState(false);
  const [fireworks, setFireworks] = useState([]);
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

  // Fireworks and confetti management for perfect score
  useEffect(() => {
    let fireworksInterval;
    let confettiInterval;
   
    if (!showRules && !skipCelebration) {
      // FIREWORKS - Explode at same height in sky
      fireworksInterval = setInterval(() => {
        // First pair - outer fireworks
        setTimeout(() => {
          setFireworks([
            { id: Date.now(), left: 15, delay: 0 },
            { id: Date.now() + 1, left: 85, delay: 0 }
          ]);
        }, 0);

        // Second pair - center fireworks (500ms later)
        setTimeout(() => {
          setFireworks(prev => [
            ...prev,
            { id: Date.now() + 2, left: 35, delay: 0 },
            { id: Date.now() + 3, left: 65, delay: 0 }
          ]);
        }, 500);

        // Clear all fireworks after animations
        setTimeout(() => setFireworks([]), 2500);
      }, 3500); // Repeat every 3.5 seconds

      // CONFETTI - Start falling after fireworks explode
      confettiInterval = setInterval(() => {
        // First wave
        setTimeout(() => {
          setConfettiWaves([{ id: Date.now(), wave: 1 }]);
        }, 1000);

        // Second wave (500ms later)
        setTimeout(() => {
          setConfettiWaves(prev => [...prev, { id: Date.now() + 1, wave: 2 }]);
        }, 1500);

        // Clear confetti
        setTimeout(() => setConfettiWaves([]), 3000);
      }, 3500);
    }

    return () => {
      if (fireworksInterval) clearInterval(fireworksInterval);
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
        {/* Floating coins background */}
        <div className="floating-coins">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="coin"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            >
              🪙
            </div>
          ))}
        </div>

        {/* Pirate decorations */}
        <div className="pirate-decorations">
          <div className="pirate-item">🏴‍☠️</div>
          <div className="pirate-item">⚓</div>
          <div className="pirate-item">🗡️</div>
          <div className="pirate-item">🦜</div>
        </div>

        {/* Sparkle effects */}
        <div className="sparkle-effects">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`
              }}
            >
              ✨
            </div>
          ))}
        </div>

        <div className="chest-container">
          <div className="chest-image-wrapper">
            <div className="chest-glow-pulse"></div>
            <div className="treasure-rays"></div>
            <div className="chest-real">
              <img src={chestImage} alt="Treasure Chest" />
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
        {/* Fireworks Explosions */}
        <div className="fireworks-container">
          {fireworks.map(fw => (
            <div
              key={fw.id}
              className="firework"
              style={{
                left: `${fw.left}%`,
                animationDelay: `${fw.delay}s`
              }}
            >
              🎆
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

  // Page 2 - Grammar Rules
  return (
    <div className="grammar-overlay">
      <div className="grammar-game-container grow-animation">
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
                    <div className="emoji-image-container">
                      <img src={lipSingleImage} alt="Single Lip" />
                    </div>
                    <strong>Lip</strong>
                  </td>
                  <td><span className="emoji-large">💋</span> <strong>Lips</strong></td>
                </tr>
                <tr>
                  <td>
                    <div className="emoji-image-container" style={{ height: '85px' }}>
                      <img src={cheekSingleImage} alt="Single Cheek" className="cheek-image-large" />
                    </div>
                    <strong>Cheek</strong>
                    <span className="example-small">(either left or right)</span>
                  </td>
                  <td>
                    <div className="emoji-image-container">
                      <img src={cheeksImage} alt="Both Cheeks" />
                    </div>
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
                <span className="special-text-game">
                  <strong>Hair</strong> stays <strong>Hair</strong>
                  <span className="sub-rule">But for actual number of strands more than one, it's ok to say "3 white hair<strong>s</strong>"</span>
                </span>
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