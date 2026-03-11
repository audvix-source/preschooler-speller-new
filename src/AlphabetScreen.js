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
  const [quizSize, setQuizSize] = useState(5); // number of questions for next quiz

  // ✅ Check for mastery prompt: first at 30 images, then every 10 after that.
  // tapsSinceSnooze: counts every tap after a snooze option is chosen (resets on snooze)
  const tapsSinceSnoozeRef = useRef(0);
  const pendingQuizSizeRef = useRef(5); // persists chosen quiz size across the snooze wait

  // Trigger logic:
  // - First prompt: after 30 unique images viewed (no snooze active)
  // - Repeat: every 15 taps after that (no snooze active)
  // - Snooze "taps:N": fires after N total taps since snooze was set
  // - "Later" (handleDecline): snooze for +15 taps
  useEffect(() => {
    console.log('Tap count:', tapCountRef.current, '| Unique images:', viewedImages.length, '| Snooze:', snoozeUntil);

    const uniqueCount = viewedImages.length;

    const isFirstPrompt  = !snoozeUntil && uniqueCount === 30;
    const isRepeatPrompt = !snoozeUntil && uniqueCount > 30 && (tapCount % 15 === 0);
    const isTapsTarget   = snoozeUntil?.startsWith('taps:') &&
      tapsSinceSnoozeRef.current >= parseInt(snoozeUntil.split(':')[1]);

    if (isFirstPrompt || isRepeatPrompt || isTapsTarget) {
      const lastPromptAt = parseInt(
        localStorage.getItem(`${lockedUserIdRef.current}_lastMasteryPromptAt`) || '0'
      );

      if (tapCount > lastPromptAt) {
        console.log('Triggering mastery check at tap', tapCount);

        setTimeout(() => {
          const promptType = isFirstPrompt ? 'first' : 'later';
          setCurrentMilestone(null);
          setPromptType(promptType);
          setShowHexagonTransition(true);
          localStorage.setItem(
            `${lockedUserIdRef.current}_lastMasteryPromptAt`,
            tapCount.toString()
          );
        }, 3000);
      }
    }
  }, [tapCount, snoozeUntil]);

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
    // Simple association: just say the image name
    if (props.speak) props.speak(foundWord.word);

    // ✅ Track this image view
    const imageId = `${foundWord.id}-${foundWord.word}`;

    // Always increment tap counters — fires useEffect even on repeated images
    tapCountRef.current += 1;
    tapsSinceSnoozeRef.current += 1;
    setTapCount(tapCountRef.current);

    if (!viewedImages.includes(imageId)) {
      console.log('New image viewed:', imageId);
      setViewedImages([...viewedImages, imageId]);

      // Keep last 5 words for mastery check
      const updatedRecent = [...recentWords, foundWord];
      if (updatedRecent.length > 20) {
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
  const handleAcceptMasteryCheck = (size = 5) => {
    console.log('recentWords at accept:', recentWordsRef.current);
    // Use size passed directly (Let's Go), or the one stored from a prior snooze choice
    const resolvedSize = size !== 5 ? size : pendingQuizSizeRef.current;
    setQuizSize(resolvedSize);
    pendingQuizSizeRef.current = 5; // reset for next time
    setShowHexagonTransition(false);
    setShowMasteryChallenge(true);
    setSnoozeUntil(null);
    tapsSinceSnoozeRef.current = 0;
  };

  const handleSnoozeMasteryCheck = (option, size = 5) => {
    // option is "taps:20", "taps:30", "taps:40", "taps:50"
    console.log('Mastery check snoozed:', option, '| Next quiz size:', size);
    pendingQuizSizeRef.current = size; // store for when quiz eventually fires
    setQuizSize(size);
    setShowHexagonTransition(false);
    setSnoozeUntil(option);
    tapsSinceSnoozeRef.current = 0; // reset tap counter from this moment
  };

  const handleDeclineMasteryCheck = () => {
    setShowHexagonTransition(false);
    // "Later" = snooze for 15 more taps, 5-question quiz
    pendingQuizSizeRef.current = 5;
    setQuizSize(5);
    setSnoozeUntil('taps:15');
    tapsSinceSnoozeRef.current = 0;
  };

  const handleExitMasteryCheck = (score, total) => {
    setShowMasteryChallenge(false);
    setSnoozeUntil(null);
    setCurrentMilestone(null);
    tapsSinceSnoozeRef.current = 0;

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
        quizSize={quizSize}
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