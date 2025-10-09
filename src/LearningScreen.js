import React, { useState, useEffect } from 'react';
import './LearningScreen.css';
import { getWordsByCategory } from './wordList.js';
import parkBackground from './assets/park-background.png';
import boyModel from './assets/boy-model.png';
import girlModel from './assets/girl-model.png';
import MagicalTransition from './components/MagicalTransition';
import OnScreenKeyboard from './components/OnScreenKeyboard';
import ComingSoonModal from './components/ComingSoonModal';

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function LearningScreen(props) {
  const [viewState, setViewState] = useState('selecting');
  const [chosenModel, setChosenModel] = useState(null);
  const [disappearingSide, setDisappearingSide] = useState(null);
  const [wordIndex, setWordIndex] = useState(0);
  
  const [isSpelling, setIsSpelling] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(-1);
  const [filledLetters, setFilledLetters] = useState([]);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeLetters, setChallengeLetters] = useState([]);
  const [showHints, setShowHints] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [hadMistake, setHadMistake] = useState(false);

  const categoryWords = getWordsByCategory(props.category);
  const currentWord = categoryWords[wordIndex];

 const playMagicSound = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const now = context.currentTime;

      // Create two oscillators to play a harmony
      const osc1 = context.createOscillator();
      const osc2 = context.createOscillator();
      const gainNode = context.createGain();

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(context.destination);

      osc1.type = 'sine';
      osc2.type = 'sine';

      // An encouraging, ascending C-Major harmony
      // First chord (C and E)
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now); // E5

      // Second, higher chord (G and B)
      osc1.frequency.setValueAtTime(783.99, now + 0.15); // G5
      osc2.frequency.setValueAtTime(987.77, now + 0.15); // B5

      // Control the volume to create a pleasant 'chime' sound
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.4, now + 0.05); // Quick fade in
      gainNode.gain.exponentialRampToValueAtTime(0.00001, now + 1); // Slow fade out

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1);
      osc2.stop(now + 1);
    } catch (e) {
      console.error("Magic sound error:", e);
    }
  };

  // --- UPDATED: This function now calls playMagicSound() ---
  const handleCharacterSelect = (model) => {
    setChosenModel(model);
    setDisappearingSide(model === 'boy' ? 'right' : 'left');
    playMagicSound(); // Play the sound effect
    setViewState('animating');
    setTimeout(() => { setViewState('activity'); }, 1500);
  };

  const handleNextWord = () => {
    setWordIndex((prevIndex) => (prevIndex + 1) % categoryWords.length);
  };
  
  useEffect(() => {
    setIsSpelling(false);
    setCurrentLetterIndex(-1);
    setFilledLetters([]);
    setChallengeMode(false);
    setChallengeLetters([]);
    setShowHints([]);
    setIsCompleted(false);
    setShowReward(false);
    setHadMistake(false);
  }, [wordIndex]);
  
  const getCurrentImage = () => {
    if (!currentWord || !currentWord.image) return null;
    if (typeof currentWord.image === 'object' && currentWord.image !== null) {
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
      setFilledLetters(prev => { const newRevealed = [...prev]; newRevealed[i] = letters[i]; return newRevealed; });
      await wait(800);
    }
    setCurrentLetterIndex(-1);
    await wait(800);
    await props.speak(`${word}!`);
    setTimeout(() => setIsSpelling(false), 1000);
  };

  const handleAcceptChallenge = () => {
    setChallengeMode(true);
    setFilledLetters(Array(currentWord.word.length).fill(null));
    setChallengeLetters(Array(currentWord.word.length).fill(''));
    setHadMistake(false);
  };

  const handleKeyboardLetter = (letter) => {
    if (isCompleted) return;
    props.speak(letter);
    const nextEmptyIndex = challengeLetters.findIndex(l => l === '');
    if (nextEmptyIndex !== -1) {
      const newLetters = [...challengeLetters];
      newLetters[nextEmptyIndex] = letter;
      setChallengeLetters(newLetters);
      if (newLetters.join('') === currentWord.word.toUpperCase()) {
        setIsCompleted(true);
        setTimeout(triggerReward, 500);
      } else if (letter !== currentWord.word.toUpperCase()[nextEmptyIndex]) {
        playErrorSound();
        setHadMistake(true);
        setShowHints(prev => { const newHints = [...prev]; newHints[nextEmptyIndex] = true; return newHints; });
      }
    }
  };

  const handleHintClick = (index) => {
    if (!showHints[index]) return;
    const correctLetter = currentWord.word.toUpperCase()[index];
    props.speak(correctLetter);
    const newFilled = [...filledLetters];
    newFilled[index] = correctLetter;
    setFilledLetters(newFilled);
    setShowHints(prev => { const newHints = [...prev]; newHints[index] = false; return newHints; });
    const newChallengeLetters = [...challengeLetters];
    newChallengeLetters[index] = correctLetter;
    setChallengeLetters(newChallengeLetters);
  };
  
  const playErrorSound = () => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const o = context.createOscillator();
      const g = context.createGain();
      o.connect(g);
      g.connect(context.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(523.25, context.currentTime);
      o.frequency.setValueAtTime(392.00, context.currentTime + 0.1);
      g.gain.setValueAtTime(0.3, context.currentTime);
      g.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
      o.start(context.currentTime);
      o.stop(context.currentTime + 0.4);
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  const triggerReward = () => {
    setShowReward(true);
    const congratulations = ["Excellent!", "Amazing!", "You did it!"];
    const encouragement = ["Good work!", "Nice try!"];
    const message = hadMistake ? encouragement[Math.floor(Math.random() * encouragement.length)] : congratulations[Math.floor(Math.random() * congratulations.length)];
    props.speak(message);
    setTimeout(() => {
      setShowReward(false);
      handleNextWord();
    }, 3000);
  };
  
  if (!currentWord) {
    return (
      <div className="learning-screen-container" style={{backgroundColor: '#9370DB'}}>
        <h1>Coming Soon!</h1>
        <p>Category: {props.category}</p>
        <button className="back-button-fixed" onClick={() => props.onNavigate('menu')}>Back to Menu</button>
      </div>
    );
  }

  return (
    <div className="learning-screen-container" style={{ backgroundImage: `url(${parkBackground})` }}>
      <div className={`character-selection-container ${viewState !== 'selecting' ? 'hidden' : ''}`}>
        <h1 className="selection-title">Choose a playmate!</h1>
        <div className="character-container">
          <div className="character-model" onClick={() => handleCharacterSelect('boy')}><img src={boyModel} alt="Boy"/></div>
          <div className="character-model" onClick={() => handleCharacterSelect('girl')}><img src={girlModel} alt="Girl"/></div>
        </div>
        <button className="back-button-fixed" onClick={() => props.onNavigate('menu')}>
          Back to Menu
        </button>
      </div>

      <div className={`activity-view ${viewState === 'activity' ? 'visible' : ''}`}>
        <div className="top-button-row">
            <button className="back-button" onClick={() => props.onNavigate('menu')}>Back to Menu</button>
            <button className="next-word-button" onClick={handleNextWord}>Next Word</button>
        </div>
        <div className={`game-container ${challengeMode ? 'challenge-mode' : ''}`}>
          <div className={`word-image-container ${isSpelling ? 'spelling-mode' : ''}`}>
            {imageFileName && (
              (() => {
                  const isLongWord = currentWord.word.length > 7;
                  const imageClass = `activity-image ${isSpelling || (challengeMode && isLongWord) ? 'small' : ''}`;
                  return <img src={require(`./assets/${imageFileName}`)} alt={currentWord.word} className={imageClass} />;
              })()
            )}
          </div>
          <div className={`word-blanks-container ${isSpelling ? 'spelling-mode' : ''}`}>
            {currentWord.word.split('').map((letter, index) => (
              <div key={index} className={`letter-blank ${filledLetters[index] ? 'filled' : ''} ${currentLetterIndex === index ? 'current' : ''}`} onClick={() => handleHintClick(index)} style={{ cursor: showHints[index] ? 'pointer' : 'default' }}>
                {showHints[index] ? '?' : (filledLetters[index] || '')}
              </div>
            ))}
          </div>
          {!challengeMode && (
            <div className="button-row">
              <button className="hear-word-button" onClick={handleSpellWord} disabled={isSpelling}>🔊 Hear the Word</button>
              {!isSpelling && (
                <button className="challenge-button" onClick={handleAcceptChallenge}>Accept Challenge</button>
              )}
            </div>
          )}
        </div>
        
        {challengeMode && (
          <div className="challenge-section">
            <div className="challenge-blanks-container">
              {currentWord.word.split('').map((char, index) => (
                char === ' '
                  ? <div key={index} className="word-space"></div>
                  : <div key={index} className="challenge-blank">{challengeLetters[index]}</div>
              ))}
            </div>
            {!isCompleted && (
              <OnScreenKeyboard onLetterClick={handleKeyboardLetter} usedLetters={challengeLetters.filter(l=>l!=='')} currentWord={currentWord} />
            )}
            {isCompleted && (
                <div className="completion-message">
                  <h2>🎉 Perfect! 🎉</h2>
                </div>
              )}
          </div>
        )}
      </div>
      
      {showReward && <div className="confetti-overlay"></div>}
      {viewState === 'animating' && disappearingSide && <MagicalTransition side={disappearingSide} />}
    </div>
  );
}

export default LearningScreen;