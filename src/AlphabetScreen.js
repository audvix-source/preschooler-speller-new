import React, { useState } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';
import birdBackground from './assets/pair-birds.png';

function AlphabetScreen(props) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [letterProgress, setLetterProgress] = useState({});

  const handleLetterClick = (letter) => {
  // Get all words starting with this letter
  const wordsForLetter = wordList.filter(item =>
    item.category === 'Alphabet Fun' &&
    item.word.toUpperCase().startsWith(letter)
  );
  
  if (wordsForLetter.length === 0) return;
  
  // Track which word we're on for this letter
  const currentIndex = letterProgress[letter] || 0;
  const nextIndex = (currentIndex + 1) % wordsForLetter.length;
  
  setLetterProgress({
    ...letterProgress,
    [letter]: nextIndex
  });
  
  const foundWord = wordsForLetter[nextIndex];
  setSelectedWord({
    ...foundWord,
    currentIndex: nextIndex,
    totalCount: wordsForLetter.length
  });
  props.speak(foundWord.word);
};

  const handleCloseWord = () => {
    setSelectedWord(null);
  };

  return (
  <div className="app-screen alphabet-screen-container">
    {/* Top Section - Show Video OR Word Image */}
    <div className="top-section">
      {!selectedWord ? (
        <div className="video-section">
          <h2 className="alphabet-title">Alphabet Fun</h2>
          <div className="video-container">
            <iframe
              src="https://www.youtube.com/embed/71h8MZshGSs"
              title="Alphabet Song"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          <p className="credit-line">Video courtesy of CoComelon - Nursery Rhymes</p>
        </div>
      ) : (
        <div className="word-display-section">
          <button className="close-word-button" onClick={handleCloseWord}>×</button>
          <div className="word-image-frame">
            <img
              src={require(`./assets/${selectedWord.image}`)}
              alt={selectedWord.word}
            />
          </div>
          <p className="word-text">{selectedWord.word}</p>
          
          {selectedWord.totalCount > 1 && (
            <div className="progress-dots">
              {Array.from({ length: selectedWord.totalCount }).map((_, i) => (
                <div
                  key={i}
                  className={`progress-dot ${i === selectedWord.currentIndex ? 'active' : ''}`}
                />
              ))}
            </div>
          )}
          
          {selectedWord.totalCount > 1 && selectedWord.currentIndex < selectedWord.totalCount - 1 && (
            <p className="tap-more-hint">👆 Tap {selectedWord.word[0]} for more!</p>
          )}
        </div>
      )}
    </div>

       {/* Keyboard Grid Wrapper with Border */}
    <div className="keyboard-wrapper">
      <div
        className="alphabet-grid"
        style={{ backgroundImage: `url(${birdBackground})` }}
      >
        {alphabet.map(letter => (
          <button
            key={letter}
            className="letter-tile"
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
        <button className="back-button" onClick={() => props.onNavigate('menu')}>
          Back to Menu
        </button>
      </div>
    </div>
  </div>
  );
}

export default AlphabetScreen;
