import React, { useState, useEffect, useRef } from 'react';
import './RecognitionChallenge.css';

const SAFE_COLORS = [
  '#B3E5FC', // sky blue
  '#C8E6C9', // mint green
  '#FFF9C4', // lemon yellow
  '#D1C4E9', // lavender
  '#B2EBF2', // cyan
  '#DCEDC8', // lime green
  '#FFE0B2', // soft orange
  '#CFD8DC', // blue-grey
  '#E1F5FE', // pale azure
  '#F0F4C3', // chartreuse
  '#D7CCC8', // warm grey
  '#B2DFDB', // teal mint
  '#FFECB3', // amber cream
  '#C5CAE9', // indigo tint
];

function pickDistinctColors(n) {
  const shuffled = [...SAFE_COLORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function RecognitionChallenge({ word, wordImage, allWords, onAnswer, speak }) {
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const slotColors = useRef(pickDistinctColors(4));

  useEffect(() => {
    setSelectedChoice(null);
    setShowFeedback(false);
    setIsLocked(false);
    slotColors.current = pickDistinctColors(4);
  }, [word]);

  useEffect(() => {
    if (isLocked) return;

    const generateChoices = () => {
      if (!wordImage) {
        // ✅ No image available — skip silently without penalizing score
        console.warn(`No image for: ${word} - skipping recognition question`);
        setTimeout(() => onAnswer(true), 100);
        return [];
      }

      const correctChoice = { word, image: wordImage, isCorrect: true };

      const otherWords = allWords.filter(w => {
        if (w.word.toLowerCase() === word.toLowerCase()) return false;
        if (w.image === null || w.image === undefined) return false;
        if (typeof w.image === 'string' && w.image.length === 0) return false;
        return true;
      });

      const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
      const validWrong = shuffled.filter(w => w.image !== null && w.image !== undefined);
      const wrongChoices = validWrong.slice(0, 3).map(w => ({
        word: w.word,
        image: w.image,
        isCorrect: false,
      }));

      // ✅ If we can't get enough wrong choices, skip rather than show broken UI
      if (wrongChoices.length < 3) {
        console.warn(`Not enough wrong choices for: ${word} - skipping`);
        setTimeout(() => onAnswer(true), 100);
        return [];
      }

      const allChoices = [correctChoice, ...wrongChoices].sort(() => Math.random() - 0.5);

      if (!allChoices.some(c => c.word.toLowerCase() === word.toLowerCase())) {
        allChoices[0] = correctChoice;
      }

      return allChoices;
    };

    const newChoices = generateChoices();
    if (newChoices.length > 0) setChoices(newChoices);
  }, [word, wordImage, allWords, isLocked, onAnswer]);

  const handleChoiceClick = (choice) => {
    if (showFeedback) return;

    setIsLocked(true);
    setSelectedChoice(choice);
    setShowFeedback(true);

    if (speak) {
      speak(choice.isCorrect ? 'Correct!' : 'Try again!');
    }

    setTimeout(() => {
      onAnswer(choice.isCorrect);
    }, 1000);
  };

  const handleSpeakWord = () => {
    if (speak) speak(`Which one is the ${word}?`);
  };

  return (
    <div className="recognition-challenge">
      <div className="recognition-header">
        <p className="recognition-question">
          Which one is the <span className="highlight-word">{word}</span>?
        </p>
        <div className="sound-icon" onClick={handleSpeakWord}>
          🔊
        </div>
      </div>

      <div className="recognition-choices">
        {choices.map((choice, index) => {
          const isSelected = selectedChoice?.word === choice.word;
          const isCorrect = choice.isCorrect;

          let boxClass = 'recognition-choice';
          if (showFeedback && isSelected) {
            boxClass += isCorrect ? ' correct-choice' : ' incorrect-choice';
          }
          if (showFeedback && !isSelected && isCorrect) {
            boxClass += ' show-correct';
          }

          const isNecklace = choice.image &&
            choice.image.toString().includes('necklace-emoji');
          const bgColor = showFeedback
            ? undefined
            : isNecklace
              ? '#2C2C2C'
              : slotColors.current[index];

          return (
            <div
              key={index}
              className={boxClass}
              style={bgColor ? { backgroundColor: bgColor } : undefined}
              onClick={() => handleChoiceClick(choice)}
            >
              <div className="choice-visual">
                {choice.image ? (
                  <img
                    src={choice.image}
                    alt={choice.word}
                    className="choice-image"
                  />
                ) : (
                  <div className="choice-placeholder">?</div>
                )}
              </div>

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