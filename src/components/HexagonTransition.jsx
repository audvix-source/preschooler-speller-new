import React, { useState, useEffect } from 'react';
import './HexagonTransition.css';

const HexagonTransition = ({ onAccept, onDecline, onSnooze, speak }) => {
  const [phase, setPhase] = useState('fullscreen'); // fullscreen → transition → prompt
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeferOptions, setShowDeferOptions] = useState(false);

  useEffect(() => {
    // Phase 1: Full screen octagons for 2 seconds
    const fullscreenTimer = setTimeout(() => {
      setPhase('transition');
    }, 2000);

    // Phase 2: Transition (split screen) for 1.5 seconds
    const transitionTimer = setTimeout(() => {
      setPhase('prompt');
      setShowPrompt(true);
    }, 3500); // 2000 + 1500

    // Phase 3: Show defer options 0.5s after prompt
    const deferTimer = setTimeout(() => {
      setShowDeferOptions(true);
    }, 4000);

    return () => {
      clearTimeout(fullscreenTimer);
      clearTimeout(transitionTimer);
      clearTimeout(deferTimer);
    };
  }, []);

  const handleAccept = () => {
    if (speak) speak("Awesome! Let's test your knowledge!");
    onAccept();
  };

  const handleDecline = () => {
    if (speak) speak("No problem! Keep learning!");
    onDecline();
  };

  const handleSnooze = (option) => {
    if (speak) {
      if (option === 'third') speak("Got it! I'll remind you after 1/3 of images.");
      else if (option === 'half') speak("Perfect! I'll remind you at halfway.");
      else speak("Sounds good! I'll remind you when you finish all images.");
    }
    onSnooze(option);
  };

  return (
    <div className="hexagon-overlay">
      {/* Phase 1 & 2: Octagon tiles background (always visible) */}
      <div className={`octagon-background ${phase === 'transition' ? 'split' : ''}`}>
        {/* Top half octagons */}
        <div className="octagon-section top">
          <div className="octagon-grid">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={`top-${i}`}
                className={`octagon-tile ${i % 2 === 0 ? 'color-a' : 'color-b'}`}
                style={{
                  animationDelay: `${(i * 0.05) % 2}s`,
                  animationDuration: `${1.2 + (i % 3) * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom half octagons */}
        <div className="octagon-section bottom">
          <div className="octagon-grid">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={`bottom-${i}`}
                className={`octagon-tile ${i % 2 === 0 ? 'color-a' : 'color-b'}`}
                style={{
                  animationDelay: `${(i * 0.05) % 2}s`,
                  animationDuration: `${1.2 + (i % 3) * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Phase 2 & 3: Main content area */}
      {phase !== 'fullscreen' && (
        <div className="content-area">
          {/* Light Gold Box - Main Prompt */}
          <div className="gold-box-container">
            <div className="gold-box">
              {showPrompt && (
                <div className="prompt-main-content">
                  <h1 className="animated-title">
                    {'Progress!'.split('').map((letter, i) => (
                      <span 
                        key={i} 
                        className="letter-pop"
                        style={{ 
                          animationDelay: `${i * 0.1}s`,
                          display: letter === ' ' ? 'inline' : 'inline-block'
                        }}
                      >
                        {letter}
                      </span>
                    ))}
                  </h1>

                  <p className="animated-message">
                    <span className="word-fade" style={{ animationDelay: '0.8s' }}>You've learned</span>{' '}
                    <span className="word-fade highlight-number" style={{ animationDelay: '1s' }}>5 letters</span>
                    <span className="word-fade" style={{ animationDelay: '1.2s' }}>!</span>
                    <br />
                    <span className="word-fade" style={{ animationDelay: '1.4s' }}>Ready for a quick challenge?</span>
                  </p>
                  
                  <div className="main-action-buttons">
                    <button 
                      className="action-btn btn-go" 
                      onClick={handleAccept}
                    >
                      <span className="btn-icon">🚀</span>
                      <span className="btn-text">Let's Go!</span>
                    </button>
                    <button 
                      className="action-btn btn-later" 
                      onClick={handleDecline}
                    >
                      <span className="btn-icon">⏭️</span>
                      <span className="btn-text">Later</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Defer Options Box - Half size, below main box */}
          {showDeferOptions && (
            <div className="defer-box-container">
              <div className="defer-box">
                <p className="defer-label">Or remind me after...</p>
                <div className="defer-options-grid">
                  <button 
                    className="defer-option-btn" 
                    onClick={() => handleSnooze('third')}
                  >
                    <span className="defer-fraction">1/3</span>
                    <span className="defer-desc">of images</span>
                  </button>
                  <button 
                    className="defer-option-btn" 
                    onClick={() => handleSnooze('half')}
                  >
                    <span className="defer-fraction">1/2</span>
                    <span className="defer-desc">of images</span>
                  </button>
                  <button 
                    className="defer-option-btn" 
                    onClick={() => handleSnooze('all')}
                  >
                    <span className="defer-fraction">✅</span>
                    <span className="defer-desc">All done</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HexagonTransition;