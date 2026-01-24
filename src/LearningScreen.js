import React, { useState, useEffect } from 'react';
import scoreDB from './services/scoreDatabase';
import './LearningScreen.css';
import { getWordsByCategory } from './wordList.js';
import parkBackground from './assets/park-background.png';
import boyModel from './assets/boy-model.png';
import girlModel from './assets/girl-model.png';
import MagicalTransition from './components/MagicalTransition';
import GrammarRulePage from './components/GrammarRulePage';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import ComingSoonModal from './components/ComingSoonModal';

const images = require.context('./assets', false);
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function LearningScreen(props) {
  // Load saved learning state
  const getSavedLearningState = () => {
    try {
      const saved = localStorage.getItem(`learningState_${props.category}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading learning state:', e);
      return null;
    }
  };

  const savedLearning = getSavedLearningState();

  // All state declarations
  const [showInstructionBox, setShowInstructionBox] = useState(false);
  const [viewState, setViewState] = useState(savedLearning?.viewState || 'selecting');
  const [chosenModel, setChosenModel] = useState(savedLearning?.chosenModel || null);
  const [disappearingSide, setDisappearingSide] = useState(null);
  const [wordIndex, setWordIndex] = useState(savedLearning?.wordIndex || 0);
  const [isSpelling, setIsSpelling] = useState(false);
  const [filledLetters, setFilledLetters] = useState([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeLetters, setChallengeLetters] = useState([]);
  const [showHints, setShowHints] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [showGrammarRule, setShowGrammarRule] = useState(false);
  const [skipCelebration, setSkipCelebration] = useState(false);
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [encouragementMessage, setEncouragementMessage] = useState('');
  const [lastEncouragementIndex, setLastEncouragementIndex] = useState(-1);
  const [showCountdown, setShowCountdown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [pendingGrammarRule, setPendingGrammarRule] = useState(false);

  const categoryWords = getWordsByCategory(props.category);
  const currentWord = categoryWords[wordIndex];
  const [countdownAnimation, setCountdownAnimation] = useState(1);

  // Auto-save learning progress
  useEffect(() => {
    const learningState = {
      viewState,
      chosenModel,
      wordIndex,
      lastSaved: new Date().toISOString()
    };
    try {
      localStorage.setItem(`learningState_${props.category}`, JSON.stringify(learningState));
    } catch (e) {
      console.error('Error saving learning state:', e);
    }
  }, [viewState, chosenModel, wordIndex, props.category]);

  // Reset state when word changes
  useEffect(() => {
    setIsSpelling(false);
    setFilledLetters([]);
    setCurrentLetterIndex(-1);
    setChallengeMode(false);
    setChallengeLetters([]);
    setShowHints([]);
    setIsCompleted(false);
    setShowReward(false);
    setMistakeCount(0);
    setShowInstructionBox(false);
    setEncouragementMessage('');
    setCompletionMessage('');
    setPendingGrammarRule(false);
  }, [wordIndex]);

  // Sound effects
  const playMagicSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc2.frequency.setValueAtTime(659.25, now);
      osc1.frequency.setValueAtTime(783.99, now + 0.15);
      osc2.frequency.setValueAtTime(987.77, now + 0.15);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.4, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.00001, now + 1);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1);
      osc2.stop(now + 1);
    } catch (e) {
      console.error('Magic sound error:', e);
    }
  };

  const playErrorSound = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(523.25, ctx.currentTime);
      o.frequency.setValueAtTime(392.00, ctx.currentTime + 0.1);
      g.gain.setValueAtTime(0.3, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      o.start(ctx.currentTime);
      o.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error('Error sound error:', e);
    }
  };

  const handleCharacterSelect = (model) => {
    setChosenModel(model);
    setDisappearingSide(model === 'boy' ? 'right' : 'left');
    playMagicSound();
    setViewState('animating');
    setTimeout(() => setViewState('activity'), 1500);
  };

  const handlePreviousWord = () => {
    setWordIndex(prev => prev > 0 ? prev - 1 : categoryWords.length - 1);
  };

  const handleNextWord = () => {
    // Check if user is skipping "Eyes" without perfect score
    if (currentWord && currentWord.word === 'Eyes' && pendingGrammarRule) {
      setPendingGrammarRule(false);
      setShowGrammarRule(true);
      setSkipCelebration(true);
      return; // Don't advance yet - grammar rule will handle it
    }
    
    if (currentWord && currentWord.word === 'Cleft Chin') {
      setShowComingSoonModal(true);
    } else {
      setWordIndex(prev => prev + 1);
    }
  };

  const handleCloseComingSoon = () => {
    setShowComingSoonModal(false);
    props.onNavigate('menu');
  };

  const getCurrentImage = () => {
    if (!currentWord || !currentWord.image) return null;
    if (typeof currentWord.image === 'object') {
      return chosenModel ? currentWord.image[chosenModel] : null;
    }
    return currentWord.image;
  };

  const imageFileName = getCurrentImage();

  const handleSpellWord = async () => {
    if (!currentWord || isSpelling) return;
    setIsSpelling(true);
    const word = currentWord.word;
    const letters = word.toUpperCase().split('');
    setFilledLetters(Array(letters.length).fill(null));
    await props.speak(`Let's spell ${word}`);
    await wait(1500);
    for (let i = 0; i < letters.length; i++) {
      setCurrentLetterIndex(i);
      await props.speak(letters[i]);
      setFilledLetters(prev => {
        const copy = [...prev];
        copy[i] = letters[i];
        return copy;
      });
      await wait(800);
    }
    setCurrentLetterIndex(-1);
    await props.speak(`${word}!`);
    setTimeout(() => setIsSpelling(false), 1000);
  };

  const handleAcceptChallenge = () => {
    if (!currentWord || currentWord.word.length >= 7) {
      props.speak("This word is too long for a challenge. Try a shorter one!");
      playErrorSound();
      return;
    }
    setChallengeMode(true);
    const len = currentWord.word.length;
    setFilledLetters(Array(len).fill(null));
    setChallengeLetters(Array(len).fill(''));
    setShowHints(Array(len).fill(false));
    setMistakeCount(0);
    setShowInstructionBox(false);
  };

  const handleKeyboardLetter = (letter) => {
    if (isCompleted) return;
    
    props.speak(letter);
    const word = currentWord.word.toUpperCase();
    const upperLetter = letter.toUpperCase();
    const correctPositions = [...word]
      .map((l, i) => (l === upperLetter ? i : -1))
      .filter(i => i !== -1);
    const nextEmpty = challengeLetters.findIndex(l => l === '');
    
    if (correctPositions.includes(nextEmpty)) {
      playMagicSound();
      setChallengeLetters(prev => {
        const copy = [...prev];
        copy[nextEmpty] = upperLetter;
        return copy;
      });
      setFilledLetters(prev => {
        const copy = [...prev];
        copy[nextEmpty] = upperLetter;
        return copy;
      });
    } else {
      playErrorSound();
      setMistakeCount(prev => prev + 1);
      
      if (nextEmpty !== -1) {
        setFilledLetters(prev => {
          const copy = [...prev];
          copy[nextEmpty] = '?';
          return copy;
        });
        setShowHints(prev => {
          const copy = [...prev];
          copy[nextEmpty] = true;
          return copy;
        });
      }
    }
    
    setTimeout(() => {
      const completed = challengeLetters.map((l, i) => l || (correctPositions.includes(i) ? upperLetter : ''));
      if (completed.join('') === word) {
        setIsCompleted(true);
        setShowInstructionBox(true);
        setTimeout(() => triggerReward(mistakeCount + (correctPositions.includes(nextEmpty) ? 0 : 1)), 100);
      }
    }, 200);
  };

  const handleHintClick = (index) => {
    if (!showHints[index]) return;
    const correctLetter = currentWord.word.toUpperCase()[index];
    props.speak(correctLetter);
    playMagicSound();
    
    setFilledLetters(prev => {
      const copy = [...prev];
      copy[index] = correctLetter;
      return copy;
    });
    
    setChallengeLetters(prev => {
      const copy = [...prev];
      copy[index] = correctLetter;
      return copy;
    });
    
    setShowHints(prev => {
      const copy = [...prev];
      copy[index] = false;
      return copy;
    });
    
    setTimeout(() => {
      const word = currentWord.word.toUpperCase();
      const updatedLetters = [...challengeLetters];
      updatedLetters[index] = correctLetter;
      
      const isComplete = updatedLetters.every(l => l !== '');
      
      if (isComplete && updatedLetters.join('') === word) {
        setIsCompleted(true);
        setShowInstructionBox(true);
        setTimeout(() => triggerReward(mistakeCount), 100);
      }
    }, 200);
  };

  const triggerReward = (finalMistakeCount) => {
    console.log('triggerReward called with mistakeCount:', finalMistakeCount);
    
    setShowReward(true);

    // Record attempt in database
    const isCorrect = finalMistakeCount === 0;
    scoreDB.recordLearningAttempt(currentWord.word, isCorrect)
      .then(scoreData => {
        console.log('Score recorded:', scoreData);
      })
      .catch(err => {
        console.error('Error recording score:', err);
      });
    
    // Record perfect score separately
    if (finalMistakeCount === 0) {
      scoreDB.recordPerfectScore(currentWord.word)
        .catch(err => console.error('Error recording perfect score:', err));
    }

    const wordLength = currentWord.word.length;
    const threshold = Math.ceil(wordLength / 2);
    const hadManyMistakes = finalMistakeCount > threshold;
    
    // Handle Grammar Rule Trigger for "Eyes"
    if (currentWord.word === 'Eyes' && finalMistakeCount === 0) {
      // Only show grammar rule if perfect score
      setTimeout(() => {
        setShowGrammarRule(true);
        setSkipCelebration(false);
      }, 750);
    }
    
    // Handle Audio Feedback AND set completion message
    if (finalMistakeCount > 0) {
      if (hadManyMistakes) {
        const encouragement = [
          "Good effort! Try again?",
          "Nice try! Give it another shot?",
          "You can do it! Go, go, go!"
        ];
        const nextIndex = (lastEncouragementIndex + 1) % encouragement.length;
        const message = encouragement[nextIndex];

        setLastEncouragementIndex(nextIndex);
        setEncouragementMessage(message);
        setCompletionMessage('');
        props.speak(message);

        // Reset for retry after audio finishes
        setTimeout(() => {
          setIsCompleted(false);
          setFilledLetters(Array(currentWord.word.length).fill(null));
          setChallengeLetters(Array(currentWord.word.length).fill(''));
          setShowHints(Array(currentWord.word.length).fill(false));
          setMistakeCount(0);
          
          // Mark that grammar rule is pending for "Eyes"
          if (currentWord.word === 'Eyes') {
            setPendingGrammarRule(true);
          }
        }, 2500);
        
      } else {
        const gentleEncouragement = [
          "Doing good! Another try?",
          "So close! One more try?",
          "Great job! Can you get them all?"
        ];
        const nextIndex = (lastEncouragementIndex + 1) % gentleEncouragement.length;
        const message = gentleEncouragement[nextIndex];

        setLastEncouragementIndex(nextIndex);
        setEncouragementMessage(message);
        setCompletionMessage('');
        props.speak(message);

        // Reset for retry after audio finishes
        setTimeout(() => {
          setIsCompleted(false);
          setFilledLetters(Array(currentWord.word.length).fill(null));
          setChallengeLetters(Array(currentWord.word.length).fill(''));
          setShowHints(Array(currentWord.word.length).fill(false));
          setMistakeCount(0);
          
          // Mark that grammar rule is pending for "Eyes"
          if (currentWord.word === 'Eyes') {
            setPendingGrammarRule(true);
          }
        }, 2500);
      }
     } else {
      // Perfect - no mistakes - Expanded power words with no consecutive repeats
      const messages = [
        { display: '🎉 Perfect! 🎉', speak: 'Perfect' },
        { display: '⭐ Excellent! ⭐', speak: 'Excellent' },
        { display: '🏆 Amazing! 🏆', speak: 'Amazing' },
        { display: '🎊 You Did It! 🎊', speak: 'You Did It' },
        { display: '✨ Splendid! ✨', speak: 'Splendid' },
        { display: '🌟 Genius! 🌟', speak: 'Genius' },
        { display: '💫 Brilliant! 💫', speak: 'Brilliant' },
        { display: '🎯 Outstanding! 🎯', speak: 'Outstanding' },
        { display: '👏 Fantastic! 👏', speak: 'Fantastic' },
        { display: '🌈 Wonderful! 🌈', speak: 'Wonderful' },
        { display: '⭐ Superb! ⭐', speak: 'Superb' },
        { display: '🎪 Magnificent! 🎪', speak: 'Magnificent' },
        { display: '🏅 Champion! 🏅', speak: 'Champion' },
        { display: '💝 Incredible! 💝', speak: 'Incredible' },
        { display: '🎨 Marvelous! 🎨', speak: 'Marvelous' }
      ];
      
      // Ensure no consecutive repeats
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * messages.length);
      } while (randomIndex === lastEncouragementIndex && messages.length > 1);
      
      const chosen = messages[randomIndex];
      setLastEncouragementIndex(randomIndex);
      setCompletionMessage(chosen.display);
      setEncouragementMessage('');
      props.speak(chosen.speak);
     
      // Clear pending grammar rule if "Eyes" is now perfect
      if (currentWord.word === 'Eyes') {
        setPendingGrammarRule(false);
      }
    }
    
    setTimeout(() => {
  setShowReward(false);
  
  if (finalMistakeCount === 0 && currentWord.word !== 'Eyes') {
    setCountdownAnimation(Math.floor(Math.random() * 15) + 1); // Pick once!
    setShowCountdown(true);
    setCountdownValue(3);
    
    setTimeout(() => setCountdownValue(2), 1000);
    setTimeout(() => setCountdownValue(1), 2000);
    
    setTimeout(() => {
      setShowCountdown(false);
      handleNextWord();
    }, 3000);
  }
}, 1500);
};

  const isLongWord = currentWord && currentWord.word.length >= 7;

  if (!currentWord) {
    return (
      <div className="learning-screen-container" style={{ backgroundColor: '#9370DB' }}>
        <h1>End of Category!</h1>
        <p>Category: {props.category}</p>
        <button className="back-button-fixed" onClick={() => {
          localStorage.removeItem(`learningState_${props.category}`);
          props.onNavigate('menu');
        }}>
          Back to Menu
        </button>
      </div>
    );
  }

  return (
    <div className="learning-screen-container" style={{ backgroundImage: `url(${parkBackground})` }}>  
      <div className={`character-selection-container ${viewState !== 'selecting' ? 'hidden' : ''}`}>
        <h1 className="selection-title">Choose a playmate!</h1>
        <div className="character-container">
          <div className="character-model" onClick={() => handleCharacterSelect('boy')}>
            <img src={boyModel} alt="Boy" />
          </div>
          <div className="character-model" onClick={() => handleCharacterSelect('girl')}>
            <img src={girlModel} alt="Girl" />
          </div>
        </div>
        <button className="back-button-fixed" onClick={() => {
          localStorage.removeItem(`learningState_${props.category}`);
          props.onNavigate('menu');
        }}>
          Back to Menu
        </button>
      </div>

      <div className={`activity-view ${viewState === 'activity' ? 'visible' : ''}`}>
        <div className="top-nav-bar">
          {wordIndex > 0 && (
            <button className="previous-word-button" onClick={handlePreviousWord}>Previous Word</button>
          )}
          <button className="next-word-button" onClick={handleNextWord}>Next Word</button>
        </div>

        <div className={`game-container ${challengeMode ? 'challenge-mode' : ''}`}>
          <div className={`word-image-container ${isSpelling ? 'spelling-mode' : ''}`}>
            {imageFileName && (
              <img
                src={images(`./${imageFileName}`)}
                alt={currentWord.word}
                className={`activity-image ${isSpelling ? 'small' : ''}`}
              />
            )}
          </div>

          <div className={`word-blanks-container ${isSpelling ? 'spelling-mode' : ''}`}>
            {currentWord.word.split('').map((_, i) => (
              <div
                key={i}
                className={`letter-blank ${filledLetters[i] ? 'filled' : ''} ${currentLetterIndex === i ? 'current' : ''} ${showHints[i] ? 'question-mark' : ''}`}
                onClick={() => handleHintClick(i)}
              >
                {showHints[i] ? '?' : (filledLetters[i] || '')}
              </div>
            ))}
          </div>

          {!challengeMode && (
            <div className={`button-row ${isLongWord ? 'centered' : ''}`}>
              <button className="hear-word-button" onClick={handleSpellWord}>🔊 Hear the Word</button>
              {!isLongWord && (
                <button className="challenge-button" onClick={handleAcceptChallenge}>Accept Challenge</button>
              )}
            </div>
          )}
        </div>

        {challengeMode && (
          <div className="challenge-section">
            {!isCompleted && (
              <OnScreenKeyboard
                onLetterClick={handleKeyboardLetter}
                usedLetters={challengeLetters.filter(l => l !== '')}
                currentWord={currentWord}
              />
            )}
            {isCompleted && (
              <div className="completion-message">
                <h2>
                  {encouragementMessage
                    ? (mistakeCount > Math.ceil(currentWord.word.length / 2)
                        ? `💪 ${encouragementMessage} ⭐`
                        : `✨ ${encouragementMessage} ✨`)
                    : (completionMessage || '🎉 Perfect! 🎉')
                  }
                </h2>
              </div>
            )}
          </div>
        )}

        <button className="learning-back-button" onClick={() => {
          localStorage.removeItem(`learningState_${props.category}`);
          props.onNavigate('menu');
        }}>
          Back to Menu
        </button>
      </div>

      {showReward && <div className="confetti-overlay"></div>}
      
      {showCountdown && (
  <div className={`countdown-overlay countdown-animation-${countdownAnimation}`}>
    
    <div className="countdown-circle">
      <span className="countdown-number">{countdownValue}</span>
    </div>
    <p className="countdown-text">Moving to next word...</p>
  </div>
)}

      {viewState === 'animating' && disappearingSide && <MagicalTransition side={disappearingSide} />}
      
      {showGrammarRule && (
        <GrammarRulePage
          onContinue={() => {
            setShowGrammarRule(false);
            setSkipCelebration(false);
            
            // Auto-advance after grammar rule
            setShowCountdown(true);
            setCountdownValue(3);
            setTimeout(() => setCountdownValue(2), 1000);
            setTimeout(() => setCountdownValue(1), 2000);
            setTimeout(() => {
              setShowCountdown(false);
              handleNextWord();
            }, 2750);
          }}
          speak={props.speak}
          skipCelebration={skipCelebration}
        />
      )}
      
      <ComingSoonModal show={showComingSoonModal} onClose={handleCloseComingSoon} />
    </div>
  );
}

export default LearningScreen;