import React, { useState, useEffect, useRef } from 'react';
import './ListeningChallenge.css';

const SAFE_COLORS = [
  '#B3E5FC', '#C8E6C9', '#FFF9C4', '#D1C4E9',
  '#B2EBF2', '#DCEDC8', '#FFE0B2', '#CFD8DC',
  '#E1F5FE', '#F0F4C3', '#D7CCC8', '#B2DFDB',
  '#FFECB3', '#C5CAE9',
];

function pickDistinctColors(n) {
  return [...SAFE_COLORS].sort(() => Math.random() - 0.5).slice(0, n);
}

function ListeningChallenge({ word, wordImage, allWords, onAnswer, speak }) {
  const [choices,        setChoices]        = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback,   setShowFeedback]   = useState(false);
  const [isLocked,       setIsLocked]       = useState(false);
  const [isPlaying,      setIsPlaying]      = useState(false);
  const [hasPlayed,      setHasPlayed]      = useState(false);

  const slotColors = useRef(pickDistinctColors(4));

  useEffect(() => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setIsLocked(false);
    setHasPlayed(false);
    setIsPlaying(false);
    slotColors.current = pickDistinctColors(4);
  }, [word]);

  useEffect(() => {
    if (isLocked) return;
    if (!wordImage) {
      console.warn(`ListeningChallenge: No image for "${word}" — skipping`);
      setTimeout(() => onAnswer(true), 100);
      return;
    }

    const correctChoice = { word, image: wordImage, isCorrect: true };
    const otherWords = allWords.filter(w => {
      if (w.word.toLowerCase() === word.toLowerCase()) return false;
      if (!w.image) return false;
      return true;
    });

    const validWrong = [...otherWords].sort(() => Math.random() - 0.5)
      .slice(0, 3).map(w => ({ word: w.word, image: w.image, isCorrect: false }));

    if (validWrong.length < 3) {
      console.warn(`ListeningChallenge: Not enough wrong choices for "${word}" — skipping`);
      setTimeout(() => onAnswer(true), 100);
      return;
    }

    const allChoices = [correctChoice, ...validWrong].sort(() => Math.random() - 0.5);
    if (!allChoices.some(c => c.word.toLowerCase() === word.toLowerCase())) allChoices[0] = correctChoice;
    setChoices(allChoices);
  }, [word, wordImage, allWords, isLocked, onAnswer]);

  const playWord = () => {
    if (!speak) return;
    setIsPlaying(true);
    setHasPlayed(true);
    speak(`Which one is the ${word}?`);
    const syllables = word.replace(/[^aeiouy]/gi, '').length || 1;
    setTimeout(() => setIsPlaying(false), 1200 + syllables * 300);
  };

  const handleChoiceClick = (choice) => {
    if (showFeedback || isLocked || !hasPlayed) return;
    setIsLocked(true);
    setSelectedChoice(choice);
    setShowFeedback(true);
    if (speak) {
      if (choice.isCorrect) {
        const praise = ['Correct!', 'Well done!', "That's right!", 'Great job!', 'You got it!'];
        speak(praise[Math.floor(Math.random() * praise.length)]);
      } else {
        speak(`Not quite! The one with the check mark is the ${word}.`);
      }
    }
    setTimeout(() => onAnswer(choice.isCorrect), 1500);
  };

  // ── Inline grid — same approach as RecognitionChallenge ──────────────────
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: '10px',
    width: '100%',
    padding: '6px',
    boxSizing: 'border-box',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden',
  };

  const getBoxStyle = (isSelected, isCorrect, bgColor, locked) => {
    let background = bgColor || '#F5F5F5';
    let border     = '4px solid #E0E0E0';
    let boxShadow  = '0 3px 10px rgba(0,0,0,0.1)';
    let opacity    = locked ? 0.45 : 1;
    let filter     = locked ? 'grayscale(30%)' : 'none';

    if (showFeedback && isSelected && isCorrect) {
      background = '#C8E6C9'; border = '5px solid #28A745';
      boxShadow  = '0 0 25px rgba(40,167,69,0.6)';
      opacity = 1; filter = 'none';
    } else if (showFeedback && isSelected && !isCorrect) {
      background = '#FFCDD2'; border = '5px solid #DC3545';
      boxShadow  = '0 0 25px rgba(220,53,69,0.6)';
      opacity = 1; filter = 'none';
    } else if (showFeedback && !isSelected && isCorrect) {
      background = '#C8E6C9'; border = '5px solid #28A745';
      boxShadow  = '0 0 25px rgba(40,167,69,0.6)';
      opacity = 1; filter = 'none';
    }

    return {
      position: 'relative',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: locked ? 'default' : 'pointer',
      overflow: 'hidden',
      background,
      border,
      boxShadow,
      opacity,
      filter,
      minHeight: 0,
      minWidth: 0,
      transition: 'opacity 0.3s ease, filter 0.3s ease',
      pointerEvents: locked ? 'none' : 'auto',
    };
  };

  return (
    <div className="listening-challenge">
      {/* Speaker top box */}
      <div className="listening-header">
        <div
          className={`listening-speaker-btn ${isPlaying ? 'listening-speaker-btn--playing' : !hasPlayed ? 'listening-speaker-btn--waiting' : ''}`}
          onClick={playWord}
          title="Tap to hear the word"
        >
          <span className="listening-speaker-icon">🔊</span>
        </div>
      </div>

      {/* Inline-styled 2×2 grid */}
      <div style={gridStyle}>
        {choices.map((choice, index) => {
          const isSelected = selectedChoice?.word === choice.word;
          const isCorrect  = choice.isCorrect;
          const isNecklace = choice.image?.toString().includes('necklace-emoji');
          const bgColor    = showFeedback ? undefined
            : isNecklace ? '#2C2C2C' : slotColors.current[index];
          const locked     = !hasPlayed && !showFeedback;

          return (
            <div
              key={index}
              style={getBoxStyle(isSelected, isCorrect, bgColor, locked)}
              onClick={() => handleChoiceClick(choice)}
            >
              <img
                src={choice.image}
                alt=""
                style={{
                  width: '82%',
                  height: '82%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
                  display: 'block',
                }}
              />
              {showFeedback && isSelected && (
                <div className={`feedback-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
              )}
              {showFeedback && !isSelected && isCorrect && (
                <div className="feedback-badge correct-answer-badge">✓</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ListeningChallenge;