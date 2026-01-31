import React, { useState, useEffect } from 'react';
import './MixedMasteryChallenge.css';
import { wordList } from '../wordList.js';
import RecognitionChallenge from './RecognitionChallenge.jsx';

// Import for getting image path
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

const images = importAll(require.context('../assets', false, /\.(png|jpe?g|svg)$/));

const getImagePath = (fileName) => {
  return images[fileName] || null;
};

function MixedMasteryChallenge({ recentWords, onExit, speak }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  // Generate mixed questions on mount
  useEffect(() => {
    const generateQuestions = () => {
      console.log('Recent words:', recentWords); // Debug
      
      // Categorize words by length
      const shortWords = recentWords.filter(w => w.word.length >= 3 && w.word.length <= 6);
      const longWords = recentWords.filter(w => w.word.length >= 7);
      
      console.log('Short words:', shortWords); // Debug
      console.log('Long words:', longWords); // Debug
      
      const selectedQuestions = [];
      
      // Try to get 3 spelling questions (short words)
      const spellingCount = Math.min(3, shortWords.length);
      for (let i = 0; i < spellingCount; i++) {
        if (shortWords[i]) {
          selectedQuestions.push({
            type: 'spelling',
            word: shortWords[i]
          });
        }
      }
      
      // Try to get 2 recognition questions (long words)
      const recognitionCount = Math.min(2, longWords.length);
      for (let i = 0; i < recognitionCount; i++) {
        if (longWords[i]) {
          selectedQuestions.push({
            type: 'recognition',
            word: longWords[i]
          });
        }
      }
      
      // If we don't have enough questions, fill with whatever we have
      while (selectedQuestions.length < 5 && recentWords.length > 0) {
        const remaining = recentWords.filter(
          w => !selectedQuestions.find(q => q.word.word === w.word)
        );
        if (remaining.length === 0) break;
        
        const randomWord = remaining[Math.floor(Math.random() * remaining.length)];
        selectedQuestions.push({
          type: randomWord.word.length <= 6 ? 'spelling' : 'recognition',
          word: randomWord
        });
      }
      
      // Shuffle questions
      selectedQuestions.sort(() => Math.random() - 0.5);
      
      console.log('Final questions:', selectedQuestions); // Debug
      setQuestions(selectedQuestions);
    };

    generateQuestions();
  }, [recentWords]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const accuracy = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Handle spelling answer
  const handleLetterClick = (letter) => {
    if (!currentQuestion || showFeedback || currentQuestion.type !== 'spelling') return;

    const newAnswer = [...userAnswer, letter];
    setUserAnswer(newAnswer);

    // Check if answer is complete
    if (newAnswer.length === currentQuestion.word.word.length) {
      const userWord = newAnswer.join('').toLowerCase();
      const correctWord = currentQuestion.word.word.toLowerCase();
      const correct = userWord === correctWord;
      
      setIsCorrect(correct);
      setShowFeedback(true);

      if (correct) {
        setScore(score + 1);
        if (speak) speak("Correct! Well done!");
      } else {
        if (speak) speak(`Not quite! It's ${currentQuestion.word.word}`);
      }

      // Move to next question
      setTimeout(() => {
        moveToNextQuestion();
      }, 2000);
    }
  };

  // Handle recognition answer
  const handleRecognitionAnswer = (correct) => {
    if (correct) {
      setScore(score + 1);
    }
    
    // Move to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 500);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer([]);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      // Challenge complete
      if (speak) speak(`Challenge complete! You scored ${score + (isCorrect ? 1 : 0)} out of ${totalQuestions}`);
      setTimeout(() => onExit(score + (isCorrect ? 1 : 0), totalQuestions), 2000);
    }
  };

  const handleBackspace = () => {
    if (userAnswer.length > 0 && !showFeedback) {
      setUserAnswer(userAnswer.slice(0, -1));
    }
  };

  const handleExit = () => {
    if (speak) speak("Exiting challenge");
    onExit(score, currentQuestionIndex);
  };

  // Get emoji for word
  const getWordVisual = (word) => {
    const emojiMap = {
      'apple': '🍎', 'ant': '🐜', 'ball': '⚽', 'bear': '🐻', 'bus': '🚌', 'baby': '👶',
      'cat': '🐱', 'car': '🚗', 'cookie': '🍪', 'cow': '🐄', 'dog': '🐕', 'duck': '🦆',
      'door': '🚪', 'egg': '🥚', 'elf': '🧝', 'fish': '🐠', 'frog': '🐸', 'fire': '🔥',
      'flower': '🌸', 'goat': '🐐', 'girl': '👧', 'hat': '🎩', 'horse': '🐴', 'hand': '✋',
      'heart': '❤️', 'igloo': '🏔️', 'jar': '🫙', 'jet': '✈️', 'kite': '🪁', 'king': '🤴',
      'lion': '🦁', 'lamp': '💡', 'lemon': '🍋', 'moon': '🌙', 'mouse': '🐭', 'nail': '🔨',
      'net': '🥅', 'nurse': '👩‍⚕️', 'ox': '🐂', 'pizza': '🍕', 'queen': '👸', 'quilt': '🛏️',
      'rain': '🌧️', 'robot': '🤖', 'star': '⭐', 'sun': '☀️', 'tree': '🌳', 'truck': '🚚',
      'vase': '🏺', 'vest': '🦺', 'watch': '⌚', 'whale': '🐋', 'yak': '🦬', 'yarn': '🧶',
      'zebra': '🦓', 'zap': '⚡'
    };
    return emojiMap[word.toLowerCase()] || '📝';
  };

  if (!currentQuestion) {
    return (
      <div className="challenge-overlay">
        <div className="challenge-loading">Loading challenge...</div>
      </div>
    );
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="challenge-overlay">
      <div className="challenge-container">
        {/* Floating confetti */}
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
            <span className="score-label">Question:</span>
            <span className="score-value">{currentQuestionIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="accuracy-display">
            <span className="accuracy-label">Score:</span>
            <span className="accuracy-value">{score}</span>
          </div>
        </div>

        {/* Question content */}
        <div className="question-content">
          {currentQuestion.type === 'recognition' ? (
            // Recognition Challenge
            <RecognitionChallenge
              word={currentQuestion.word.word}
              wordImage={getImagePath(currentQuestion.word.image)}
              allWords={wordList.filter(w => w.category === 'Alphabet Fun').map(w => ({
                word: w.word,
                image: getImagePath(w.image)
              }))}
              onAnswer={handleRecognitionAnswer}
              speak={speak}
            />
          ) : (
            // Spelling Challenge
            <>
              <div className={`word-card ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
                <div className="word-emoji-display">
                  <span className="emoji-large">{getWordVisual(currentQuestion.word.word)}</span>
                </div>
                
                <div className="letter-hint">
                  {currentQuestion.word.word[0].toUpperCase()} - {currentQuestion.word.word}
                </div>

                {showFeedback && (
                  <div className="feedback-overlay">
                    <div className="feedback-icon">
                      {isCorrect ? '✅' : '❌'}
                    </div>
                    <div className="feedback-text">
                      {isCorrect ? 'Perfect!' : `It's ${currentQuestion.word.word}`}
                    </div>
                  </div>
                )}
              </div>

              <div className="answer-boxes">
                {Array.from({ length: currentQuestion.word.word.length }).map((_, index) => (
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
            </>
          )}
        </div>

        {/* Control buttons */}
        <div className="challenge-controls">
          {currentQuestion.type === 'spelling' && (
            <button className="backspace-button" onClick={handleBackspace} disabled={showFeedback}>
              ⌫ Backspace
            </button>
          )}
          <button className="exit-button" onClick={handleExit}>
            🚪 Exit Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

export default MixedMasteryChallenge;