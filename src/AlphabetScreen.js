import React, { useState } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';
import birdBackground from './assets/pair-birds.png';

function AlphabetScreen(props) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [selectedWord, setSelectedWord] = useState(null);
  const [letterProgress, setLetterProgress] = useState({});
  const [activeLetter, setActiveLetter] = useState(null);

  const handleLetterClick = (letter) => {
    // Get all words starting with this letter
    const wordsForLetter = wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    
    if (wordsForLetter.length === 0) return;
    
    // Set this as the active letter
    setActiveLetter(letter);
    
    // Track which word we're on for this letter (start at 0, not 1)
    const currentIndex = letterProgress[letter] || 0;
    const foundWord = wordsForLetter[currentIndex];
    
    // Calculate next index for the NEXT click
    const nextIndex = (currentIndex + 1) % wordsForLetter.length;
    
    setLetterProgress({
      ...letterProgress,
      [letter]: nextIndex
    });
    
    setSelectedWord({
      ...foundWord,
      currentIndex: currentIndex,
      totalCount: wordsForLetter.length,
      letter: letter
    });
    props.speak(foundWord.word);
    
    // Clear active letter if we've cycled back to start (shown all images)
    if (nextIndex === 0) {
      setTimeout(() => {
        setActiveLetter(null);
      }, 100);
    }
  };

  const handleCloseWord = () => {
    setSelectedWord(null);
    setActiveLetter(null);
  };

  const hasMoreImages = (letter) => {
    // Only highlight the currently active letter
    if (activeLetter !== letter) return false;
    
    const wordsForLetter = wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    
    const currentProgress = letterProgress[letter] || 0;
    
    // Stop pulsing when we've shown all images
    return currentProgress < wordsForLetter.length;
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
    className={`progress-dot ${
      i < selectedWord.currentIndex ? 'completed' : 
      i === selectedWord.currentIndex ? `active ${i === selectedWord.totalCount - 1 ? 'last' : ''}` : 
      'future'
    }`}
  />
))}
              </div>
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
              className={`letter-tile ${hasMoreImages(letter) ? 'has-more' : ''}`}
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