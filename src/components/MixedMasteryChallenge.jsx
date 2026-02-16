import React, { useState, useEffect } from 'react';
import './MixedMasteryChallenge.css';
import { wordList } from '../wordList.js';
import RecognitionChallenge from './RecognitionChallenge.jsx';
import RunningTilesAnimation from './RunningTilesAnimation';

// Import all images dynamically from emojis folder
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

const images = importAll(require.context('../assets/emojis', false, /\.(png|jpe?g|svg)$/));

// ✅ getImagePath function with special mappings for X-words
const getImagePath = (fileName) => {
  if (!fileName) {
    console.warn('getImagePath: No fileName provided');
    return null;
  }
  
  // ✅ Special mapping for X-words (hyphens removed in emoji filenames)
  const specialMappings = {
    'x-box.png': 'xbox-emoji.png',
    'x-pen.png': 'xpen-emoji.png',
    'xerox-machine.png': 'xeroxmachine-emoji.png',
    'x-ray.png': 'x-ray-emoji.png',
    'xylophone.png': 'xylophone-emoji.png',
  };
  
  // Check if it's a special case
  if (specialMappings[fileName]) {
    const mappedFile = specialMappings[fileName];
    if (images[mappedFile]) {
      return images[mappedFile];
    } else {
      console.warn(`getImagePath: Mapped file not found: ${mappedFile}`);
      return null;
    }
  }
  
  // Normal case: just add -emoji
  const emojiFileName = fileName.replace('.png', '-emoji.png');
  if (images[emojiFileName]) {
    return images[emojiFileName];
  } else {
    console.warn(`getImagePath: Image not found: ${emojiFileName}`);
    return null;
  }
};

function MixedMasteryChallenge({ recentWords, onExit, speak }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [lastPowerWordIndex, setLastPowerWordIndex] = useState(-1);
  const [completionMessage, setCompletionMessage] = useState('Perfect!');

  // Generate mixed questions on mount
  useEffect(() => {
    const generateQuestions = () => {
      // ... rest of your code continues here
      console.log('Recent words:', recentWords);
      
      // SEPARATE: Easy words (3-6 letters) vs Hard words (7+ letters)
      const easyWords = recentWords.filter(w => w.word.length >= 3 && w.word.length <= 6);
      const hardWords = recentWords.filter(w => w.word.length >= 7);
      
      const selectedQuestions = [];
      
      // START WITH EASY SPELLING (3-6 letter words)
      const easySpellingCount = Math.min(3, easyWords.length);
      for (let i = 0; i < easySpellingCount; i++) {
        if (easyWords[i]) {
          selectedQuestions.push({
            type: 'spelling',
            word: easyWords[i]
          });
        }
      }
      
      // THEN ADD HARD RECOGNITION (7+ letter words - multiple choice, NO spelling)
      const hardRecognitionCount = Math.min(2, hardWords.length);
      for (let i = 0; i < hardRecognitionCount; i++) {
        if (hardWords[i]) {
          selectedQuestions.push({
            type: 'recognition',
            word: hardWords[i]
          });
        }
      }
      
      // Fill remaining slots if needed
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
      
      // DON'T shuffle - keep easy spelling first, hard recognition after
      // selectedQuestions.sort(() => Math.random() - 0.5); // REMOVED
      
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

    if (newAnswer.length === currentQuestion.word.word.length) {
      const userWord = newAnswer.join('').toLowerCase();
      const correctWord = currentQuestion.word.word.toLowerCase();
      const correct = userWord === correctWord;
      
      setIsCorrect(correct);
      setShowFeedback(true);

      let calculatedScore = score;
      
      if (correct) {
        // ✅ USE UPDATER FUNCTION to get latest score
        setScore(prevScore => {
          const newScore = prevScore + 1;
          calculatedScore = newScore;
          
          // Store the new score for final calculation
          if (currentQuestionIndex === questions.length - 1) {
            setFinalScore(newScore); // ✅ Set final score here with correct value
          }
          
          return newScore;
        });
        
        // ✅ USE ROTATING POWER WORDS (same as LearningScreen)
        const messages = [
          { display: 'Perfect!', speak: 'Perfect' },
          { display: 'Excellent!', speak: 'Excellent' },
          { display: 'Amazing!', speak: 'Amazing' },
          { display: 'You Did It!', speak: 'You Did It' },
          { display: 'Splendid!', speak: 'Splendid' },
          { display: 'Genius!', speak: 'Genius' },
          { display: 'Brilliant!', speak: 'Brilliant' },
          { display: 'Outstanding!', speak: 'Outstanding' },
          { display: 'Fantastic!', speak: 'Fantastic' },
          { display: 'Wonderful!', speak: 'Wonderful' },
          { display: 'Superb!', speak: 'Superb' },
          { display: 'Magnificent!', speak: 'Magnificent' },
          { display: 'Champion!', speak: 'Champion' },
          { display: 'Incredible!', speak: 'Incredible' },
          { display: 'Marvelous!', speak: 'Marvelous' }
        ];
        
        // Use chronological order (cycles through 0-14, then repeats)
        const nextIndex = (lastPowerWordIndex + 1) % messages.length;
        setLastPowerWordIndex(nextIndex);
        
        const chosen = messages[nextIndex];
        setCompletionMessage(chosen.display); // ✅ SET the display message
        if (speak) speak(chosen.speak);
      } else {
        calculatedScore = score;
        // Store score even if wrong on last question
        if (currentQuestionIndex === questions.length - 1) {
          setFinalScore(score); // ✅ Use current score (not incremented)
        }
        if (speak) speak(`Not quite! It's ${currentQuestion.word.word}`);
      }

      setTimeout(() => {
        // Pass the calculated score to moveToNextQuestion
        moveToNextQuestion(calculatedScore);
      }, 2000);
    }
  };

  const handleRecognitionAnswer = (correct) => {
    let calculatedScore = score;
    
    if (correct) {
      // ✅ USE UPDATER FUNCTION to get latest score
      setScore(prevScore => {
        const newScore = prevScore + 1;
        calculatedScore = newScore;
        
        // Store the new score for final calculation
        if (currentQuestionIndex === questions.length - 1) {
          setFinalScore(newScore); // ✅ Set final score here with correct value
        }
        
        return newScore;
      });
    } else {
      calculatedScore = score;
      // Store score even if wrong on last question
      if (currentQuestionIndex === questions.length - 1) {
        setFinalScore(score); // ✅ Use current score (not incremented)
      }
    }
    
    setTimeout(() => {
      moveToNextQuestion(calculatedScore);
    }, 2000);
  };

  const moveToNextQuestion = (calculatedScore) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer([]);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      // ✅ CHALLENGE COMPLETE - TRIGGER ANIMATION
      // Use the calculatedScore passed from the answer handlers
      const finalScoreValue = calculatedScore !== undefined ? calculatedScore : score;
      setFinalTotal(totalQuestions);
      
      if (speak) speak(`Challenge complete! You scored ${finalScoreValue} out of ${totalQuestions}`);
      
      // Show animation immediately
      setShowAnimation(true);
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

  // ✅ ANIMATION COMPLETE - CALLBACK TO EXIT
  const handleAnimationComplete = () => {
    onExit(finalScore, finalTotal);
  };

  // ✅ SHOW ANIMATION WHEN QUIZ COMPLETES
  if (showAnimation) {
    return (
      <RunningTilesAnimation
        score={finalScore}
        total={finalTotal}
        onComplete={handleAnimationComplete}
      />
    );
  }

  // Get emoji for word - NO LABELS, just visual emoji
  const getWordVisual = (word) => {
    const emojiMap = {
      'apple': '🍎', 'ant': '🐜', 'ball': '⚽', 'bear': '🐻', 'bus': '🚌', 'baby': '👶',
      'cat': '🐱', 'car': '🚗', 'cookie': '🍪', 'cow': '🐄', 'dog': '🐕', 'duck': '🦆',
      'door': '🚪', 'egg': '🥚', 'elf': '🧝', 'fish': '🐠', 'frog': '🐸', 'fire': '🔥',
      'flower': '🌸', 'goat': '🐐', 'girl': '👧', 'hat': '🎩', 'horse': '🐴', 'hand': '✋',
      'heart': '❤️', 'igloo': '🏔️', 'jar': '🫙', 'jet': '✈️', 'kite': '🪁', 'king': '🤴',
      'lion': '🦁', 'lamp': '💡', 'lemon': '🍋', 'moon': '🌙', 'mouse': '🐭', 'monkey': '🐵',
      'nail': '🔨', 'net': '🥅', 'nurse': '👩‍⚕️', 'ox': '🐂', 'pizza': '🍕', 'queen': '👸',
      'quilt': '🛏️', 'rain': '🌧️', 'robot': '🤖', 'star': '⭐', 'sun': '☀️', 'tree': '🌳',
      'truck': '🚚', 'vase': '🏺', 'vest': '🦺', 'watch': '⌚', 'whale': '🐋', 'yak': '🦬',
      'yarn': '🧶', 'zebra': '🦓', 'zap': '⚡', 'zipper': '🤐', 'zigzag': '⚡', 'zeppelin': '🛩️',
      'queue': '👥', 'question-mark': '❓' // Added Q words
    };
    return emojiMap[word.toLowerCase()] || '📝';
  };

  // Get ALL letters needed (including duplicates) for proper highlighting
  const getNeededLetters = (word) => {
    if (!word) return [];
    // Return ALL letters (including duplicates) as uppercase
    return word.toUpperCase().split('');
  };

  // Check if a letter is still needed (accounting for how many times it appears)
  const isLetterStillNeeded = (letter, word, currentAnswer) => {
    const totalNeeded = word.toUpperCase().split('').filter(l => l === letter).length;
    const alreadyUsed = currentAnswer.filter(l => l === letter).length;
    return alreadyUsed < totalNeeded;
  };

  if (!currentQuestion) {
    return (
      <div className="challenge-overlay">
        <div className="challenge-loading">Loading challenge...</div>
      </div>
    );
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-'.split('');
  const neededLetters = currentQuestion.type === 'spelling' ? getNeededLetters(currentQuestion.word.word) : [];

  return (
    <div className="challenge-overlay-fixed">
      <div className="challenge-container-fixed">
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
            <>
              <div className={`word-card ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
                {/* EMOJI IMAGE FILE - NO LABELS */}
                <div className="word-emoji-display">
                  {currentQuestion.word.image ? (
                    <img 
                      src={getImagePath(currentQuestion.word.image)}
                      alt=""
                      className="emoji-huge-image"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '140px',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 6px 12px rgba(0, 0, 0, 0.2))'
                      }}
                    />
                  ) : (
                    <span className="emoji-huge">{getWordVisual(currentQuestion.word.word)}</span>
                  )}
                </div>

                {/* Show feedback without hiding emoji */}
                {showFeedback && (
                  <div className="feedback-banner">
                    <span className="feedback-icon-inline">
                      {isCorrect ? '✅' : '❌'}
                    </span>
                    <span className="feedback-text-inline">
                      {isCorrect ? completionMessage : `It's ${currentQuestion.word.word}`}
                    </span>
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

              {/* KEYBOARD WITH HIGHLIGHTED NEEDED LETTERS */}
              <div className="challenge-keyboard">
                {alphabet.map(letter => {
                  const isUsed = userAnswer.filter(l => l === letter).length >= 
                                 currentQuestion.word.word.toUpperCase().split('').filter(l => l === letter).length;
                  const isNeeded = isLetterStillNeeded(letter, currentQuestion.word.word, userAnswer);
                  
                  return (
                    <button
                      key={letter}
                      className={`keyboard-key ${isUsed ? 'used' : ''} ${
                        isNeeded ? 'needed-letter' : ''
                      }`}
                      onClick={() => handleLetterClick(letter)}
                      disabled={showFeedback}
                    >
                      {letter}
                    </button>
                  );
                })}
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