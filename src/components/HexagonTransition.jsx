import React, { useState, useEffect, useRef } from 'react';
import './HexagonTransition.css';
import BeeAnimation from './BeeAnimation';
import './BeeAnimation.css';

// Snooze options: +20/30/40/50 taps, each with distinct bee swarm and quiz size
const SNOOZE_OPTIONS = [
  { label: '+20',  desc: 'taps', value: 20, quizSize: 5,  beeCount: 25,  beeSize: 36, beePattern: 'default' },
  { label: '+30',  desc: 'taps', value: 30, quizSize: 10, beeCount: 45,  beeSize: 28, beePattern: 'default' },
  { label: '+40',  desc: 'taps', value: 40, quizSize: 15, beeCount: 70,  beeSize: 22, beePattern: 'default' },
  { label: '+50',  desc: 'taps', value: 50, quizSize: 20, beeCount: 100, beeSize: 17, beePattern: 'default' },
];

const HexagonTransition = ({ onAccept, onDecline, onSnooze, speak, viewedCount = 30, promptType = 'first' }) => {
  const [phase, setPhase] = useState('fullscreen');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDeferOptions, setShowDeferOptions] = useState(false);
  const [showBees, setShowBees] = useState(false);
  const [beeConfig, setBeeConfig] = useState({ count: 20, size: 40, pattern: 'default' });
  const pendingSnoozeRef = useRef(null); // stores { value, quizSize } for after bee animation

  useEffect(() => {
    setPhase('transition');
    setShowPrompt(true);
    const deferTimer = setTimeout(() => setShowDeferOptions(true), 1000);
    return () => clearTimeout(deferTimer);
  }, []);

  const handleAccept = () => {
    window.speechSynthesis.cancel();
    if (speak) speak("Awesome! Let's test your knowledge!");
    setShowDeferOptions(false);
    pendingSnoozeRef.current = null; // null = Let's Go → 5-question quiz
    setBeeConfig({ count: 20, size: 40, pattern: 'default' });
    setShowBees(true);
  };

  const handleDecline = () => {
    window.speechSynthesis.cancel();
    if (speak) speak("No problem! I'll remind you soon!");
    onDecline(); // parent handles +15 taps snooze, 5-question quiz
  };

  const handleSnooze = (option) => {
    window.speechSynthesis.cancel();
    setShowDeferOptions(false);
    pendingSnoozeRef.current = { value: option.value, quizSize: option.quizSize };
    setBeeConfig({ count: option.beeCount, size: option.beeSize, pattern: option.beePattern });
    setShowBees(true);
    if (speak) speak(`Got it! I'll remind you after ${option.value} more taps!`);
  };

  const handleBeeAnimationComplete = () => {
    if (pendingSnoozeRef.current === null) {
      onAccept(5); // Let's Go → always 5 questions
    } else {
      const { value, quizSize } = pendingSnoozeRef.current;
      onSnooze(`taps:${value}`, quizSize); // e.g. "taps:30", 10
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
                        <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.8s' }}>More pictures done!</span>
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
                <div className="hexagon-transition__defer-options-grid">
                  {SNOOZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      className="hexagon-transition__defer-option-btn"
                      onClick={() => handleSnooze(option)}
                    >
                      <span className="hexagon-transition__defer-fraction">{option.label}</span>
                      <span className="hexagon-transition__defer-desc">{option.desc}</span>
                      <span className="hexagon-transition__defer-quiz-size">{option.quizSize}-item quiz</span>
                    </button>
                  ))}
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