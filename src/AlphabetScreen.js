import React, { useState, useEffect } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';
import birdBackground from './assets/pair-birds.png';
import AlphabetChallenge from './components/AlphabetChallenge';
import ChallengeBanner from './components/ChallengeBanner';
import scoreDB from './services/scoreDatabase';
import HexagonTransition from './components/HexagonTransition';
import MixedMasteryChallenge from './components/MixedMasteryChallenge';

// Dynamic image context setup - LOAD FROM BOTH FOLDERS
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

// Load from main assets folder (labeled images)
const mainImages = importAll(require.context('./assets', false, /\.(png|jpe?g|svg)$/));

// Load from emojis folder
const emojiImages = importAll(require.context('./assets/emojis', false, /\.(png|jpe?g|svg)$/));

// Combine both
const allImages = { ...mainImages, ...emojiImages };

const getImagePath = (fileName) => {
  if (allImages[fileName]) {
    return allImages[fileName];
  }
  console.warn(`AlphabetScreen: Image not found: ${fileName}`);
  return null;
};

function AlphabetScreen(props) {
  const { userId = 'user_1' } = props;
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  // Load saved state
  const getSavedAlphabetState = () => {
    try {
      const saved = localStorage.getItem(`${userId}_alphabetScreenState`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading alphabet state:', e);
      return null;
    }
  };

  const savedState = getSavedAlphabetState();

  // STATE DEFINITIONS
  const [selectedWord, setSelectedWord] = useState(savedState?.selectedWord || null);
  const [letterProgress, setLetterProgress] = useState(savedState?.letterProgress || {});
  const [activeLetter, setActiveLetter] = useState(savedState?.activeLetter || null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeMode, setChallengeMode] = useState(null);
  const [challengeLetter, setChallengeLetter] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // ✅ NEW: IMAGE-BASED MASTERY CHECK WITH HEXAGON TRANSITION
  const [viewedImages, setViewedImages] = useState(savedState?.viewedImages || []);
  const [recentWords, setRecentWords] = useState(savedState?.recentWords || []);
  const [showHexagonTransition, setShowHexagonTransition] = useState(false);
  const [showMasteryChallenge, setShowMasteryChallenge] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState(savedState?.snoozeUntil || null);

  // ✅ Check for mastery prompt every 5 images
 useEffect(() => {
  console.log('Viewed images count:', viewedImages.length);
  console.log('Snooze until:', snoozeUntil);
  
  // Skip if user has snoozed
  const ONE_THIRD_MARK = Math.floor(260 / 3);
  if (snoozeUntil === 'third' && viewedImages.length < ONE_THIRD_MARK) return;
  if (snoozeUntil === 'half' && viewedImages.length < 130) return;
  if (snoozeUntil === 'complete' && viewedImages.length < 260) return;
  
  if (viewedImages.length > 0 && viewedImages.length % 5 === 0) {
    const lastPromptAt = parseInt(localStorage.getItem(`${userId}_lastMasteryPromptAt`) || '0');
    
    // ✅ FIX: Only trigger if this is a NEW milestone
    if (viewedImages.length > lastPromptAt) {
      console.log('Triggering mastery check at', viewedImages.length, 'images');
      
      setTimeout(() => {
        setShowHexagonTransition(true);
        // ✅ Set the flag IMMEDIATELY, not in setTimeout
        localStorage.setItem(`${userId}_lastMasteryPromptAt`, viewedImages.length.toString());
      }, 3000);
    }
  }
}, [viewedImages, snoozeUntil]);

    // Auto-save state
  useEffect(() => {
    const stateToSave = {
      selectedWord,
      letterProgress,
      activeLetter,
      viewedImages,
      recentWords,
      snoozeUntil,
      lastSaved: new Date().toISOString()
    };

    try {
      localStorage.setItem(`${userId}_alphabetScreenState`, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving alphabet state:', e);
    }
  }, [selectedWord, letterProgress, activeLetter, viewedImages, recentWords, snoozeUntil]);

  const getLetterIconSource = (letter) => {
    const firstWord = wordList.find(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter.toUpperCase())
    );
    return firstWord ? firstWord.image : null;
  };

  // ✅ UPDATED: Track each image view
  const handleLetterClick = (letter) => {
    const wordsForLetter = wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    
    if (wordsForLetter.length === 0) return;
    
    setActiveLetter(letter);
    const currentIndex = letterProgress[letter] || 0;
    const foundWord = wordsForLetter[currentIndex];
    const nextIndex = (currentIndex + 1) % wordsForLetter.length;
    
    setLetterProgress({
      ...letterProgress,
      [letter]: nextIndex
    });
    
    setSelectedWord({
      ...foundWord,
      currentIndex: currentIndex,
      totalCount: wordsForLetter.length,
      letter: letter
    });
    props.speak(foundWord.word);
    
    // ✅ Track this image view
    const imageId = `${foundWord.id}-${foundWord.word}`;
    if (!viewedImages.includes(imageId)) {
      console.log('New image viewed:', imageId);
      setViewedImages([...viewedImages, imageId]);
      
      // Keep last 5 words for mastery check
      const updatedRecent = [...recentWords, foundWord];
      if (updatedRecent.length > 5) {
        updatedRecent.shift(); // Remove oldest
      }
      setRecentWords(updatedRecent);
    }
    
    if (nextIndex === 0 && currentIndex > 0) {
      setTimeout(() => {
        setActiveLetter(null);
      }, 100);
    }
  };

  const handleCloseWord = () => {
    setSelectedWord(null);
    setActiveLetter(null);
  };

  const handleBackToMenu = () => {
    localStorage.removeItem(`${userId}_alphabetScreenState`);
    localStorage.removeItem(`${userId}_lastMasteryPromptAt`);
    props.onNavigate('menu');
  };

  const hasMoreImages = (letter) => {
    if (activeLetter !== letter) return false;
    
    const wordsForLetter = wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    
    const currentProgress = letterProgress[letter] || 0;
    
    return currentProgress < wordsForLetter.length;
  };

  const handleStartRandomChallenge = () => {
    setShowBanner(false);
    setChallengeMode('random');
    setShowChallenge(true);
    if (props.speak) props.speak("Random challenge! Let's go!");
  };

  const handleStartLetterChallenge = (letter) => {
    setChallengeMode('per-letter');
    setChallengeLetter(letter);
    setShowChallenge(true);
    if (props.speak) props.speak(`Let's practice ${letter} words!`);
  };

  const handleExitChallenge = () => {
    setShowChallenge(false);
    setChallengeMode(null);
    setChallengeLetter(null);
  };

  const handleDismissBanner = () => {
    setShowBanner(false);
    setBannerDismissed(true);
    localStorage.setItem('${userId}challengeBannerDismissed', 'true');
  };

  // ✅ HEXAGON TRANSITION HANDLERS
  const handleAcceptMasteryCheck = () => {
    console.log('Mastery check accepted, recent words:', recentWords);
    setShowHexagonTransition(false);
    setShowMasteryChallenge(true);
    setSnoozeUntil(null); // Clear any snooze
  };
  const handleSnoozeMasteryCheck = (option) => {
  console.log('Mastery check snoozed until:', option);
  setShowHexagonTransition(false);
  setSnoozeUntil(option);
  };
  const handleDeclineMasteryCheck = () => {
    setShowHexagonTransition(false);
    setSnoozeUntil(null); // Clear any snooze
  };

  const handleExitMasteryCheck = (score, total) => {
  setShowMasteryChallenge(false);
  setSnoozeUntil(null);
  
  console.log(`Score: ${score}, Total: ${total}, Ratio: ${score/total}`);
  
  const accuracy = total > 0 ? (score / total) * 100 : 0;
  const isPerfect = score === total;
  
  const wordsTestedString = recentWords
    .map(w => w.word)
    .join(', ');
  
  const saveResults = async () => {
    if (!scoreDB.db) await scoreDB.init();
    await scoreDB.recordLearningAttempt(
      `Mastery Check: ${wordsTestedString}`,
      isPerfect,
      userId
    );
    for (const [index, word] of recentWords.entries()) {
      const isCorrect = index < score;
      await scoreDB.recordLearningAttempt(
        `${word.letter || word.word[0]}-${word.word}`,
        isCorrect,
        userId
      );
    }
  };
  saveResults();
  
  if (total === 0) {
    // say nothing
  } else if (score === 0) {
    setTimeout(() => {
      if (props.speak) props.speak("Don't give up! Try again!");
    }, 500);
  } else {
    const ratio = score / total;
    setTimeout(() => {
      if (score === total) {
        const powerWords = [
          'Perfect!', 'Excellent!', 'Amazing!', 'You Did It!',
          'Splendid!', 'Genius!', 'Brilliant!', 'Outstanding!',
          'Fantastic!', 'Wonderful!'
        ];
        const chosen = powerWords[Math.floor(Math.random() * powerWords.length)];
        if (props.speak) props.speak(chosen);
      } else if (ratio >= 0.8) {
        if (props.speak) props.speak("So close! Almost perfect!");
      } else if (ratio >= 0.6) {
        if (props.speak) props.speak("Nice work! You're getting there!");
      } else if (ratio >= 0.4) {
        if (props.speak) props.speak("Good try! Practice makes perfect!");
      } else {
        if (props.speak) props.speak("That's a start! Keep going!");
      }
    }, 500);
  }
};

  // ✅ If hexagon transition is active
  if (showHexagonTransition) {
    return (
      <HexagonTransition
        onAccept={handleAcceptMasteryCheck}
        onDecline={handleDeclineMasteryCheck}
        onSnooze={handleSnoozeMasteryCheck}
        speak={props.speak}
      />
    );
  }

  // ✅ If mastery check challenge is active
  if (showMasteryChallenge) {
    return (
      <MixedMasteryChallenge
        recentWords={recentWords}
        onExit={handleExitMasteryCheck}
        speak={props.speak}
      />
    );
  }

  // If regular challenge mode
  if (showChallenge) {
    return (
      <AlphabetChallenge
        mode={challengeMode}
        selectedLetter={challengeLetter}
        onExit={handleExitChallenge}
        speak={props.speak}
      />
    );
  }

  return (
    <div className="app-screen alphabet-screen-container">
      {/* Challenge Banner */}
      {showBanner && !bannerDismissed && (
        <ChallengeBanner
          onStartChallenge={handleStartRandomChallenge}
          onDismiss={handleDismissBanner}
        />
      )}

      {/* Top Section - Video OR Word Image */}
      <div className="top-section">
        {!selectedWord ? (
          <div className="video-section">
            <h2 className="alphabet-title">Alphabet Fun</h2>
            <div className="video-container">
              <iframe
                src="https://www.youtube.com/embed/71h8MZshGSs"
                title="Alphabet Song"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <p className="credit-line">Video courtesy of CoComelon - Nursery Rhymes</p>
          </div>
        ) : (
          <div className="word-display-section">
            <button className="close-word-button" onClick={handleCloseWord}>×</button>
            <div className="word-image-frame">
              <img
                src={getImagePath(selectedWord.image)}
                alt={selectedWord.word}
              />
            </div>
            <p className="word-text">{selectedWord.word}</p>
            
            {selectedWord.totalCount > 1 && (
              <div className="progress-dots">
                {Array.from({ length: selectedWord.totalCount }).map((_, i) => (
                  <div
                    key={i}
                    className={`progress-dot ${i === selectedWord.currentIndex ? 'active' : ''}`}
                  />
                ))}
              </div>
            )}
            
           <p className="tap-more-hint" style={{
              visibility: (selectedWord.totalCount > 1 && selectedWord.currentIndex < selectedWord.totalCount - 1) ? 'visible' : 'hidden'
            }}>👇 Tap {selectedWord.word[0]} for more!</p>
          </div>
        )}
      </div>

      {/* Keyboard Grid */}
      <div className="keyboard-wrapper">
        <div
          className="alphabet-grid"
          style={{ backgroundImage: `url(${birdBackground})` }}
        >
          {alphabet.map(letter => {
            return (
              <button
                key={letter}
                className={`letter-tile ${hasMoreImages(letter) ? 'has-more' : ''}`}
                onClick={() => handleLetterClick(letter)}
              >
                {letter}
              </button>
            );
          })}
          <button className="back-button" onClick={handleBackToMenu}>
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlphabetScreen;