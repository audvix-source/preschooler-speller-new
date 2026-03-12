import React, { useState, useEffect, useRef } from 'react';
import './AlphabetScreen.css';
import { wordList } from './wordList.js';
import birdBackground from './assets/pair-birds.png';
import AlphabetChallenge from './components/AlphabetChallenge';
import ChallengeBanner from './components/ChallengeBanner';
import scoreDB from './services/scoreDatabase';
import HexagonTransition from './components/HexagonTransition';
import MixedMasteryChallenge from './components/MixedMasteryChallenge';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item); });
  return images;
};

const mainImages  = importAll(require.context('./assets', false, /\.(png|jpe?g|svg)$/));
const emojiImages = importAll(require.context('./assets/emojis', false, /\.(png|jpe?g|svg)$/));
const allImages   = { ...mainImages, ...emojiImages };

const getImagePath = (fileName) => {
  if (allImages[fileName]) return allImages[fileName];
  console.warn(`AlphabetScreen: Image not found: ${fileName}`);
  return null;
};

// ── Thresholds ────────────────────────────────────────────────────────────────
const FIRST_PROMPT_AT   = 20;
const REPEAT_EVERY_TAPS = 20;

function AlphabetScreen(props) {
  const { userId = 'user_1' } = props;
  const lockedUserIdRef = useRef(userId);
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  // ── Saved state loaders ───────────────────────────────────────────────────
  const getSavedAlphabetState = () => {
    try {
      const saved = localStorage.getItem(`${lockedUserIdRef.current}_alphabetScreenState`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) { return null; }
  };

  const getAllViewedWordsFromStorage = () => {
    try {
      const saved = localStorage.getItem(`${lockedUserIdRef.current}_allViewedWords`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) { return []; }
  };

  const savedState     = getSavedAlphabetState();
  const recentWordsRef = useRef(savedState?.recentWords || []);
  const tapCountRef    = useRef(0);

  // ── State ─────────────────────────────────────────────────────────────────
  const [selectedWord,     setSelectedWord]     = useState(savedState?.selectedWord || null);
  const [letterProgress,   setLetterProgress]   = useState(savedState?.letterProgress || {});
  const [activeLetter,     setActiveLetter]     = useState(savedState?.activeLetter || null);
  const [showChallenge,    setShowChallenge]    = useState(false);
  const [challengeMode,    setChallengeMode]    = useState(null);
  const [challengeLetter,  setChallengeLetter]  = useState(null);
  const [showBanner,       setShowBanner]       = useState(false);
  const [bannerDismissed,  setBannerDismissed]  = useState(false);

  const [viewedImages,          setViewedImages]          = useState(savedState?.viewedImages || []);
  const [recentWords,           setRecentWords]           = useState(savedState?.recentWords || []);
  const [allViewedWords,        setAllViewedWords]        = useState(getAllViewedWordsFromStorage);
  const [showHexagonTransition, setShowHexagonTransition] = useState(false);
  const [showMasteryChallenge,  setShowMasteryChallenge]  = useState(false);
  const [snoozeUntil,           setSnoozeUntil]           = useState(savedState?.snoozeUntil || null);
  const [currentMilestone,      setCurrentMilestone]      = useState(null);
  const [promptType,            setPromptType]            = useState('first');
  const [tapCount,              setTapCount]              = useState(0);
  const [quizSize,              setQuizSize]              = useState(5);
  const [quizType,              setQuizType]              = useState('mixed');

  // ✅ Track whether the very first prompt has been shown this lifetime
  const firstPromptShownRef = useRef(
    !!localStorage.getItem(`${lockedUserIdRef.current}_firstPromptShown`)
  );

  const tapsSinceSnoozeRef = useRef(0);
  const pendingQuizSizeRef = useRef(5);
  const pendingQuizTypeRef = useRef('mixed');

  // ── Mastery prompt trigger ────────────────────────────────────────────────
  useEffect(() => {
    console.log('Tap:', tapCountRef.current, '| Unique:', viewedImages.length, '| Snooze:', snoozeUntil);

    const uniqueCount    = viewedImages.length;
    const isFirstPrompt  = !snoozeUntil && uniqueCount === FIRST_PROMPT_AT;
    const isRepeatPrompt = !snoozeUntil && uniqueCount > FIRST_PROMPT_AT &&
                           (tapCount % REPEAT_EVERY_TAPS === 0);
    const isTapsTarget   = snoozeUntil?.startsWith('taps:') &&
                           tapsSinceSnoozeRef.current >= parseInt(snoozeUntil.split(':')[1]);

    if (isFirstPrompt || isRepeatPrompt || isTapsTarget) {
      const lastPromptAt = parseInt(
        localStorage.getItem(`${lockedUserIdRef.current}_lastMasteryPromptAt`) || '0'
      );
      if (tapCount > lastPromptAt) {
        console.log('Triggering mastery check at tap', tapCount, '| isFirst:', isFirstPrompt);
        setTimeout(() => {
          localStorage.setItem(`${lockedUserIdRef.current}_lastMasteryPromptAt`, tapCount.toString());

          if (isFirstPrompt && !firstPromptShownRef.current) {
            // ✅ Very first prompt ever — full HexagonTransition experience
            firstPromptShownRef.current = true;
            localStorage.setItem(`${lockedUserIdRef.current}_firstPromptShown`, '1');
            setCurrentMilestone(null);
            setPromptType('first');
            setShowHexagonTransition(true);
          } else {
            // ✅ All repeat prompts — show HexagonTransition in lightweight 'repeat' mode
            // User sees the prompt and can choose quiz type/size or defer
            // Let's Go fires immediately (no bee animation)
            setCurrentMilestone(null);
            setPromptType('repeat');
            setShowHexagonTransition(true);
          }
        }, 3000);
      }
    }
  }, [tapCount, snoozeUntil]);

  // ── Auto-save session state ───────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(
        `${lockedUserIdRef.current}_alphabetScreenState`,
        JSON.stringify({
          selectedWord, letterProgress, activeLetter,
          viewedImages, recentWords, snoozeUntil,
          lastSaved: new Date().toISOString()
        })
      );
    } catch (e) { console.error('Error saving alphabet state:', e); }
  }, [selectedWord, letterProgress, activeLetter, viewedImages, recentWords, snoozeUntil]);

  // ── Persist allViewedWords ────────────────────────────────────────────────
  useEffect(() => {
    try {
      localStorage.setItem(
        `${lockedUserIdRef.current}_allViewedWords`,
        JSON.stringify(allViewedWords)
      );
    } catch (e) { console.error('Error saving allViewedWords:', e); }
  }, [allViewedWords]);

  // ── Letter tap ────────────────────────────────────────────────────────────
  const handleLetterClick = (letter) => {
    const wordsForLetter = wordList.filter(item =>
      item.category === 'Alphabet Fun' &&
      item.word.toUpperCase().startsWith(letter)
    );
    if (wordsForLetter.length === 0) return;

    setActiveLetter(letter);
    const currentIndex = letterProgress[letter] || 0;
    const foundWord    = wordsForLetter[currentIndex];
    const nextIndex    = (currentIndex + 1) % wordsForLetter.length;

    setLetterProgress({ ...letterProgress, [letter]: nextIndex });
    setSelectedWord({ ...foundWord, currentIndex, totalCount: wordsForLetter.length, letter });

    if (props.speak) props.speak(foundWord.word);

    const imageId = `${foundWord.id}-${foundWord.word}`;
    tapCountRef.current += 1;
    tapsSinceSnoozeRef.current += 1;
    setTapCount(tapCountRef.current);

    if (!viewedImages.includes(imageId)) {
      setViewedImages(prev => [...prev, imageId]);

      // recentWords — rolling window of 20 for mixed quiz
      const updatedRecent = [...recentWords, foundWord];
      if (updatedRecent.length > 20) updatedRecent.shift();
      setRecentWords(updatedRecent);
      recentWordsRef.current = updatedRecent;

      // allViewedWords — full lifetime pool for Picture Quiz, no cap
      setAllViewedWords(prev => {
        const alreadyIn = prev.some(w => w.id === foundWord.id && w.word === foundWord.word);
        return alreadyIn ? prev : [...prev, foundWord];
      });
    }

    if (nextIndex === 0 && currentIndex > 0) setTimeout(() => setActiveLetter(null), 100);
  };

  const handleCloseWord = () => { setSelectedWord(null); setActiveLetter(null); };

  const handleBackToMenu = () => {
    localStorage.removeItem(`${lockedUserIdRef.current}_alphabetScreenState`);
    localStorage.removeItem(`${lockedUserIdRef.current}_lastMasteryPromptAt`);
    props.onNavigate('menu');
  };

  const hasMoreImages = (letter) => {
    if (activeLetter !== letter) return false;
    const words = wordList.filter(item =>
      item.category === 'Alphabet Fun' && item.word.toUpperCase().startsWith(letter)
    );
    return (letterProgress[letter] || 0) < words.length;
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

  // ── HexagonTransition handlers ────────────────────────────────────────────

  const handleAcceptMasteryCheck = (size = 5) => {
    const resolvedSize = size !== 5 ? size : pendingQuizSizeRef.current;
    setQuizSize(resolvedSize);
    setQuizType('mixed');
    pendingQuizSizeRef.current = 5;
    pendingQuizTypeRef.current = 'mixed';
    setShowHexagonTransition(false);
    setShowMasteryChallenge(true);
    setSnoozeUntil(null);
    tapsSinceSnoozeRef.current = 0;
  };

  const handleSnoozeMasteryCheck = (option, size = 5, type = 'mixed') => {
    pendingQuizSizeRef.current = type;
    pendingQuizTypeRef.current = type;
    setQuizSize(size);
    setQuizType(type);
    setShowHexagonTransition(false);
    setSnoozeUntil(option);
    tapsSinceSnoozeRef.current = 0;
  };

  const handleDeclineMasteryCheck = () => {
    // "Not Now" = +20 taps, 10-question mixed quiz
    setShowHexagonTransition(false);
    pendingQuizSizeRef.current = 10;
    pendingQuizTypeRef.current = 'mixed';
    setQuizSize(10);
    setQuizType('mixed');
    setSnoozeUntil('taps:20');
    tapsSinceSnoozeRef.current = 0;
  };

  const handleExitMasteryCheck = (score, total) => {
    setShowMasteryChallenge(false);
    setSnoozeUntil(null);
    setCurrentMilestone(null);
    tapsSinceSnoozeRef.current = 0;

    const isPerfect         = score === total;
    const wordsTestedString = recentWords.map(w => w.word).join(', ');

    const saveResults = async () => {
      if (!scoreDB.db) await scoreDB.init();
      await scoreDB.recordLearningAttempt(`Mastery Check: ${wordsTestedString}`, isPerfect, lockedUserIdRef.current);
      for (const [index, word] of recentWords.entries()) {
        await scoreDB.recordLearningAttempt(
          `${word.letter || word.word[0]}-${word.word}`,
          index < score,
          lockedUserIdRef.current
        );
      }
    };
    saveResults();

    if (total === 0) return;
    const ratio = score / total;
    setTimeout(() => {
      if (score === 0) {
        if (props.speak) props.speak("Don't give up! Try again!");
      } else if (score === total) {
        const pw = ['Perfect!','Excellent!','Amazing!','You Did It!','Splendid!','Genius!','Brilliant!','Outstanding!','Fantastic!','Wonderful!'];
        if (props.speak) props.speak(pw[Math.floor(Math.random() * pw.length)]);
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
  };

  // ── Render ────────────────────────────────────────────────────────────────

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

  if (showMasteryChallenge) {
    return (
      <MixedMasteryChallenge
        recentWords={recentWordsRef.current}
        allViewedWords={allViewedWords}
        onExit={handleExitMasteryCheck}
        speak={props.speak}
        milestone={currentMilestone}
        quizSize={quizSize}
        quizType={quizType}
      />
    );
  }

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
      {showBanner && !bannerDismissed && (
        <ChallengeBanner
          onStartChallenge={handleStartRandomChallenge}
          onDismiss={handleDismissBanner}
        />
      )}

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
              <img src={getImagePath(selectedWord.image)} alt={selectedWord.word} />
            </div>
            <p className="word-text">{selectedWord.word}</p>
            {selectedWord.totalCount > 1 && (
              <div className="progress-dots">
                {Array.from({ length: selectedWord.totalCount }).map((_, i) => (
                  <div key={i} className={`progress-dot ${i === selectedWord.currentIndex ? 'active' : ''}`} />
                ))}
              </div>
            )}
            <p className="tap-more-hint" style={{
              visibility: (selectedWord.totalCount > 1 && selectedWord.currentIndex < selectedWord.totalCount - 1)
                ? 'visible' : 'hidden'
            }}>
              👇 Tap {selectedWord.word[0]} for more!
            </p>
          </div>
        )}
      </div>

      <div className="keyboard-wrapper">
        <div className="alphabet-grid" style={{ backgroundImage: `url(${birdBackground})` }}>
          {alphabet.map(letter => (
            <button
              key={letter}
              className={`letter-tile ${hasMoreImages(letter) ? 'has-more' : ''}`}
              onClick={() => handleLetterClick(letter)}
            >
              {letter}
            </button>
          ))}
          <button className="back-button" onClick={handleBackToMenu}>Back to Menu</button>
        </div>
      </div>
    </div>
  );
}

export default AlphabetScreen;