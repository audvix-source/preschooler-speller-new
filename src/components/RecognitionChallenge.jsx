import React, { useState, useEffect, useRef } from 'react';
import './RecognitionChallenge.css';

const SAFE_COLORS = [
  '#B3E5FC', '#C8E6C9', '#FFF9C4', '#D1C4E9',
  '#B2EBF2', '#DCEDC8', '#FFE0B2', '#CFD8DC',
  '#E1F5FE', '#F0F4C3', '#D7CCC8', '#B2DFDB',
  '#FFECB3', '#C5CAE9',
];

function pickDistinctColors(n) {
  return [...SAFE_COLORS].sort(() => Math.random() - 0.5).slice(0, n);
}

function RecognitionChallenge({ word, wordImage, allWords, onAnswer, speak, hideSpeaker = false }) {
  const [choices,        setChoices]        = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback,   setShowFeedback]   = useState(false);
  const [isLocked,       setIsLocked]       = useState(false);

  const slotColors = useRef(pickDistinctColors(4));

  useEffect(() => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setIsLocked(false);
    slotColors.current = pickDistinctColors(4);
  }, [word]);

  useEffect(() => {
    if (isLocked) return;

    if (!wordImage) {
      console.warn(`No image for: ${word} - skipping`);
      setTimeout(() => onAnswer(true), 100);
      return;
    }

    const correctChoice = { word, image: wordImage, isCorrect: true };
    const CAT_KITTEN = { 'cat': 'kitten', 'kitten': 'cat' };
const excluded = CAT_KITTEN[word.toLowerCase()];

const otherWords = allWords.filter(w => {
  if (w.word.toLowerCase() === word.toLowerCase()) return false;
  if (excluded && w.word.toLowerCase() === excluded) return false;
  if (!w.image) return false;
  return true;
});

    const shuffled     = [...otherWords].sort(() => Math.random() - 0.5);
    const wrongChoices = shuffled.filter(w => w.image != null).slice(0, 3)
      .map(w => ({ word: w.word, image: w.image, isCorrect: false }));

    if (wrongChoices.length < 3) {
      console.warn(`Not enough wrong choices for: ${word} - skipping`);
      setTimeout(() => onAnswer(true), 100);
      return;
    }

    const allChoices = [correctChoice, ...wrongChoices].sort(() => Math.random() - 0.5);
    if (!allChoices.some(c => c.word.toLowerCase() === word.toLowerCase())) allChoices[0] = correctChoice;
    setChoices(allChoices);
  }, [word, wordImage, allWords, isLocked, onAnswer]);

  const handleChoiceClick = (choice) => {
    if (showFeedback) return;
    setIsLocked(true);
    setSelectedChoice(choice);
    setShowFeedback(true);
    if (speak) {
      if (choice.isCorrect) {
        const praise = ['Correct!', 'Well done!', "That's right!", 'Great job!'];
        speak(praise[Math.floor(Math.random() * praise.length)]);
      } else {
        speak(`Not quite! The one with the check mark is the ${word}.`);
      }
    }
    setTimeout(() => onAnswer(choice.isCorrect), 1000);
  };

  const handleSpeakWord = () => { if (speak) speak(`Which one is the ${word}?`); };

  // ── All grid layout via inline styles — defeats any CSS override ──────────
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

  const getBoxStyle = (isSelected, isCorrect, bgColor) => {
    let background = bgColor || '#F5F5F5';
    let border     = '4px solid #E0E0E0';
    let boxShadow  = '0 3px 10px rgba(0,0,0,0.1)';
    let animation  = undefined;

    if (showFeedback && isSelected && isCorrect) {
      background = '#C8E6C9'; border = '5px solid #28A745';
      boxShadow  = '0 0 25px rgba(40,167,69,0.6)';
    } else if (showFeedback && isSelected && !isCorrect) {
      background = '#FFCDD2'; border = '5px solid #DC3545';
      boxShadow  = '0 0 25px rgba(220,53,69,0.6)';
    } else if (showFeedback && !isSelected && isCorrect) {
      background = '#C8E6C9'; border = '5px solid #28A745';
      boxShadow  = '0 0 25px rgba(40,167,69,0.6)';
    }

    return {
      position: 'relative',
      borderRadius: '14px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      overflow: 'hidden',
      background,
      border,
      boxShadow,
      minHeight: 0,
      minWidth: 0,
    };
  };

  return (
    <div className="recognition-challenge">
      <div className="recognition-header">
        <p className="recognition-question">
          Which one is the <span className="highlight-word">{word}</span>?
        </p>
        {!hideSpeaker && (
          <div className="sound-icon" onClick={handleSpeakWord}>🔊</div>
        )}
      </div>

      <div style={gridStyle}>
        {choices.map((choice, index) => {
          const isSelected = selectedChoice?.word === choice.word;
          const isCorrect  = choice.isCorrect;
          const isNecklace = choice.image?.toString().includes('necklace-emoji');
          const bgColor    = showFeedback ? undefined
            : isNecklace ? '#2C2C2C' : slotColors.current[index];

          return (
            <div
              key={index}
              style={getBoxStyle(isSelected, isCorrect, bgColor)}
              onClick={() => handleChoiceClick(choice)}
            >
              <img
                src={choice.image}
                alt={choice.word}
                style={{
                  width: '92%',
                  height: '92%',
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

export default RecognitionChallenge;