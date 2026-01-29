import React, { useState, useEffect } from 'react';
import './AlphabetChallenge.css';
import { wordList } from '../wordList.js';
import scoreDB from '../services/scoreDatabase';
import OnScreenKeyboard from './OnScreenKeyboard';

// Import all images dynamically
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

const images = importAll(require.context('../assets', false, /\.(png|jpe?g|svg)$/));
const getImagePath = (fileName) => images[fileName] || null;

function AlphabetChallenge({ mode, selectedLetter, onExit, speak }) {
  // Get alphabet fun words
  const getAllAlphabetWords = () => {
    return wordList.filter(item => 
      item.category === 'Alphabet Fun' && 
      item.letter && 
      item.word.length <= 6 // Only words 6 letters or less for typing
    );
  };

  const getWordsForLetter = (letter) => {
    return wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.letter &&
      item.letter.toUpperCase() === letter.toUpperCase() &&
      item.word.length <= 6
    );
  };

  // State
  const [currentWords, setCurrentWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState([]);
  const [showHints, setShowHints] = useState([]);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);

  // Initialize words based on mode
  useEffect(() => {
    if (mode === 'random') {
      const allWords = getAllAlphabetWords();
      // Shuffle the words
      const shuffled = allWords.sort(() => Math.random() - 0.5);
      setCurrentWords(shuffled);
    } else if (mode === 'per-letter' && selectedLetter) {
      const letterWords = getWordsForLetter(selectedLetter);
      const shuffled = letterWords.sort(() => Math.random() - 0.5).slice(0, 5); // Max 5 per letter
      setCurrentWords(shuffled);
    }
  }, [mode, selectedLetter]);

  const currentWord = currentWords[currentIndex];

  // Reset for new word
  useEffect(() => {
    if (currentWord) {
      setUserInput(Array(currentWord.word.length).fill(''));
      setShowHints(Array(currentWord.word.length).fill(false));
      setMistakeCount(0);
      setIsCompleted(false);
    }
  }, [currentIndex, currentWords]);

  const handleLetterClick = (letter) => {
    if (isCompleted || !currentWord) return;

    if (speak) speak(letter);

    const word = currentWord.word.toUpperCase();
    const upperLetter = letter.toUpperCase();
    const nextEmpty = userInput.findIndex(l => l === '');

    if (nextEmpty === -1) return;

    const correctLetter = word[nextEmpty];

    if (upperLetter === correctLetter) {
      // Correct!
      playMagicSound();
      setUserInput(prev => {
        const copy = [...prev];
        copy[nextEmpty] = upperLetter;
        return copy;
      });

      // Check if word is complete
      setTimeout(() => {
        const newInput = [...userInput];
        newInput[nextEmpty] = upperLetter;
        if (newInput.every(l => l !== '')) {
          handleWordComplete();
        }
      }, 100);
    } else {
      // Wrong!
      playErrorSound();
      setMistakeCount(prev => prev + 1);
      
      setUserInput(prev => {
        const copy = [...prev];
        copy[nextEmpty] = '?';
        return copy;
      });

      setShowHints(prev => {
        const copy = [...prev];
        copy[nextEmpty] = true;
        return copy;
      });

      // Auto-switch to multiple choice after 2 mistakes
      if (mistakeCount + 1 >= 2) {
        setTimeout(() => switchToMultipleChoice(), 500);
      }
    }
  };

  const handleHintClick = (index) => {
    if (!showHints[index] || !currentWord) return;
    
    const correctLetter = currentWord.word.toUpperCase()[index];
    if (speak) speak(correctLetter);
    playMagicSound();

    setUserInput(prev => {
      const copy = [...prev];
      copy[index] = correctLetter;
      return copy;
    });

    setShowHints(prev => {
      const copy = [...prev];
      copy[index] = false;
      return copy;
    });

    // Check if complete
    setTimeout(() => {
      const newInput = [...userInput];
      newInput[index] = correctLetter;
      if (newInput.every(l => l !== '')) {
        handleWordComplete();
      }
    }, 100);
  };

  const switchToMultipleChoice = () => {
    if (speak) speak("Let's try choosing! Which one is it?");
    // This will be handled by showing multiple choice buttons
    setIsCompleted(true); // Temporarily to show different UI
  };

  const handleMultipleChoiceAnswer = (chosenWord) => {
    if (chosenWord === currentWord.word) {
      playMagicSound();
      if (speak) speak("Correct!");
      setScore(prev => prev + 1);
      setTotalAttempted(prev => prev + 1);
      
      // Record in database
      scoreDB.recordLearningAttempt(`Challenge: ${currentWord.word}`, true);
      
      setTimeout(() => moveToNextWord(), 1500);
    } else {
      playErrorSound();
      if (speak) speak("Try again!");
    }
  };

  const handleWordComplete = () => {
    setIsCompleted(true);
    const isPerfect = mistakeCount === 0;
    
    if (isPerfect) {
      playMagicSound();
      if (speak) speak("Perfect!");
      setScore(prev => prev + 1);
    } else {
      if (speak) speak("Good job!");
    }

    setTotalAttempted(prev => prev + 1);

    // Record in database
    scoreDB.recordLearningAttempt(`Challenge: ${currentWord.word}`, isPerfect);

    setTimeout(() => moveToNextWord(), 2000);
  };

  const moveToNextWord = () => {
    if (currentIndex + 1 < currentWords.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      // Challenge complete!
      if (speak) speak("Challenge complete! Great job!");
    }
  };

  const playMagicSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(783.99, now + 0.15);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {
      console.error('Sound error:', e);
    }
  };

  const playErrorSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.frequency.setValueAtTime(392.00, ctx.currentTime);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.3);
    } catch (e) {
      console.error('Sound error:', e);
    }
  };

  if (!currentWord) {
    return (
      <div className="challenge-container">
        <div className="challenge-complete">
          <h1>🎉 Challenge Complete! 🎉</h1>
          <p className="final-score">Score: {score} / {totalAttempted}</p>
          <p className="accuracy">Accuracy: {totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0}%</p>
          <button className="exit-challenge-btn" onClick={onExit}>
            Back to Alphabet
          </button>
        </div>
      </div>
    );
  }

  const accuracy = totalAttempted > 0 ? Math.round((score / totalAttempted) * 100) : 0;

  return (
    <div className="challenge-container">
      {/* Header with score */}
      <div className="challenge-header">
        <div className="challenge-score">
          Score: {score} | {currentIndex + 1}/{currentWords.length}
        </div>
        <div className="challenge-accuracy">
          Accuracy: {accuracy}%
        </div>
      </div>

      {/* Image Card */}
      <div className="challenge-card">
        <div className="challenge-image-container">
          <img 
            src={getImagePath(currentWord.image)} 
            alt="Guess this word"
            className="challenge-image"
          />
        </div>
      </div>

      {/* Word Blanks */}
      <div className="challenge-word-blanks">
        {currentWord.word.split('').map((letter, i) => (
          <div
            key={i}
            className={`challenge-letter-blank ${userInput[i] ? 'filled' : ''} ${showHints[i] ? 'hint' : ''}`}
            onClick={() => handleHintClick(i)}
          >
            {showHints[i] ? '?' : (userInput[i] || '')}
          </div>
        ))}
      </div>

      {/* Keyboard or Multiple Choice */}
      {!isCompleted && mistakeCount < 2 && (
        <OnScreenKeyboard
          onLetterClick={handleLetterClick}
          usedLetters={userInput.filter(l => l !== '' && l !== '?')}
          currentWord={currentWord}
        />
      )}

      {mistakeCount >= 2 && !isCompleted && (
        <div className="multiple-choice-container">
          <p className="mc-prompt">Choose the correct answer:</p>
          <div className="mc-options">
            {/* Generate 3 options including the correct answer */}
            {generateMultipleChoiceOptions(currentWord.word).map((option, idx) => (
              <button
                key={idx}
                className="mc-option-btn"
                onClick={() => handleMultipleChoiceAnswer(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="exit-challenge-btn-small" onClick={onExit}>
        Exit Challenge
      </button>
    </div>
  );
}

// Helper function to generate multiple choice options
function generateMultipleChoiceOptions(correctWord) {
  const allWords = wordList
    .filter(item => item.category === 'Alphabet Fun' && item.word !== correctWord)
    .map(item => item.word);
  
  // Pick 2 random wrong answers
  const shuffled = allWords.sort(() => Math.random() - 0.5);
  const options = [correctWord, shuffled[0], shuffled[1]];
  
  // Shuffle the options
  return options.sort(() => Math.random() - 0.5);
}

export default AlphabetChallenge;