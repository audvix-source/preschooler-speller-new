import React, { useState, useEffect } from 'react';
import './HexagonTransition.css';

const HexagonTransition = ({ onAccept, onDecline, onSnooze, speak }) => {
  const [phase, setPhase] = useState('fullscreen'); // fullscreen → transition → prompt
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Phase 1: Full screen hexagons for 2 seconds
    const fullscreenTimer = setTimeout(() => {
      setPhase('transition');
    }, 2000);

    // Phase 2: Transition (split screen) for 1.5 seconds
    const transitionTimer = setTimeout(() => {
      setPhase('prompt');
      setShowPrompt(true);
    }, 3500); // 2000 + 1500

    return () => {
      clearTimeout(fullscreenTimer);
      clearTimeout(transitionTimer);
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
      if (option === 'half') speak("Got it! I'll remind you at 20 images.");
      else speak("Perfect! I'll remind you when you finish all letters.");
    }
    onSnooze(option);
  };

  return (
    <div className="hexagon-overlay">
      {/* Phase 1 & 2: Hexagon tiles background (always visible) */}
      <div className={`hexagon-background ${phase === 'transition' ? 'split' : ''}`}>
        {/* Top half hexagons */}
        <div className="hexagon-section top">
          <div className="hexagon-touching-grid">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={`top-${i}`}
                className="hexagon-tile-touching"
                style={{
                  animationDelay: `${(i * 0.05) % 2}s`,
                  animationDuration: `${1.2 + (i % 3) * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Bottom half hexagons */}
        <div className="hexagon-section bottom">
          <div className="hexagon-touching-grid">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={`bottom-${i}`}
                className="hexagon-tile-touching"
                style={{
                  animationDelay: `${(i * 0.05) % 2}s`,
                  animationDuration: `${1.2 + (i % 3) * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Phase 2 & 3: White box - FULL HEIGHT (50%) with ALL content inside */}
      {phase !== 'fullscreen' && (
        <div className="white-box-fullheight-container">
          {/* Radial gradient pulse background */}
          <div className="radial-pulse-bg"></div>
          
          <div className="white-box-fullheight">
            {/* Phase 3: ALL content appears at once with animations */}
            {showPrompt && (
              <div className="prompt-all-in-one">
                {/* Main title with letter animation */}
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

                {/* Message with word animation */}
                <p className="animated-message">
                  <span className="word-fade" style={{ animationDelay: '0.8s' }}>You've learned</span>{' '}
                  <span className="word-fade highlight-number" style={{ animationDelay: '1s' }}>5 letters</span>
                  <span className="word-fade" style={{ animationDelay: '1.2s' }}>!</span>
                  <br />
                  <span className="word-fade" style={{ animationDelay: '1.4s' }}>Ready for a quick challenge?</span>
                </p>
                
                {/* Main action buttons */}
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

                {/* Elegant divider */}
                <div className="elegant-divider">
                  <span className="divider-line"></span>
                  <span className="divider-text">or defer until</span>
                  <span className="divider-line"></span>
                </div>

                {/* Defer/Snooze options */}
                <div className="defer-options">
                  <button 
                    className="defer-btn" 
                    onClick={() => handleSnooze('half')}
                  >
                    <span className="defer-icon">📊</span>
                    <span className="defer-text">20 images explored</span>
                  </button>
                  <button 
                    className="defer-btn" 
                    onClick={() => handleSnooze('complete')}
                  >
                    <span className="defer-icon">✅</span>
                    <span className="defer-text">All letters complete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HexagonTransition;