import React from 'react';
import './OnScreenKeyboard.css';

function OnScreenKeyboard({ onLetterClick, usedLetters, currentWord }) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // This logic correctly disables letters if they've been used up in the current word
  const getLetterCount = (letter) => {
    return currentWord.word.toUpperCase().split(letter).length - 1;
  };

  const getUsedCount = (letter) => {
    return usedLetters.filter(l => l === letter).length;
  };

  return (
    <div className="alphabet-keyboard">
      {alphabet.map((letter) => (
        <button
          key={letter}
          className="keyboard-letter"
          onClick={() => onLetterClick(letter)}
          disabled={getUsedCount(letter) >= getLetterCount(letter)}
        >
          {letter}
        </button>
      ))}
    </div>
  );
}

export default OnScreenKeyboard;
