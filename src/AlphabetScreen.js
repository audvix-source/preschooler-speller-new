import React, { useState } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';

function AlphabetScreen(props) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [selectedWord, setSelectedWord] = useState(null);

  const handleLetterClick = (letter) => {
    const foundWord = wordList.find(item => 
      item.category === 'Alphabet Fun' && item.word.toUpperCase().startsWith(letter)
    );
    if (foundWord) {
      setSelectedWord(foundWord);
      props.speak(foundWord.word);
    }
  };

  return (
    <div className="alphabet-screen-container">
      <div className="top-section">
        {!selectedWord ? (
          <div className="video-section">
            <h1 className="alphabet-title">The Alphabet Song</h1>
            <div className="video-container">
              <iframe 
                src="https://www.youtube.com/embed/xY3Z8acE8ew" 
                title="Alphabet Song by CoComelon" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
            <p className="credit-line">Video courtesy of CoComelon - Nursery Rhymes</p>
          </div>
        ) : (
          <div className="word-display-section">
            <button className="close-word-button" onClick={() => setSelectedWord(null)}>&times;</button>
            
            {/* --- DEBUGGING LOGS ADDED --- */}
            {/* These will print information to your browser's developer console (F12) */}
            {selectedWord && console.log('--- DEBUGGING INFO ---')}
            {selectedWord && console.log('Selected Word Object:', selectedWord)}
            {selectedWord && console.log('Type of image property:', typeof selectedWord.image)}
            
            {selectedWord && selectedWord.image && (
              <img src={require(`./assets/${selectedWord.image}`)} alt={selectedWord.word} />
            )}
            <p className="word-text">{selectedWord.word}</p>
          </div>
        )}
      </div>
      
      <div className="alphabet-grid">
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
  );
}

export default AlphabetScreen;
