import React, { useState, useEffect } from 'react';
import './LearningScreen.css';
import { getWordsByCategory } from './wordList.js';
import parkBackground from './assets/park-background.png';
import boyModel from './assets/boy-model.png';
import girlModel from './assets/girl-model.png';
import MagicalTransition from './components/MagicalTransition';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import ComingSoonModal from './components/ComingSoonModal';

// Dynamically load all images from src/assets
const images = require.context('./assets', false);

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function LearningScreen(props) {
  // Load saved learning state for this category
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
  const [showComingSoonModal, setShowComingSoonModal] = useState(false);

  const categoryWords = getWordsByCategory(props.category);
  const currentWord = categoryWords[wordIndex];
  const [encouragementMessage, setEncouragementMessage] = useState('');

  // Auto-save learning progress whenever key states change
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

  // 🎵 Sound effects
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
    setEncouragementMessage(''); // ← ADD THIS LINE
  }, [wordIndex]);

  const getCurrentImage = () => {
    if (!currentWord || !currentWord.image) return null;
    if (typeof currentWord.image === 'object') {
      return chosenModel ? currentWord.image[chosenModel] : null;
    }
    return currentWord.image;
  };

  const imageFileName = getCurrentImage();

  const getSingularPluralHint = () => {
    if (!currentWord) return null;
    
    const pluralWords = {
      'Eyes': 'Eye',
      'Ears': 'Ear', 
      'Lips': 'Lip',
      'Cheeks': 'Cheek',
      'Dimples': 'Dimple',
      'Eyebrows': 'Eyebrow',
      'Eyelashes': 'Eyelash',
      'Eyelids': 'Eyelid',
      'Shoulders': 'Shoulder',
      'Arms': 'Arm',
      'Elbows': 'Elbow',
      'Hands': 'Hand',
      'Fingers': 'Finger',
      'Nails': 'Nail',
      'Palms': 'Palm',
      'Hips': 'Hip',
      'Feet': 'Foot',
      'Teeth': 'Tooth'
    };
    
    const word = currentWord.word;
    if (pluralWords[word]) {
      const singular = pluralWords[word].toLowerCase();
      const plural = word.toLowerCase();
      
      if (word === 'Lips') {
        return `If pointing only to one (top or bottom), we say '${singular}.'\nBut if pointing to both, we say '${plural}.'`;
      }
      
      if (word === 'Teeth') {
        return `If pointing only to one, we say '${singular}.'\nBut if to two or more, we say '${plural}.'`;
      }
      
      return `If pointing only to one, we say '${singular}.'\nBut if pointing to both, we say '${plural}.'`;
    }
    return null;
  };

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
      // Increment mistake count but DON'T show encouragement yet
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

        // Trigger reward with final mistake count
        setTimeout(() => triggerReward(mistakeCount + (correctPositions.includes(nextEmpty) ? 0 : 1)), 100);
      }
    }, 200);
  };

  const handleHintClick = (index) => {
    if (!showHints[index]) return;
    const correctLetter = currentWord.word.toUpperCase()[index];
    props.speak(correctLetter);
    playMagicSound();
    
    // Update all states
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

    // Check if word is now complete
    setTimeout(() => {
      const word = currentWord.word.toUpperCase();
      const updatedLetters = [...challengeLetters];
      updatedLetters[index] = correctLetter;
      
      // Check if all letters are filled
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
    console.log('Word length:', currentWord.word.length);
    console.log('Threshold:', Math.ceil(currentWord.word.length / 2));
    
    setShowReward(true);
    
    const wordLength = currentWord.word.length;
    const threshold = Math.ceil(wordLength / 2);
    
    // Determine if mistakes exceeded the threshold
    const hadManyMistakes = finalMistakeCount > threshold;
    
    console.log('hadManyMistakes:', hadManyMistakes);
    
    if (finalMistakeCount > 0) {
      // Had mistakes - choose message based on threshold
     if (hadManyMistakes) {
    // Exceeded threshold - randomly select ONE message and use it for both voice and display
  const encouragement = [
    "Good effort! Try again?",
    "Nice try! Give it another shot?",
    "You can do it! Go, go, go!"
  ];
  const message = encouragement[Math.floor(Math.random() * encouragement.length)];
  setEncouragementMessage(message); // ← STORE THE MESSAGE
  console.log('Playing encouragement:', message);
  // Remove the punctuation for speech
  props.speak(message);
      } else {
        // Had mistakes but within threshold - gentle encouragement
        const gentleEncouragement = [
          "Almost perfect! Try once more?",
          "So close! One more try?",
          "Great job! Can you get them all?"
        ];
        const message = gentleEncouragement[Math.floor(Math.random() * gentleEncouragement.length)];
        setEncouragementMessage(message); // ← STORE THIS TOO
        console.log('Playing gentle encouragement:', message);
        props.speak(message);
      }
    } else {
      // Perfect - no mistakes
      const congratulations = ["Excellent!", "Amazing!", "You did it!", "Perfect!"];
      const message = congratulations[Math.floor(Math.random() * congratulations.length)];
      console.log('Playing congratulations:', message);
      props.speak(message);
    }
    
    setTimeout(() => {
      setShowReward(false);
    }, 3000);
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
                className={`letter-blank ${filledLetters[i] ? 'filled' : ''} ${currentLetterIndex === i ? 'current' : ''}`}
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
            {showInstructionBox && getSingularPluralHint() && (
              <div className="instruction-box-keyboard">
                {getSingularPluralHint()}
              </div>
            )}
            
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
      {mistakeCount > Math.ceil(currentWord.word.length / 2)
        ? `💪 ${encouragementMessage} ⭐`
        : mistakeCount > 0
        ? `✨ ${encouragementMessage} ✨`
        : ['🎉 Perfect! 🎉', '⭐ Excellent! ⭐', '🏆 Amazing! 🏆', '🎊 You Did It! 🎊'][Math.floor(Math.random() * 4)]
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
      {viewState === 'animating' && disappearingSide && <MagicalTransition side={disappearingSide} />}
      <ComingSoonModal show={showComingSoonModal} onClose={handleCloseComingSoon} />
    </div>
  );
}

export default LearningScreen;