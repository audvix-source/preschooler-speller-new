import React, { useState, useEffect } from 'react';
import './HexagonTransition.css';
import BeeAnimation from './BeeAnimation';
import './BeeAnimation.css';

const HexagonTransition = ({ onAccept, onDecline, onSnooze, speak }) => {
  const [phase, setPhase] = useState('fullscreen'); // fullscreen → transition → prompt
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeferOptions, setShowDeferOptions] = useState(false);
  const [showBees, setShowBees] = useState(false);
  const [beeConfig, setBeeConfig] = useState({ count: 20, size: 40 });

  useEffect(() => {
    // Phase 1: Full screen hexagons for 2 seconds
    const fullscreenTimer = setTimeout(() => {
      setPhase('transition');
      // ✅ NEW: Show Progress box IMMEDIATELY when split starts (no delay!)
      setShowPrompt(true);
    }, 2000);

    // Phase 2: Transition (split screen) for 1.5 seconds
    const transitionTimer = setTimeout(() => {
      setPhase('prompt');
    }, 3500);

    // Phase 3: Show defer options 1s after split starts
    const deferTimer = setTimeout(() => {
      setShowDeferOptions(true);
    }, 3000); // 2s (fullscreen) + 1s = 3s total

    return () => {
      clearTimeout(fullscreenTimer);
      clearTimeout(transitionTimer);
      clearTimeout(deferTimer);
    };
  }, []);

  const handleAccept = () => {
    if (speak) speak("Awesome! Let's test your knowledge!");
    
    // Hide defer options and show bees
    setShowDeferOptions(false);
    setBeeConfig({ count: 20, size: 40 });
    setShowBees(true);
  };

  const handleDecline = () => {
    if (speak) speak("No problem! Keep learning!");
    onDecline();
  };

  const handleSnooze = (option) => {
    // Hide defer options
    setShowDeferOptions(false);
    
    // Configure bees based on snooze option
    const beeConfigs = {
      'quarter': { count: 35, size: 30 },
      'third': { count: 50, size: 24 },
      'half': { count: 70, size: 18 },
      'all': { count: 100, size: 14 }
    };
    
    const config = beeConfigs[option];
    setBeeConfig(config);
    setShowBees(true);
    
    // Speak appropriate message
    if (speak) {
      const messages = {
        'quarter': "Got it! I'll remind you after one-fourth of the images. That's about 7 letters and 65 images.",
        'third': "Got it! I'll remind you after one-third of the images. That's about 9 letters and 87 images.",
        'half': "Perfect! I'll remind you after one-half of the images. That's about 13 letters and 130 images.",
        'all': "Sounds good! I'll remind you when you finish all 26 letters and 260 images."
      };
      speak(messages[option]);
    }
  };

  const handleBeeAnimationComplete = () => {
    // Called when bee animation finishes
    if (beeConfig.count === 20) {
      onAccept();
    } else {
      const snoozeOptions = {
        35: 'quarter',
        50: 'third',
        70: 'half',
        100: 'all'
      };
      const option = snoozeOptions[beeConfig.count];
      onSnooze(option);
    }
  };

  return (
    <div className="hexagon-transition__overlay">
      {/* Phase 1 & 2: Honeycomb background (pure CSS) */}
      <div className={`hexagon-transition__honeycomb-bg ${phase === 'transition' ? 'split' : ''}`}>
        {/* Top half */}
        <div className="hexagon-transition__honeycomb-section top"></div>

        {/* Bottom half */}
        <div className="hexagon-transition__honeycomb-section bottom"></div>
      </div>

      {/* Bee Animation (shows after button click) */}
      {showBees && (
        <BeeAnimation
          beeCount={beeConfig.count}
          beeSize={beeConfig.size}
          onComplete={handleBeeAnimationComplete}
        />
      )}

      {/* Phase 3 & 4: Main content area */}
      {phase !== 'fullscreen' && (
        <div className="hexagon-transition__content-area">
          {/* Light Gold Box - Main Prompt */}
          <div className="hexagon-transition__gold-box-container">
            <div className="hexagon-transition__gold-box">
              {showPrompt && (
                <div className="hexagon-transition__prompt-main-content">
                  <h1 className="hexagon-transition__animated-title">
                    {'Progress!'.split('').map((letter, i) => (
                      <span 
                        key={i} 
                        className="hexagon-transition__letter-pop"
                        style={{ 
                          animationDelay: `${i * 0.1}s`,
                          display: letter === ' ' ? 'inline' : 'inline-block'
                        }}
                      >
                        {letter}
                      </span>
                    ))}
                  </h1>

                  <p className="hexagon-transition__animated-message">
                    <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.8s' }}>You've learned</span>{' '}
                    <span className="hexagon-transition__word-fade hexagon-transition__highlight-number" style={{ animationDelay: '1s' }}>5 letters</span>
                    <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.2s' }}>!</span>
                    <br />
                    <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.4s' }}>Ready for a quick challenge?</span>
                  </p>

                  <div className="hexagon-transition__main-action-buttons">
                    <button 
                      className="hexagon-transition__action-btn hexagon-transition__btn-go" 
                      onClick={handleAccept}
                    >
                      <span className="hexagon-transition__btn-icon">🚀</span>
                      <span className="hexagon-transition__btn-text">Let's Go!</span>
                    </button>
                    <button 
                      className="hexagon-transition__action-btn hexagon-transition__btn-later" 
                      onClick={handleDecline}
                    >
                      <span className="hexagon-transition__btn-icon">⏭️</span>
                      <span className="hexagon-transition__btn-text">Later</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Defer Options Box */}
          {showDeferOptions && (
            <div className="hexagon-transition__defer-box-container">
              <div className="hexagon-transition__defer-box">
                <p className="hexagon-transition__defer-label">Or remind me after...</p>
                <div className="hexagon-transition__defer-options-grid">
                  <button 
                    className="hexagon-transition__defer-option-btn" 
                    onClick={() => handleSnooze('quarter')}
                  >
                    <span className="hexagon-transition__defer-fraction">1/4</span>
                    <span className="hexagon-transition__defer-desc">of images</span>
                  </button>
                  <button 
                    className="hexagon-transition__defer-option-btn" 
                    onClick={() => handleSnooze('third')}
                  >
                    <span className="hexagon-transition__defer-fraction">1/3</span>
                    <span className="hexagon-transition__defer-desc">of images</span>
                  </button>
                  <button 
                    className="hexagon-transition__defer-option-btn" 
                    onClick={() => handleSnooze('half')}
                  >
                    <span className="hexagon-transition__defer-fraction">1/2</span>
                    <span className="hexagon-transition__defer-desc">of images</span>
                  </button>
                  <button 
                    className="hexagon-transition__defer-option-btn" 
                    onClick={() => handleSnooze('all')}
                  >
                    <span className="hexagon-transition__defer-fraction">✅</span>
                    <span className="hexagon-transition__defer-desc">All done</span>
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