import React, { useState } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';

function AlphabetScreen(props) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [selectedWord, setSelectedWord] = useState(null);

  // Map letters to main word IDs (101-126)
  const letterToIdMap = {
    'A': 101, 'B': 102, 'C': 103, 'D': 104, 'E': 105,
    'F': 106, 'G': 107, 'H': 108, 'I': 109, 'J': 110,
    'K': 111, 'L': 112, 'M': 113, 'N': 114, 'O': 115,
    'P': 116, 'Q': 117, 'R': 118, 'S': 119, 'T': 120,
    'U': 121, 'V': 122, 'W': 123, 'X': 124, 'Y': 125,
    'Z': 126
  };

  // Typewriter sound effect
  const playTypewriterSound = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const now = context.currentTime;
      const gainNode = context.createGain();
      gainNode.connect(context.destination);

      const bufferSize = context.sampleRate * 0.1;
      const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = context.createBufferSource();
      noise.buffer = buffer;
      noise.connect(gainNode);

      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

      noise.start(now);
      noise.stop(now + 0.1);
    } catch (e) {
      console.error("Click sound error:", e);
    }
  };

  const handleLetterClick = (letter) => {
    playTypewriterSound();
    
    // Find the main word by ID (101-126)
    const wordId = letterToIdMap[letter];
    const foundWord = wordList.find(item => item.id === wordId);
    
    if (foundWord) {
      setSelectedWord(foundWord);
      props.speak(foundWord.word);
    }
  };

  const closeWordDisplay = () => {
    setSelectedWord(null);
  };

  return (
    <div className="alphabet-screen-container">
      <div className="top-section">
        {selectedWord ? (
          // Show word display when a letter is clicked
          <div className="word-display-section word-animate">
            <button className="close-word-button" onClick={closeWordDisplay}>
              &times;
            </button>
            
            {selectedWord.image && (
              <img
                src={require(`./assets/${selectedWord.image}`)}
                alt={selectedWord.word}
              />
            )}
            <p className="word-text">{selectedWord.word}</p>
          </div>
        ) : (
          // Show video when no word is selected
          <>
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
          </>
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