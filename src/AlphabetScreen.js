import React, { useState, useEffect, useRef } from 'react';
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

  // ✅ Lock the userId at mount time so scores never drift to another player
  // even if the parent re-renders with a different activeUserId mid-session.
  const lockedUserIdRef = useRef(userId);

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // Load saved state
  const getSavedAlphabetState = () => {
    try {
      const saved = localStorage.getItem(`${lockedUserIdRef.current}_alphabetScreenState`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading alphabet state:', e);
      return null;
    }
  };

  const savedState = getSavedAlphabetState();
  const recentWordsRef = useRef(savedState?.recentWords || []);
  const tapCountRef = useRef(0); // increments on every tap, repeated or not

  // STATE DEFINITIONS
  const [selectedWord, setSelectedWord] = useState(savedState?.selectedWord || null);
  const [letterProgress, setLetterProgress] = useState(savedState?.letterProgress || {});
  const [activeLetter, setActiveLetter] = useState(savedState?.activeLetter || null);
  const [showChallenge, setShowChallenge] = useState(false);
  const [challengeMode, setChallengeMode] = useState(null);
  const [challengeLetter, setChallengeLetter] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // ✅ IMAGE-BASED MASTERY CHECK WITH HEXAGON TRANSITION
  const [viewedImages, setViewedImages] = useState(savedState?.viewedImages || []);
  const [recentWords, setRecentWords] = useState(savedState?.recentWords || []);
  const [showHexagonTransition, setShowHexagonTransition] = useState(false);
  const [showMasteryChallenge, setShowMasteryChallenge] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState(savedState?.snoozeUntil || null);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [promptType, setPromptType] = useState('first');
  const [tapCount, setTapCount] = useState(0); // triggers useEffect on every tap

  // ✅ Check for mastery prompt: first at 30 images, then every 10 after that.
  // Snooze thresholds: quarter=65 (1/4 of 260), third=87 (1/3), half=130 (1/2), all=260.
  useEffect(() => {
    console.log('Viewed images count:', viewedImages.length);
    console.log('Snooze until:', snoozeUntil);

    const TOTAL_IMAGES = 260;
    const QUARTER_MARK = Math.round(TOTAL_IMAGES / 4);  // 65
    const THIRD_MARK   = Math.round(TOTAL_IMAGES / 3);  // 87
    const HALF_MARK    = Math.round(TOTAL_IMAGES / 2);  // 130

    const count = viewedImages.length;

    const isLaterTarget = snoozeUntil?.startsWith('count:') &&
      count >= parseInt(snoozeUntil.split(':')[1]);
    const isFirstPrompt  = !snoozeUntil && count === 30;
    const isRepeatPrompt = !snoozeUntil && count > 30 && (count - 30) % 15 === 0;
    const isMilestoneTarget =
      (snoozeUntil === 'quarter' && count >= QUARTER_MARK) ||
      (snoozeUntil === 'third'   && count >= THIRD_MARK)   ||
      (snoozeUntil === 'half'    && count >= HALF_MARK)    ||
      (snoozeUntil === 'all'     && count >= TOTAL_IMAGES);

    if (isFirstPrompt || isRepeatPrompt || isLaterTarget || isMilestoneTarget) {
      const lastPromptAt = parseInt(
        localStorage.getItem(`${lockedUserIdRef.current}_lastMasteryPromptAt`) || '0'
      );

      // Only trigger if this is a NEW milestone (not already prompted here)
      if (count > lastPromptAt) {
        console.log('Triggering mastery check at', count, 'images');

        setTimeout(() => {
          const milestone =
            count <= 30           ? null       :
            count <= QUARTER_MARK ? 'quarter'  :
            count <= THIRD_MARK   ? 'third'    :
            count <= HALF_MARK    ? 'half'     : 'all';
          const promptType = isFirstPrompt ? 'first' : 'later';
          setCurrentMilestone(milestone);
          setPromptType(promptType);
          setShowHexagonTransition(true);
          localStorage.setItem(
            `${lockedUserIdRef.current}_lastMasteryPromptAt`,
            count.toString()
          );
        }, 3000);
      }
    }
  }, [viewedImages, snoozeUntil, tapCount]);

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
      localStorage.setItem(
        `${lockedUserIdRef.current}_alphabetScreenState`,
        JSON.stringify(stateToSave)
      );
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

    // Always increment tap counter — fires useEffect even on repeated images
    tapCountRef.current += 1;
    setTapCount(tapCountRef.current);

    if (!viewedImages.includes(imageId)) {
      console.log('New image viewed:', imageId);
      setViewedImages([...viewedImages, imageId]);

      // Keep last 5 words for mastery check
      const updatedRecent = [...recentWords, foundWord];
      if (updatedRecent.length > 5) {
        updatedRecent.shift();
      }
      setRecentWords(updatedRecent);
      recentWordsRef.current = updatedRecent;
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
    localStorage.removeItem(`${lockedUserIdRef.current}_alphabetScreenState`);
    localStorage.removeItem(`${lockedUserIdRef.current}_lastMasteryPromptAt`);
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
    localStorage.setItem(`${lockedUserIdRef.current}_challengeBannerDismissed`, 'true');
  };

  // ✅ HEXAGON TRANSITION HANDLERS
  const handleAcceptMasteryCheck = () => {
    console.log('recentWords at accept:', recentWordsRef.current);
    setShowHexagonTransition(false);
    setShowMasteryChallenge(true);
    setSnoozeUntil(null);
  };

  const handleSnoozeMasteryCheck = (option) => {
    console.log('Mastery check snoozed until:', option);
    setShowHexagonTransition(false);
    setSnoozeUntil(option);
  };

  const handleDeclineMasteryCheck = () => {
    setShowHexagonTransition(false);
    // "Later" = snooze for 15 more images from current position
    setSnoozeUntil(`count:${viewedImages.length + 15}`);
  };

  const handleExitMasteryCheck = (score, total) => {
    setShowMasteryChallenge(false);
    setSnoozeUntil(null);
    setCurrentMilestone(null);

    console.log(`Score: ${score}, Total: ${total}, Ratio: ${score / total}`);

    const accuracy = total > 0 ? (score / total) * 100 : 0;
    const isPerfect = score === total;

    const wordsTestedString = recentWords
      .map(w => w.word)
      .join(', ');

    // ✅ Use lockedUserIdRef.current — never drifts to another player
    const saveResults = async () => {
      if (!scoreDB.db) await scoreDB.init();
      await scoreDB.recordLearningAttempt(
        `Mastery Check: ${wordsTestedString}`,
        isPerfect,
        lockedUserIdRef.current
      );
      for (const [index, word] of recentWords.entries()) {
        const isCorrect = index < score;
        await scoreDB.recordLearningAttempt(
          `${word.letter || word.word[0]}-${word.word}`,
          isCorrect,
          lockedUserIdRef.current
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
        viewedCount={viewedImages.length}
        promptType={promptType}
      />
    );
  }

  // ✅ If mastery check challenge is active
  if (showMasteryChallenge) {
    return (
      <MixedMasteryChallenge
        recentWords={recentWordsRef.current}
        onExit={handleExitMasteryCheck}
        speak={props.speak}
        milestone={currentMilestone}
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