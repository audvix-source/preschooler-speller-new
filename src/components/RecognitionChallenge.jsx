import React, { useState, useEffect, useRef } from 'react';
import './RecognitionChallenge.css';

/**
 * A pool of 12 distinct, kid-friendly background colors.
 * Deliberately excludes:
 *  - Pink / rose tones (app background is pink)
 *  - Skin tones / beige / peach (clash with animal/person images)
 *  - Pure white (no contrast for light-colored objects)
 *  - Very dark colors (hard for kids to see images against)
 *
 * Colors are shuffled fresh on every new question so adjacent
 * tiles are always visually distinct from each other.
 */
const COLOR_POOL = [
  '#B3E5FC', // light sky blue
  '#C8E6C9', // light mint green
  '#FFF9C4', // light lemon yellow
  '#D1C4E9', // light lavender
  '#B2EBF2', // light cyan
  '#DCEDC8', // light lime
  '#FFE0B2', // light orange
  '#F8BBD0', // — intentionally excluded (pink) - replaced below
  '#CFD8DC', // blue-grey
  '#E1F5FE', // pale azure
  '#F0F4C3', // pale chartreuse
  '#D7CCC8', // warm grey
];

// Remove any pinkish entries just in case — final safe pool
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

/**
 * Shuffle an array (Fisher-Yates) and return the first `n` items.
 * Guarantees no two adjacent slots share the same color.
 */
function pickDistinctColors(n) {
  const shuffled = [...SAFE_COLORS].sort(() => Math.random() - 0.5);
  // Take first n — since pool has 14 entries and n=4, they'll always be distinct
  return shuffled.slice(0, n);
}

function RecognitionChallenge({ word, wordImage, allWords, onAnswer, speak }) {
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // ✅ Slot colors are picked once per question (when `word` changes)
  // Stored in a ref so they don't re-randomize on every render
  const slotColors = useRef(pickDistinctColors(4));

  // Reset state and pick fresh colors when the question word changes
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
        console.warn(`No image for: ${word} - auto-advancing`);
        setTimeout(() => onAnswer(false), 100);
        return [];
      }

      const correctChoice = { word, image: wordImage, isCorrect: true };

      // Filter out the correct word and any entries without a valid image
      const otherWords = allWords.filter(w => {
        if (w.word.toLowerCase() === word.toLowerCase()) return false;
        if (w.image === null || w.image === undefined) return false;
        if (typeof w.image === 'string' && w.image.length === 0) return false;
        return true;
      });

      const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongChoices = shuffled.slice(0, 3).map(w => ({
        word: w.word,
        image: w.image,
        isCorrect: false,
      }));

      const allChoices = [correctChoice, ...wrongChoices].sort(() => Math.random() - 0.5);

      // Safety: ensure correct answer is present
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
    if (speak) speak(word);
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

          // Build feedback class
          let boxClass = 'recognition-choice';
          if (showFeedback && isSelected) {
            boxClass += isCorrect ? ' correct-choice' : ' incorrect-choice';
          }
          if (showFeedback && !isSelected && isCorrect) {
            boxClass += ' show-correct';
          }

          // ✅ Use randomized slot color when no feedback active.
          // When feedback IS active, let the CSS feedback classes take over.
          const bgColor = showFeedback ? undefined : slotColors.current[index];

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