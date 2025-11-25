import React, { useState } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';
import birdBackground from './assets/pair-birds.png';

// 1. DYNAMIC IMAGE CONTEXT SETUP (Fixes "Cannot find module" error)
const imageContext = require.context('./assets', false, /\.(png|jpe?g|svg)$/);
const getImagePath = (fileName) => {
  try {
    return imageContext(`./${fileName}`);
  } catch (e) {
    console.error(`Error loading image: ${fileName}`, e);
    return null;
  }
};
// -------------------------------------------------------------------

function AlphabetScreen(props) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  // STATE DEFINITIONS
  const [selectedWord, setSelectedWord] = useState(null);
  const [letterProgress, setLetterProgress] = useState({});
  const [activeLetter, setActiveLetter] = useState(null);

  // 2. HANDLER FUNCTION: GETS THE INITIAL ICON IMAGE FILENAME
const getLetterIconSource = (letter) => {
  // Finds the first word for this letter (e.g., 'Ape' for 'A')
  const firstWord = wordList.find(item =>
    item.category === 'Alphabet Fun' &&
    item.word.toUpperCase().startsWith(letter.toUpperCase())
  );
  
  // Debug log to check if images are being found
  if (firstWord) {
    console.log(`Letter ${letter}: Found image ${firstWord.image}`);
  } else {
    console.log(`Letter ${letter}: No image found`);
  }
  
  // Returns only the filename (e.g., 'ape.png')
  return firstWord ? firstWord.image : null;
};

  // 3. HANDLER FUNCTION: Handles clicking a letter tile
  const handleLetterClick = (letter) => {
    const wordsForLetter = wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    
    if (wordsForLetter.length === 0) return;
    
    setActiveLetter(letter);
    const currentIndex = letterProgress[letter] || 0;
    const foundWord = wordsForLetter[currentIndex];
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
    
    if (nextIndex === 0) {
      setTimeout(() => {
        setActiveLetter(null);
      }, 100);
    }
  };

  // 4. HANDLER FUNCTION: Closes the word display
  const handleCloseWord = () => {
    setSelectedWord(null);
    setActiveLetter(null);
  };

  // 5. HELPER FUNCTION: Determines if a letter tile should pulse
  const hasMoreImages = (letter) => {
    if (activeLetter !== letter) return false;
    
    const wordsForLetter = wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    
    const currentProgress = letterProgress[letter] || 0;
    
    return currentProgress < wordsForLetter.length;
  };

  return (
    <div className="app-screen alphabet-screen-container">
      {/* Top Section - Show Video OR Word Image */}
      <div className="top-section">
        {/* Uses selectedWord (defined at line 18) */}
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
            {/* Uses handleCloseWord (defined at line 76) */}
            <button className="close-word-button" onClick={handleCloseWord}>×</button>
            <div className="word-image-frame">
              {/* Uses getImagePath (defined at line 10) */}
              <img
                src={getImagePath(selectedWord.image)}
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

      {/* Keyboard Grid Wrapper with Border (BOTTOM SECTION) */}
      <div className="keyboard-wrapper">
        <div
          className="alphabet-grid"
          style={{ backgroundImage: `url(${birdBackground})` }}
        >
{alphabet.map(letter => {
  return (
    <button
      key={letter}
      className={`letter-tile ${hasMoreImages(letter) ? 'has-more' : ''}`}
      onClick={() => handleLetterClick(letter)}
    >
      {letter}
    </button>
  );
})}
          <button className="back-button" onClick={() => props.onNavigate('menu')}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlphabetScreen;