import React, { useState } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';
import birdBackground from './assets/pair-birds.png';

function AlphabetScreen(props) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [selectedWord, setSelectedWord] = useState(null);

  const handleLetterClick = (letter) => {
    const foundWord = wordList.find(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    if (foundWord) {
      setSelectedWord(foundWord);
      props.speak(foundWord.word);
    }
  };

  const handleCloseWord = () => {
    setSelectedWord(null);
  };

  return (
    <div className="alphabet-screen-container">
      {/* Top Section - Show Video OR Word Image */}
      <div className="top-section">
        {!selectedWord ? (
          <div className="video-section">
            <h2 className="alphabet-title">Alphabet Fun</h2>
            <div className="video-container">
              <iframe
                src="https://www.youtube.com/embed/_UR-l3QI2nE"
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
            <img 
              src={require(`./assets/${selectedWord.image}`)} 
              alt={selectedWord.word}
            />
            <p className="word-text">{selectedWord.word}</p>
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