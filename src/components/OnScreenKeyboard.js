import React from 'react';
// Styles are in LearningScreen.css

function OnScreenKeyboard({ onLetterClick, usedLetters, currentWord }) {
  // All 26 letters of the alphabet
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Split into 3 rows for better layout
  const row1 = alphabet.slice(0, 9);  // A-I
  const row2 = alphabet.slice(9, 18); // J-R
  const row3 = alphabet.slice(18);    // S-Z

  const isLetterUsed = (letter) => {
  const word = currentWord.word.toUpperCase();
  const letterCount = word.split('').filter(l => l === letter).length;
  const usedCount = usedLetters.filter(l => l === letter).length;
  
  return usedCount >= letterCount; // Only disable if all instances are used
};

  return (
    <div className="on-screen-keyboard">
      <div className="keyboard-row">
        {row1.map((letter) => (
          <button
            key={letter}
            className="keyboard-letter"
            onClick={() => onLetterClick(letter)}
            disabled={isLetterUsed(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="keyboard-row">
        {row2.map((letter) => (
          <button
            key={letter}
            className="keyboard-letter"
            onClick={() => onLetterClick(letter)}
            disabled={isLetterUsed(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="keyboard-row">
        {row3.map((letter) => (
          <button
            key={letter}
            className="keyboard-letter"
            onClick={() => onLetterClick(letter)}
            disabled={isLetterUsed(letter)}
          >
            {letter}
          </button>
        ))}
      </div>
    </div>
  );
}

export default OnScreenKeyboard;