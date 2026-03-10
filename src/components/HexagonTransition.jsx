import React, { useState, useEffect, useRef } from 'react';
import './HexagonTransition.css';
import BeeAnimation from './BeeAnimation';
import './BeeAnimation.css';

const HexagonTransition = ({ onAccept, onDecline, onSnooze, speak, viewedCount = 30, promptType = 'first' }) => {
  const [phase, setPhase] = useState('fullscreen');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeferOptions, setShowDeferOptions] = useState(false);
  const [showBees, setShowBees] = useState(false);
  const [beeConfig, setBeeConfig] = useState({ count: 20, size: 40, pattern: 'default' });

  useEffect(() => {
    setPhase('transition');
    setShowPrompt(true);
    
    const deferTimer = setTimeout(() => {
      setShowDeferOptions(true);
    }, 1000);

    return () => {
      clearTimeout(deferTimer);
    };
  }, []);

  const handleAccept = () => {
    window.speechSynthesis.cancel();
    if (speak) speak("Awesome! Let's test your knowledge!");
    setShowDeferOptions(false);
    setBeeConfig({ count: 20, size: 40, pattern: 'default' });
    setShowBees(true);
  };

  const handleDecline = () => {
    window.speechSynthesis.cancel();
    if (speak) speak("No problem! I'll remind you soon!");
    onDecline(); // snoozes 15 images
  };

  const handleSnooze = (option) => {
    window.speechSynthesis.cancel();
    setShowDeferOptions(false);
    
    const beeConfigs = {
      'quarter': { count: 50, size: 28, pattern: 'quarter' },
      'third':   { count: 60, size: 22, pattern: 'third' },
      'half':    { count: 80, size: 17, pattern: 'half' },
      'all':     { count: 120, size: 13, pattern: 'all' }
    };
    
    const config = beeConfigs[option];
    setBeeConfig(config);
    setShowBees(true);
    
    if (speak) {
      const messages = {
        'quarter': "Got it! I'll ask you again when you're a quarter of the way through!",
        'third':   "Got it! I'll ask you again when you're a third of the way through!",
        'half':    "Perfect! I'll ask you again when you're halfway through!",
        'all':     "Sounds good! I'll ask you when you've seen all the pictures!"
      };
      speak(messages[option]);
    }
  };

  const handleBeeAnimationComplete = () => {
    if (beeConfig.count === 20) {
      onAccept();
    } else {
      const snoozeOptions = {
        50: 'quarter',
        60: 'third',
        80: 'half',
        120: 'all'
      };
      const option = snoozeOptions[beeConfig.count];
      onSnooze(option);
    }
  };

  return (
    <div className="hexagon-transition__overlay">
      <div className={`hexagon-transition__honeycomb-bg ${phase === 'transition' ? 'split' : ''}`}>
        <div className="hexagon-transition__honeycomb-section top"></div>
        <div className="hexagon-transition__honeycomb-section bottom"></div>
      </div>

      {showBees && (
        <BeeAnimation
          beeCount={beeConfig.count}
          beeSize={beeConfig.size}
          flightPattern={beeConfig.pattern}
          onComplete={handleBeeAnimationComplete}
        />
      )}

      {phase !== 'fullscreen' && (
        <div className="hexagon-transition__content-area">
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
                    {promptType === 'later' ? (
                      <>
                        <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.8s' }}>15 more pictures done!</span>
                        <br />
                        <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.2s' }}>Ready to try now?</span>
                      </>
                    ) : (
                      <>
                        <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.8s' }}>You've seen</span>{' '}
                        <span className="hexagon-transition__word-fade hexagon-transition__highlight-number" style={{ animationDelay: '1s' }}>{viewedCount} pictures</span>
                        <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.2s' }}>!</span>
                        <br />
                        <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.4s' }}>Ready for a quick challenge?</span>
                      </>
                    )}
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

          {showDeferOptions && (
            <div className="hexagon-transition__defer-box-container">
              <div className="hexagon-transition__defer-box">
                <p className="hexagon-transition__defer-label">Or remind me after...</p>
                
                <p className="hexagon-transition__heads-up">
                  💡 <strong>Changed your mind?</strong><br />
                  Go back to the menu and tap<br />
                  <strong>Alphabet Fun</strong> again to reset!
                </p>
                
                <div className="hexagon-transition__defer-options-grid">
                  <button 
                    className="hexagon-transition__defer-option-btn" 
                    onClick={() => handleSnooze('quarter')}
                  >
                    <span className="hexagon-transition__defer-fraction">1/4</span>
                    <span className="hexagon-transition__defer-desc">of pictures</span>
                  </button>
                  <button 
                    className="hexagon-transition__defer-option-btn" 
                    onClick={() => handleSnooze('third')}
                  >
                    <span className="hexagon-transition__defer-fraction">1/3</span>
                    <span className="hexagon-transition__defer-desc">of pictures</span>
                  </button>
                  <button 
                    className="hexagon-transition__defer-option-btn" 
                    onClick={() => handleSnooze('half')}
                  >
                    <span className="hexagon-transition__defer-fraction">1/2</span>
                    <span className="hexagon-transition__defer-desc">of pictures</span>
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