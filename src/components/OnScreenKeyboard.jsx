import React from 'react';
import './OnScreenKeyboard.css';

function OnScreenKeyboard({ onLetterClick, usedLetters, currentWord, highlightLetters = [] }) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const getLetterCountInWord = (letter) => {
    return currentWord.word.toUpperCase().split(letter).length - 1;
  };

  const getUsedCount = (letter) => {
    return usedLetters.filter(l => l === letter).length;
  };

  const isLetterUsed = (letter) => {
    return getUsedCount(letter) >= getLetterCountInWord(letter);
  };

  // Check if this letter should be highlighted for learning
  const isHighlighted = (letter) => {
    return highlightLetters.includes(letter.toUpperCase());
  };

  return (
    <div className="alphabet-keyboard">
      {alphabet.map((letter, index) => (
        <button
          key={letter}
          className={`keyboard-letter ${isLetterUsed(letter) ? 'used' : ''} ${isHighlighted(letter) ? 'highlighted' : ''}`}
          onClick={() => onLetterClick(letter)}
          disabled={isLetterUsed(letter)}
          style={{ animationDelay: `${index * 0.02}s` }}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}

export default OnScreenKeyboard;