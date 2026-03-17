import React, { useState, useEffect } from 'react';
import './MasteryCheckChallenge.css';
import { wordList } from '../wordList.js';
// 👈 INSERT THE NEW CODE HERE
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

// This specifically looks into your assets folder for the colorful drawings
const quizImages = importAll(require.context('../assets', false, /\.(png|jpe?g|svg)$/));

const getQuizImagePath = (fileName) => quizImages[fileName] || null;
// ------------------------------------------------------------

function MasteryCheckChallenge({ studiedLetters, onExit, speak }) {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState([]);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [challengeWords, setChallengeWords] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Get words for the studied letters
  useEffect(() => {
    console.log('Studied letters:', studiedLetters); // Debug
    const words = [];
    studiedLetters.forEach(letter => {
      // Find words that START with this letter
      const letterWords = wordList.filter(item => 
        item.category === 'Alphabet Fun' &&
        item.word && 
        item.word.toUpperCase().startsWith(letter.toUpperCase())
      );
      
      console.log(`Words for letter ${letter}:`, letterWords); // Debug
      
      // Pick one random word per letter (excluding the main letter words like "Ape", "Bee", etc.)
      const subWords = letterWords.filter(item => item.letter); // Only get sub-words (101.1, 101.2, etc.)
      
      if (subWords.length > 0) {
        const randomWord = subWords[Math.floor(Math.random() * subWords.length)];
        words.push(randomWord);
      } else if (letterWords.length > 0) {
        // Fallback to main word if no sub-words
        const randomWord = letterWords[Math.floor(Math.random() * letterWords.length)];
        words.push(randomWord);
      }
    });
    
    console.log('Challenge words:', words); // Debug
    setChallengeWords(words);
    setTotalQuestions(words.length);
  }, [studiedLetters]);

  const currentWord = challengeWords[currentWordIndex];
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const handleLetterClick = (letter) => {
    if (!currentWord || showFeedback) return;

    const newAnswer = [...userAnswer, letter];
    setUserAnswer(newAnswer);

    // Check if answer is complete
    if (newAnswer.length === currentWord.word.length) {
      const userWord = newAnswer.join('').toLowerCase();
      const correctWord = currentWord.word.toLowerCase();
      const correct = userWord === correctWord;
      
      setIsCorrect(correct);
      setShowFeedback(true);

      if (correct) {
        setScore(score + 1);
        if (speak) speak("Correct! Well done!");
      } else {
        if (speak) speak(`Not quite! It's ${currentWord.word}`);
      }

      // Move to next word after delay
      setTimeout(() => {
        if (currentWordIndex < challengeWords.length - 1) {
          setCurrentWordIndex(currentWordIndex + 1);
          setUserAnswer([]);
          setShowFeedback(false);
        } else {
          // Challenge complete
          if (speak) speak(`Challenge complete! You scored ${score + (correct ? 1 : 0)} out of ${totalQuestions}`);
          setTimeout(() => onExit(score + (correct ? 1 : 0), totalQuestions), 2000);
        }
      }, 2000);
    }
  };

  const handleBackspace = () => {
    if (userAnswer.length > 0 && !showFeedback) {
      setUserAnswer(userAnswer.slice(0, -1));
    }
  };

  const handleExit = () => {
    if (speak) speak("Exiting challenge");
    onExit(score, currentWordIndex);
  };

  if (!currentWord) {
    return (
      <div className="challenge-overlay">
        <div className="challenge-loading">Loading challenge...</div>
      </div>
    );
  }

  // Get emoji for the current word
  const getWordVisual = () => {
    const emojiMap = {
      'apple': '🍎', 'ant': '🐜', 'alligator': '🐊', 'astronaut': '🧑‍🚀',
      'ball': '⚽', 'bear': '🐻', 'bus': '🚌', 'baby': '👶',
      'cat': '🐱', 'car': '🚗', 'cookie': '🍪', 'cow': '🐄',
      'dog': '🐕', 'duck': '🦆', 'door': '🚪', 'dinosaur': '🦕',
      'egg': '🥚', 'elephant': '🐘', 'elf': '🧝', 'elbow': '💪',
      'fish': '🐠', 'frog': '🐸', 'fire': '🔥', 'flower': '🌸',
      'goat': '🐐', 'girl': '👧', 'grapes': '🍇', 'globe': '🌍',
      'hat': '🎩', 'horse': '🐴', 'hand': '✋', 'heart': '❤️',
      'igloo': '🏔️', 'iguana': '🦎', 'island': '🏝️', 'infant': '👶',
      'jacket': '🧥', 'jellyfish': '🪼', 'jar': '🫙', 'jet': '✈️',
      'kite': '🪁', 'king': '🤴', 'kitten': '🐱', 'koala': '🐨',
      'lion': '🦁', 'lamp': '💡', 'lemon': '🍋', 'lollipop': '🍭',
      'monkey': '🐵', 'moon': '🌙', 'mouse': '🐭', 'mushroom': '🍄',
      'nail': '🔨', 'necklace': '📿', 'net': '🥅', 'nurse': '👩‍⚕️',
      'octopus': '🐙', 'ostrich': '🦩', 'otter': '🦦', 'ox': '🐂',
      'peacock': '🦚', 'pencil': '✏️', 'pizza': '🍕', 'pumpkin': '🎃',
      'quail': '🦢', 'queen': '👸', 'quilt': '🛏️', 'question-mark': '❓',
      'rain': '🌧️', 'rainbow': '🌈', 'robot': '🤖', 'rocket': '🚀',
      'shoes': '👟', 'spoon': '🥄', 'star': '⭐', 'sun': '☀️',
      'table': '🪑', 'tree': '🌳', 'telephone': '📞', 'truck': '🚚',
      'umbrella': '☂️', 'unicorn': '🦄', 'umpire': '🧑‍⚖️', 'unicycle': '🚲',
      'vase': '🏺', 'vest': '🦺', 'violin': '🎻', 'volcano': '🌋',
      'wagon': '🛒', 'watch': '⌚', 'whale': '🐋', 'wheel': '🎡',
      'xylophone': '🎹', 'x-ray': '🩻', 'x-box': '🎮',
      'yak': '🦬', 'yarn': '🧶', 'yogurt': '🥛', 'yacht': '⛵',
      'zebra': '🦓', 'zipper': '🤐', 'zap': '⚡', 'zeppelin': '', 'zigzag': ''
    };

    const wordLower = currentWord.word.toLowerCase();
    return emojiMap[wordLower] || '📝';
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="challenge-overlay">
      <div className="challenge-container">
        {/* Floating confetti background */}
        <div className="challenge-confetti">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                fontSize: `${1 + Math.random() * 0.5}em`
              }}
            >
              {['🎉', '⭐', '✨', '🌟', '💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        {/* Score header */}
        <div className="challenge-header">
          <div className="score-display">
            <span className="score-label">Score:</span>
            <span className="score-value">{score} | {totalQuestions}</span>
          </div>
          <div className="accuracy-display">
            <span className="accuracy-label">Accuracy:</span>
            <span className="accuracy-value">{accuracy}%</span>
          </div>
        </div>

        {/* Word display card */}
        <div className={`word-card ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
          {/* Big emoji/image */}
          <div className="word-emoji-display">
  {/* If the word has a filename in wordList, show the drawing. 
      Otherwise, fall back to the emoji list. */}
  {currentWord.image ? (
    <img 
      src={getQuizImagePath(currentWord.image)} 
      alt="Guess the word" 
      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain' }} 
    />
  ) : (
    <span className="emoji-large">{getWordVisual()}</span>
  )}
</div>
                    
          {/* Letter hint */}
          <div className="letter-hint">
            {currentWord.word[0].toUpperCase()} - {currentWord.word}
          </div>

          {/* Feedback overlay */}
          {showFeedback && (
            <div className="feedback-overlay">
              <div className="feedback-icon">
                {isCorrect ? '✅' : '❌'}
              </div>
              <div className="feedback-text">
                {isCorrect ? 'Perfect!' : `It's ${currentWord.word}`}
              </div>
            </div>
          )}
        </div>

        {/* Answer boxes */}
        <div className="answer-boxes">
          {Array.from({ length: currentWord.word.length }).map((_, index) => (
            <div 
              key={index} 
              className={`answer-box ${userAnswer[index] ? 'filled' : ''} ${
                showFeedback ? (isCorrect ? 'correct-box' : 'incorrect-box') : ''
              }`}
            >
              {userAnswer[index] || ''}
            </div>
          ))}
        </div>

        {/* Keyboard - ALWAYS VISIBLE */}
        <div className="challenge-keyboard">
          {alphabet.map(letter => (
            <button
              key={letter}
              className={`keyboard-key ${userAnswer.includes(letter) ? 'used' : ''}`}
              onClick={() => handleLetterClick(letter)}
              disabled={showFeedback}
            >
              {letter}
            </button>
          ))}
        </div>

        {/* Control buttons */}
        <div className="challenge-controls">
          <button className="backspace-button" onClick={handleBackspace} disabled={showFeedback}>
            ⌫ Backspace
          </button>
          <button className="exit-button" onClick={handleExit}>
            🚪 Exit Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

export default MasteryCheckChallenge;