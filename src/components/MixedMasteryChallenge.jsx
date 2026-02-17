import React, { useState, useEffect } from 'react';
import './MixedMasteryChallenge.css';
import { wordList } from '../wordList.js';
import RecognitionChallenge from './RecognitionChallenge.jsx';
import RunningTilesAnimation from './RunningTilesAnimation';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

const images = importAll(require.context('../assets/emojis', false, /\.(png|jpe?g|svg)$/));

const getImagePath = (fileName) => {
  if (!fileName) {
    console.warn('getImagePath: No fileName provided');
    return null;
  }
  
  const specialMappings = {
    'x-box.png': 'xbox-emoji.png',
    'x-pen.png': 'xpen-emoji.png',
    'xerox-machine.png': 'xeroxmachine-emoji.png',
    'x-ray.png': 'x-ray-emoji.png',
    'xylophone.png': 'xylophone-emoji.png',
  };
  
  if (specialMappings[fileName]) {
    const mappedFile = specialMappings[fileName];
    if (images[mappedFile]) {
      return images[mappedFile];
    } else {
      console.warn(`getImagePath: Mapped file not found: ${mappedFile}`);
      return null;
    }
  }
  
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

  useEffect(() => {
    const generateQuestions = () => {
      console.log('Recent words:', recentWords);
      
      if (!recentWords || recentWords.length === 0) {
        console.warn('No recent words available for quiz');
        return;
      }

      const shortWords = recentWords.filter(w => w.word && w.word.length >= 3 && w.word.length <= 6);
      const longWords = recentWords.filter(w => w.word && w.word.length >= 7);
      
      const selectedQuestions = [];
      
      console.log(`Short words (3-6 letters): ${shortWords.length}`);
      shortWords.forEach(word => {
        selectedQuestions.push({
          type: 'spelling',
          word: word
        });
      });
      
      console.log(`Long words (7+ letters): ${longWords.length}`);
      longWords.forEach(word => {
        selectedQuestions.push({
          type: 'recognition',
          word: word
        });
      });
      
      if (selectedQuestions.length > 5) {
        const spellingCount = selectedQuestions.filter(q => q.type === 'spelling').length;
        const recognitionCount = selectedQuestions.filter(q => q.type === 'recognition').length;
        
        if (spellingCount >= 3 && recognitionCount >= 2) {
          const spellingQuestions = selectedQuestions.filter(q => q.type === 'spelling').slice(0, 3);
          const recognitionQuestions = selectedQuestions.filter(q => q.type === 'recognition').slice(0, 2);
          selectedQuestions.length = 0;
          selectedQuestions.push(...spellingQuestions, ...recognitionQuestions);
        } else {
          selectedQuestions.length = 5;
        }
      }
      
      console.log('Final question order:');
      selectedQuestions.forEach((q, i) => {
        console.log(`${i + 1}. ${q.word.word} (${q.type})`);
      });
      
      console.log(`Total questions: ${selectedQuestions.length}`);
      console.log(`Spelling: ${selectedQuestions.filter(q => q.type === 'spelling').length}`);
      console.log(`Recognition: ${selectedQuestions.filter(q => q.type === 'recognition').length}`);
      
      setQuestions(selectedQuestions);
    };

    generateQuestions();
  }, [recentWords]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

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
        setScore(prevScore => {
          const newScore = prevScore + 1;
          calculatedScore = newScore;
          
          if (currentQuestionIndex === questions.length - 1) {
            setFinalScore(newScore);
          }
          
          return newScore;
        });
        
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
        
        const nextIndex = (lastPowerWordIndex + 1) % messages.length;
        setLastPowerWordIndex(nextIndex);
        
        const chosen = messages[nextIndex];
        setCompletionMessage(chosen.display);
        if (speak) speak(chosen.speak);
      } else {
        calculatedScore = score;
        if (currentQuestionIndex === questions.length - 1) {
          setFinalScore(score);
        }
        if (speak) speak(`Not quite! It's ${currentQuestion.word.word}`);
      }

      setTimeout(() => {
        moveToNextQuestion(calculatedScore);
      }, 2000);
    }
  };

  const handleRecognitionAnswer = (correct) => {
    let calculatedScore = score;
    
    if (correct) {
      setScore(prevScore => {
        const newScore = prevScore + 1;
        calculatedScore = newScore;
        
        if (currentQuestionIndex === questions.length - 1) {
          setFinalScore(newScore);
        }
        
        return newScore;
      });
    } else {
      calculatedScore = score;
      if (currentQuestionIndex === questions.length - 1) {
        setFinalScore(score);
      }
    }
    
    setTimeout(() => {
      moveToNextQuestion(calculatedScore);
    }, 500); // ✅ Reduced from 2000ms to 500ms - much faster!
  };

  const moveToNextQuestion = (calculatedScore) => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer([]);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      const finalScoreValue = calculatedScore !== undefined ? calculatedScore : score;
      setFinalTotal(totalQuestions);
      
      if (speak) speak(`Challenge complete! You scored ${finalScoreValue} out of ${totalQuestions}`);
      
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

  const handleAnimationComplete = () => {
    onExit(finalScore, finalTotal);
  };

  if (showAnimation) {
    return (
      <RunningTilesAnimation
        score={finalScore}
        total={finalTotal}
        onComplete={handleAnimationComplete}
      />
    );
  }

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
      'queue': '👥', 'question-mark': '❓'
    };
    return emojiMap[word.toLowerCase()] || '📝';
  };

  const isLetterStillNeeded = (letter, word, currentAnswer) => {
    const totalNeeded = word.toUpperCase().split('').filter(l => l === letter).length;
    const alreadyUsed = currentAnswer.filter(l => l === letter).length;
    return alreadyUsed < totalNeeded;
  };

  if (!currentQuestion) {
    return (
      <div className="challenge-overlay-fixed">
        <div className="challenge-container-fixed">
          <div className="challenge-loading">Loading challenge...</div>
        </div>
      </div>
    );
  }

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ-'.split('');

  return (
    <div className="challenge-overlay-fixed">
      <div className="challenge-container-fixed">
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

              {/* KEYBOARD + BUTTONS IN ONE GREEN CONTAINER */}
              <div className="keyboard-wrapper-container">
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

                {/* CONTROL BUTTONS INSIDE WRAPPER */}
                <div className="challenge-controls">
                  <button className="backspace-button" onClick={handleBackspace} disabled={showFeedback}>
                    ⌫ Backspace
                  </button>
                  <button className="exit-button" onClick={handleExit}>
                    🚪 Exit Challenge
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default MixedMasteryChallenge;