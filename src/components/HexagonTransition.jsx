import React, { useState, useEffect, useRef } from 'react';
import './HexagonTransition.css';
import BeeAnimation from './BeeAnimation';
import './BeeAnimation.css';

const LATER_OPTION = {
  label: 'Later', desc: 'taps', value: 20, quizSize: 10,
  beeCount: 30, beeSize: 32, beePattern: 'default'
};

const SNOOZE_OPTIONS = [
  { label: '+30', desc: 'taps', value: 30, quizSize: 15, beeCount: 45,  beeSize: 28, beePattern: 'default' },
  { label: '+40', desc: 'taps', value: 40, quizSize: 20, beeCount: 70,  beeSize: 22, beePattern: 'default' },
  { label: '+50', desc: 'taps', value: 50, quizSize: 25, beeCount: 100, beeSize: 17, beePattern: 'default' },
  { label: '+60', desc: 'taps', value: 60, quizSize: 30, beeCount: 130, beeSize: 14, beePattern: 'default' },
];

// 4 quiz types shown in the expanded snooze slot
const QUIZ_TYPE_OPTIONS = [
  { quizType: 'mixed',     icon: '✏️',  label: 'Mixed',       cls: 'hexagon-transition__snooze-sub-btn--mixed' },
  { quizType: 'mc-only',   icon: '🖼️',  label: 'Picture Quiz', cls: 'hexagon-transition__snooze-sub-btn--mc' },
  { quizType: 'listening', icon: '🔊',  label: 'Listening',    cls: 'hexagon-transition__snooze-sub-btn--listening' },
  { quizType: 'reading',   icon: '📖',  label: 'Reading',      cls: 'hexagon-transition__snooze-sub-btn--reading' },
];

const HexagonTransition = ({ onAccept, onDecline, onSnooze, speak, viewedCount = 20, promptType = 'first' }) => {
  const [phase, setPhase]                       = useState('fullscreen');
  const [showPrompt, setShowPrompt]             = useState(false);
  const [showDeferOptions, setShowDeferOptions] = useState(false);
  const [showBees, setShowBees]                 = useState(false);
  const [beeConfig, setBeeConfig]               = useState({ count: 20, size: 40, pattern: 'default' });
  const [expandedSnooze, setExpandedSnooze]     = useState(null);

  const pendingSnoozeRef = useRef(null);
  const deferDelay = promptType === 'repeat' ? 600 : 1000;

  useEffect(() => {
    setPhase('transition');
    setShowPrompt(true);
    const t = setTimeout(() => setShowDeferOptions(true), deferDelay);
    return () => clearTimeout(t);
  }, []);

  const handleAccept = () => {
    window.speechSynthesis.cancel();
    if (promptType === 'repeat') {
      if (speak) speak("Let's go!");
      onAccept(5);
    } else {
      if (speak) speak("Awesome! Let's test your knowledge!");
      setShowDeferOptions(false);
      setExpandedSnooze(null);
      pendingSnoozeRef.current = null;
      setBeeConfig({ count: 20, size: 40, pattern: 'default' });
      setShowBees(true);
    }
  };

  const handleDecline = () => {
    window.speechSynthesis.cancel();
    if (speak) speak("No problem! I'll remind you soon!");
    onDecline();
  };

  const handleSnoozeExpand = (option) => {
    setExpandedSnooze(prev => prev === option.value ? null : option.value);
  };

  const handleSnoozeTypeSelect = (option, quizType) => {
    window.speechSynthesis.cancel();
    setShowDeferOptions(false);
    setExpandedSnooze(null);
    pendingSnoozeRef.current = { value: option.value, quizSize: option.quizSize, quizType };

    if (promptType === 'repeat') {
      onSnooze(`taps:${option.value}`, option.quizSize, quizType);
    } else {
      setBeeConfig({ count: option.beeCount, size: option.beeSize, pattern: option.beePattern });
      setShowBees(true);
      const typeLabel = { 'mc-only': 'picture quiz', 'listening': 'listening quiz', 'reading': 'reading quiz' }[quizType] || 'mixed quiz';
      if (speak) speak(`Got it! ${typeLabel} after ${option.value} more taps!`);
    }
  };

  const handleBeeAnimationComplete = () => {
    if (pendingSnoozeRef.current === null) {
      onAccept(5);
    } else {
      const { value, quizSize, quizType } = pendingSnoozeRef.current;
      onSnooze(`taps:${value}`, quizSize, quizType);
    }
  };

  const renderMessage = () => {
    if (promptType === 'repeat') {
      return (
        <>
          <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.4s' }}>More pictures done!</span>
          <br />
          <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.7s' }}>Want spelling, picture quiz, or mixed?</span>
        </>
      );
    }
    if (promptType === 'later') {
      return (
        <>
          <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.8s' }}>More pictures done!</span>
          <br />
          <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.2s' }}>Ready to try now?</span>
        </>
      );
    }
    return (
      <>
        <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.8s' }}>You've seen</span>{' '}
        <span className="hexagon-transition__word-fade hexagon-transition__highlight-number" style={{ animationDelay: '1s' }}>{viewedCount} pictures</span>
        <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.2s' }}>!</span>
        <br />
        <span className="hexagon-transition__word-fade" style={{ animationDelay: '1.4s' }}>Ready for a quick challenge?</span>
      </>
    );
  };

  const renderSnoozeButton = (option, isFullWidth = false) => {
    const isExpanded = expandedSnooze === option.value;
    const isGrayed   = expandedSnooze !== null && !isExpanded;

    // Hide grayed slots entirely so the grid reflows naturally
    if (isGrayed) return (
      <div
        key={option.value}
        className="hexagon-transition__snooze-slot"
        style={{ display: 'none' }}
      />
    );

    return (
      <div
        key={option.value}
        className={`hexagon-transition__snooze-slot ${isFullWidth || isExpanded ? 'hexagon-transition__snooze-slot--full' : ''}`}
        style={isExpanded ? { gridColumn: '1 / -1' } : undefined}
      >
        {!isExpanded ? (
          <button
            className={`hexagon-transition__defer-option-btn ${isFullWidth ? 'hexagon-transition__defer-option-btn--full' : ''}`}
            onClick={() => handleSnoozeExpand(option)}
          >
            <span className="hexagon-transition__defer-fraction">{option.label}</span>
            <span className="hexagon-transition__defer-desc">{option.desc} · {option.quizSize}-item quiz</span>
          </button>
        ) : (
          <div className="hexagon-transition__snooze-expanded hexagon-transition__snooze-expanded--full">
            <div className="hexagon-transition__snooze-expanded-label">
              {option.label} taps — pick a quiz type:
            </div>
            <div className="hexagon-transition__snooze-sub-options hexagon-transition__snooze-sub-options--grid">
              {QUIZ_TYPE_OPTIONS.map(qt => (
                <button
                  key={qt.quizType}
                  className={`hexagon-transition__snooze-sub-btn ${qt.cls}`}
                  onClick={() => handleSnoozeTypeSelect(option, qt.quizType)}
                >
                  <span className="hexagon-transition__snooze-sub-icon">{qt.icon}</span>
                  <span className="hexagon-transition__snooze-sub-text">{qt.label}</span>
                </button>
              ))}
            </div>
            <button
              className="hexagon-transition__snooze-collapse-btn"
              onClick={() => setExpandedSnooze(null)}
            >✕</button>
          </div>
        )}
      </div>
    );
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
                      <span key={i} className="hexagon-transition__letter-pop"
                        style={{ animationDelay: `${i * 0.1}s`, display: letter === ' ' ? 'inline' : 'inline-block' }}>
                        {letter}
                      </span>
                    ))}
                  </h1>
                  <p className="hexagon-transition__animated-message">{renderMessage()}</p>
                  <div className="hexagon-transition__main-action-buttons">
                    <button className="hexagon-transition__action-btn hexagon-transition__btn-go" onClick={handleAccept}>
                      <span className="hexagon-transition__btn-icon">🚀</span>
                      <span className="hexagon-transition__btn-text">Let's Go!</span>
                    </button>
                    <button className="hexagon-transition__action-btn hexagon-transition__btn-later" onClick={handleDecline}>
                      <span className="hexagon-transition__btn-icon">⏭️</span>
                      <span className="hexagon-transition__btn-text">Not Now</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {showDeferOptions && (
            <div className="hexagon-transition__defer-box-container">
              <div className="hexagon-transition__defer-box">
                <p className="hexagon-transition__defer-label">Or remind me...</p>
                {/* Later — full width row, hidden when a grid slot is expanded */}
                {expandedSnooze === null || expandedSnooze === LATER_OPTION.value ? (
                  <div className="hexagon-transition__defer-later-row">
                    {renderSnoozeButton(LATER_OPTION, true)}
                  </div>
                ) : null}
                {/* "Or, after..." label above the 2×2 grid — hidden when Later is expanded */}
                {(expandedSnooze === null || expandedSnooze !== LATER_OPTION.value) && (
                  <p className="hexagon-transition__defer-or-after">Or, after...</p>
                )}
                <div className="hexagon-transition__defer-options-grid">
                  {SNOOZE_OPTIONS.map(option => renderSnoozeButton(option, false))}
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