import React, { useState, useEffect, useRef } from 'react';
import './HexagonTransition.css';
import BeeAnimation from './BeeAnimation';
import './BeeAnimation.css';

// ── Snooze options per the quiz table ────────────────────────────────────────
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

// promptType:
//   'first'  — very first prompt ever, full experience with bee animation on Let's Go
//   'later'  — shown after Not Now / snooze fires (within session), full experience
//   'repeat' — shown after returning from menu and hitting 20 images again, lighter:
//              Let's Go fires immediately (no bee), defer options still show

const HexagonTransition = ({ onAccept, onDecline, onSnooze, speak, viewedCount = 20, promptType = 'first' }) => {
  const [phase, setPhase]                       = useState('fullscreen');
  const [showPrompt, setShowPrompt]             = useState(false);
  const [showDeferOptions, setShowDeferOptions] = useState(false);
  const [showBees, setShowBees]                 = useState(false);
  const [beeConfig, setBeeConfig]               = useState({ count: 20, size: 40, pattern: 'default' });
  const [expandedSnooze, setExpandedSnooze]     = useState(null);

  const pendingSnoozeRef = useRef(null);

  // For repeat mode, fire defer options a bit sooner
  const deferDelay = promptType === 'repeat' ? 600 : 1000;

  useEffect(() => {
    setPhase('transition');
    setShowPrompt(true);
    const t = setTimeout(() => setShowDeferOptions(true), deferDelay);
    return () => clearTimeout(t);
  }, []);

  // ── Let's Go ──────────────────────────────────────────────────────────────
  const handleAccept = () => {
    window.speechSynthesis.cancel();
    if (promptType === 'repeat') {
      // Lighter mode — no bee animation, fire immediately
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

  // ── Not Now ───────────────────────────────────────────────────────────────
  const handleDecline = () => {
    window.speechSynthesis.cancel();
    if (speak) speak("No problem! I'll remind you soon!");
    onDecline();
  };

  // ── Expand snooze button ──────────────────────────────────────────────────
  const handleSnoozeExpand = (option) => {
    setExpandedSnooze(prev => prev === option.value ? null : option.value);
  };

  // ── Pick Mixed or Picture Quiz ────────────────────────────────────────────
  const handleSnoozeTypeSelect = (option, quizType) => {
    window.speechSynthesis.cancel();
    setShowDeferOptions(false);
    setExpandedSnooze(null);
    pendingSnoozeRef.current = { value: option.value, quizSize: option.quizSize, quizType };

    if (promptType === 'repeat') {
      // No bee animation in repeat mode — fire snooze directly
      onSnooze(`taps:${option.value}`, option.quizSize, quizType);
    } else {
      setBeeConfig({ count: option.beeCount, size: option.beeSize, pattern: option.beePattern });
      setShowBees(true);
      const typeLabel = quizType === 'mc-only' ? 'picture quiz' : 'mixed quiz';
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

  // ── Prompt message per type ───────────────────────────────────────────────
  const renderMessage = () => {
    if (promptType === 'repeat') {
      return (
        <>
          <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.4s' }}>
            More pictures done!
          </span>
          <br />
          <span className="hexagon-transition__word-fade" style={{ animationDelay: '0.7s' }}>
            Want spelling, picture quiz, or mixed?
          </span>
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
    // 'first'
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

  // ── Snooze button renderer ────────────────────────────────────────────────
  const renderSnoozeButton = (option, isFullWidth = false) => {
    const isExpanded = expandedSnooze === option.value;
    const isGrayed   = expandedSnooze !== null && !isExpanded;

    return (
      <div
        key={option.value}
        className={`hexagon-transition__snooze-slot ${isFullWidth ? 'hexagon-transition__snooze-slot--full' : ''}`}
      >
        {!isExpanded ? (
          <button
            className={`hexagon-transition__defer-option-btn ${isGrayed ? 'hexagon-transition__defer-option-btn--grayed' : ''} ${isFullWidth ? 'hexagon-transition__defer-option-btn--full' : ''}`}
            onClick={() => !isGrayed && handleSnoozeExpand(option)}
            disabled={isGrayed}
          >
            <span className="hexagon-transition__defer-fraction">{option.label}</span>
            <span className="hexagon-transition__defer-desc">{option.desc} · {option.quizSize}-item quiz</span>
          </button>
        ) : (
          <div className={`hexagon-transition__snooze-expanded ${isFullWidth ? 'hexagon-transition__snooze-expanded--full' : ''}`}>
            <div className="hexagon-transition__snooze-expanded-label">
              {option.label} taps — pick quiz type:
            </div>
            <div className="hexagon-transition__snooze-sub-options">
              <button
                className="hexagon-transition__snooze-sub-btn hexagon-transition__snooze-sub-btn--mixed"
                onClick={() => handleSnoozeTypeSelect(option, 'mixed')}
              >
                <span className="hexagon-transition__snooze-sub-icon">✏️</span>
                <span className="hexagon-transition__snooze-sub-text">Mixed</span>
              </button>
              <button
                className="hexagon-transition__snooze-sub-btn hexagon-transition__snooze-sub-btn--mc"
                onClick={() => handleSnoozeTypeSelect(option, 'mc-only')}
              >
                <span className="hexagon-transition__snooze-sub-icon">🖼️</span>
                <span className="hexagon-transition__snooze-sub-text">Picture Quiz</span>
              </button>
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
                      <span
                        key={i}
                        className="hexagon-transition__letter-pop"
                        style={{ animationDelay: `${i * 0.1}s`, display: letter === ' ' ? 'inline' : 'inline-block' }}
                      >
                        {letter}
                      </span>
                    ))}
                  </h1>

                  <p className="hexagon-transition__animated-message">
                    {renderMessage()}
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
                <p className="hexagon-transition__defer-label">Or remind me after...</p>

                {/* Later — full width row */}
                <div className="hexagon-transition__defer-later-row">
                  {renderSnoozeButton(LATER_OPTION, true)}
                </div>

                {/* +30 / +40 / +50 / +60 — 2×2 grid */}
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