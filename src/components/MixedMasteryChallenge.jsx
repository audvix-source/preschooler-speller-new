import React, { useState, useEffect, useRef } from 'react';
import './MixedMasteryChallenge.css';
import { wordList } from '../wordList.js';
import RecognitionChallenge from './RecognitionChallenge.jsx';
import RunningTilesAnimation from './RunningTilesAnimation';

const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { images[item.replace('./', '')] = r(item); });
  return images;
};

const images = importAll(require.context('../assets/emojis', false, /\.(png|jpe?g|svg)$/));

const getImagePath = (fileName) => {
  if (!fileName) return null;
  if (typeof fileName !== 'string') return fileName;
  const specialMappings = {
    'x-box.png': 'xbox-emoji.png',
    'x-pen.png': 'xpen-emoji.png',
    'xerox-machine.png': 'xeroxmachine-emoji.png',
    'x-ray.png': 'x-ray-emoji.png',
    'xylophone.png': 'xylophone-emoji.png',
    'zeppelin.png': 'zepellin-emoji.png',
    'mushroom.png': 'mushroom-emoji.png',
    'umbrella.png': 'umbrella-emoji.png',
    'mailbox.png': 'mailbox-emoji.png',
    'uniform.png': 'uniform-emoji.png',
    'question-mark.png': 'questionmark-emoji.png',
  };
  if (specialMappings[fileName]) return images[specialMappings[fileName]] || null;
  return images[fileName.replace('.png', '-emoji.png')] || null;
};

const countSyllables = (word) => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 1;
  const matches = cleaned.match(/[aeiouy]+/g);
  return matches ? matches.length : 1;
};

const getSpeechDelay = (wordText, powerWordText) => {
  const wordSyllables  = wordText.split(/[\s-]/).reduce((sum, w) => sum + countSyllables(w), 0);
  const powerSyllables = countSyllables(powerWordText);
  return (wordSyllables * 350) + 750 + (powerSyllables * 350) + (wordSyllables * 500);
};

let globalPowerWordIndex = -1;

const POWER_WORDS = [
  { display: 'Perfect!',      speak: 'Perfect' },
  { display: 'Excellent!',    speak: 'Excellent' },
  { display: 'Amazing!',      speak: 'Amazing' },
  { display: 'You Did It!',   speak: 'You Did It' },
  { display: 'Splendid!',     speak: 'Splendid' },
  { display: 'Genius!',       speak: 'Genius' },
  { display: 'Brilliant!',    speak: 'Brilliant' },
  { display: 'Outstanding!',  speak: 'Outstanding' },
  { display: 'Fantastic!',    speak: 'Fantastic' },
  { display: 'Wonderful!',    speak: 'Wonderful' },
  { display: 'Superb!',       speak: 'Superb' },
  { display: 'Magnificent!',  speak: 'Magnificent' },
  { display: 'Champion!',     speak: 'Champion' },
  { display: 'Incredible!',   speak: 'Incredible' },
  { display: 'Marvelous!',    speak: 'Marvelous' }
];

const normalizeWord = (wordObj) =>
  wordObj?.word?.toLowerCase() === 'nail' ? { ...wordObj, word: 'nails' } : wordObj;

// ── Picture Quiz builder ──────────────────────────────────────────────────────
// Uses allViewedWords (full lifetime pool).
// ANY word with an image qualifies — no length restriction.
// Words without images are skipped entirely.
// Pads by cycling if pool is smaller than quizSize.
const buildMCOnlyQuestions = (allViewedWords, quizSize) => {
  const pool = (allViewedWords || [])
    .map(normalizeWord)
    .filter(w => w.word && getImagePath(w.image)); // ✅ no length filter — any word with image

  console.log(`Picture Quiz pool: ${pool.length} eligible words from ${allViewedWords?.length || 0} total viewed`);

  if (pool.length === 0) {
    console.warn('Picture Quiz: no eligible words with images in allViewedWords');
    return [];
  }

  const questions = [];
  let i = 0;
  while (questions.length < quizSize) {
    questions.push({ type: 'recognition', word: pool[i % pool.length] });
    i++;
  }
  return questions;
};

// ── Mixed builder ─────────────────────────────────────────────────────────────
// Uses recentWords (rolling 20).
// 3-5 letter words → spelling. 6+ letter words with image → recognition.
const buildMixedQuestions = (recentWords, quizSize) => {
  const normalizedWords      = recentWords.map(normalizeWord);
  const spellingQuestions    = [];
  const recognitionQuestions = [];

  normalizedWords.forEach(word => {
    if (!word.word) return;
    if (word.word.length >= 6 && getImagePath(word.image)) {
      recognitionQuestions.push({ type: 'recognition', word });
    } else {
      spellingQuestions.push({ type: 'spelling', word });
    }
  });

  spellingQuestions.sort((a, b) => a.word.word.length - b.word.word.length);
  const orderedQuestions = [...spellingQuestions, ...recognitionQuestions];
  const wantSpelling     = Math.max(1, Math.round(quizSize * 0.6));

  if (orderedQuestions.length > quizSize) {
    const spelling    = orderedQuestions.filter(q => q.type === 'spelling');
    const recognition = orderedQuestions.filter(q => q.type === 'recognition');
    const actualSpelling    = Math.min(spelling.length, wantSpelling);
    const actualRecognition = Math.min(recognition.length, quizSize - actualSpelling);
    const trimmed = [
      ...spelling.slice(0, actualSpelling),
      ...recognition.slice(0, actualRecognition),
    ];
    if (trimmed.length < quizSize) {
      trimmed.push(...orderedQuestions.filter(q => !trimmed.includes(q)).slice(0, quizSize - trimmed.length));
    }
    return trimmed.slice(0, quizSize);
  } else {
    const padded = [...orderedQuestions];
    let padIndex = 0;
    while (padded.length < quizSize) {
      padded.push({ type: 'spelling', word: normalizedWords[padIndex % normalizedWords.length] });
      padIndex++;
    }
    return [
      ...padded.filter(q => q.type === 'spelling'),
      ...padded.filter(q => q.type === 'recognition'),
    ].slice(0, quizSize);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// quizType: 'mixed' | 'mc-only' (Picture Quiz)
// allViewedWords: full lifetime pool from AlphabetScreen
// ─────────────────────────────────────────────────────────────────────────────
function MixedMasteryChallenge({
  recentWords,
  allViewedWords = [],
  onExit,
  speak,
  milestone,
  quizSize = 5,
  quizType = 'mixed'
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions,     setQuestions]     = useState([]);
  const [score,         setScore]         = useState(0);
  const [userAnswer,    setUserAnswer]    = useState([]);
  const [showFeedback,  setShowFeedback]  = useState(false);
  const [isCorrect,     setIsCorrect]     = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [finalScore,    setFinalScore]    = useState(0);
  const [finalTotal,    setFinalTotal]    = useState(0);
  const [completionMessage, setCompletionMessage] = useState('Perfect!');

  const questionsRef            = useRef([]);
  const scoreRef                = useRef(0);
  const quizStartedRef          = useRef(false);
  const currentQuestionIndexRef = useRef(0);

  useEffect(() => { questionsRef.current = questions; },                        [questions]);
  useEffect(() => { scoreRef.current = score; },                                [score]);
  useEffect(() => { currentQuestionIndexRef.current = currentQuestionIndex; }, [currentQuestionIndex]);

  // Fallback exit if questions never load
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (questionsRef.current.length === 0 && !quizStartedRef.current) {
        console.warn('MixedMasteryChallenge: no questions generated, exiting');
        onExit(0, 0);
      }
    }, 8000);
    return () => clearTimeout(timeout);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (quizType === 'mc-only') {
      if (!allViewedWords || allViewedWords.length === 0) {
        console.warn('Picture Quiz: allViewedWords is empty');
        return;
      }
      const built = buildMCOnlyQuestions(allViewedWords, quizSize);
      console.log('quizType: mc-only (Picture Quiz) | built:', built);
      setQuestions(built);
    } else {
      if (!recentWords || recentWords.length === 0) {
        console.warn('Mixed: recentWords is empty');
        return;
      }
      const built = buildMixedQuestions(recentWords, quizSize);
      console.log('quizType: mixed | built:', built);
      setQuestions(built);
    }
  }, [recentWords, allViewedWords, quizSize, quizType]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions  = questions.length;

  const handleLetterClick = (letter) => {
    quizStartedRef.current = true;
    if (!currentQuestion || showFeedback || currentQuestion.type !== 'spelling') return;
    if (speak) speak(letter === '-' ? 'hyphen' : letter);

    const newAnswer = [...userAnswer, letter];
    setUserAnswer(newAnswer);

    if (newAnswer.length === currentQuestion.word.word.length) {
      const correct = newAnswer.join('').toLowerCase() === currentQuestion.word.word.toLowerCase();
      setIsCorrect(correct);
      setShowFeedback(true);
      let calculatedScore = scoreRef.current;

      if (correct) {
        const newScore = scoreRef.current + 1;
        setScore(newScore); scoreRef.current = newScore; calculatedScore = newScore;
        globalPowerWordIndex = (globalPowerWordIndex + 1) % POWER_WORDS.length;
        const chosen = POWER_WORDS[globalPowerWordIndex];
        setCompletionMessage(chosen.display);
        if (speak) speak(`${currentQuestion.word.word}, ${chosen.speak}`);
        setTimeout(() => moveToNextQuestion(calculatedScore), getSpeechDelay(currentQuestion.word.word, chosen.speak));
      } else {
        if (speak) speak('Try again!');
        setTimeout(() => { setUserAnswer([]); setShowFeedback(false); setIsCorrect(false); }, 1500);
      }
    }
  };

  const handleRecognitionAnswer = (correct) => {
    quizStartedRef.current = true;
    if (showFeedback && currentQuestion?.type === 'recognition') return;
    let calculatedScore = scoreRef.current;

    if (correct) {
      const newScore = scoreRef.current + 1;
      setScore(newScore); scoreRef.current = newScore; calculatedScore = newScore;
      globalPowerWordIndex = (globalPowerWordIndex + 1) % POWER_WORDS.length;
      const chosen = POWER_WORDS[globalPowerWordIndex];
      setCompletionMessage(chosen.display);
      if (speak) speak(`${currentQuestion.word.word}, ${chosen.speak}`);
      setTimeout(() => { window.speechSynthesis.cancel(); moveToNextQuestion(calculatedScore); },
        getSpeechDelay(currentQuestion.word.word, chosen.speak));
    } else {
      setTimeout(() => { window.speechSynthesis.cancel(); moveToNextQuestion(calculatedScore); }, 500);
    }
  };

  const moveToNextQuestion = (calculatedScore) => {
    const currentIndex   = currentQuestionIndexRef.current;
    const totalQuestions = questionsRef.current.length;
    if (currentIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentIndex + 1);
      setUserAnswer([]); setShowFeedback(false); setIsCorrect(false);
    } else {
      if (totalQuestions === 0) { onExit(0, 0); return; }
      const safeScore = calculatedScore ?? scoreRef.current;
      setFinalScore(safeScore); setFinalTotal(totalQuestions);
      window.speechSynthesis.cancel();
      setTimeout(() => setShowAnimation(true), 400);
    }
  };

  const handleBackspace = () => {
    if (userAnswer.length > 0 && !showFeedback) setUserAnswer(userAnswer.slice(0, -1));
  };

  const handleExit            = () => onExit(scoreRef.current, questionsRef.current.length);
  const handleAnimationComplete = () => onExit(finalScore, finalTotal);

  if (showAnimation) {
    return (
      <RunningTilesAnimation
        score={finalScore} total={finalTotal}
        onComplete={handleAnimationComplete}
        speak={speak} milestone={milestone}
      />
    );
  }

  const getWordVisual = (word) => {
    const emojiMap = {
      'apple':'🍎','ant':'🐜','ball':'⚽','bear':'🐻','bus':'🚌','baby':'👶',
      'cat':'🐱','car':'🚗','cookie':'🍪','cow':'🐄','dog':'🐕','duck':'🦆',
      'door':'🚪','egg':'🥚','elf':'🧝','fish':'🐠','frog':'🐸','fire':'🔥',
      'flower':'🌸','goat':'🐐','girl':'👧','hat':'🎩','horse':'🐴','hand':'✋',
      'heart':'❤️','igloo':'🏔️','jar':'🫙','jet':'✈️','kite':'🪁','king':'🤴',
      'lion':'🦁','lamp':'💡','lemon':'🍋','moon':'🌙','mouse':'🐭','monkey':'🐵',
      'nails':'💅','nail':'💅','net':'🥅','nurse':'👩‍⚕️','ox':'🐂','pizza':'🍕',
      'queen':'👸','quilt':'🛏️','rain':'🌧️','robot':'🤖','star':'⭐','sun':'☀️',
      'tree':'🌳','truck':'🚚','vase':'🏺','vest':'🦺','watch':'⌚','whale':'🐋',
      'yak':'🦬','yarn':'🧶','zebra':'🦓','zap':'⚡','zipper':'🤐',
      'zigzag':'⚡','zeppelin':'🛩️','queue':'👥','question-mark':'❓'
    };
    return emojiMap[word.toLowerCase()] || '📝';
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

  const quizTypeBadge = quizType === 'mc-only'
    ? <span className="challenge-quiz-type-badge challenge-quiz-type-badge--mc">🖼️ Picture Quiz</span>
    : null;

  const bodyPartWords = [
    'head','face','hair','forehead','eyebrow','eyebrows','eyelash','eyelashes',
    'eye','eyes','eyelid','eyelids','nose','nostrils','ear','ears','earlobe',
    'cheek','cheeks','dimple','dimples','mouth','lip','lips','tongue','tooth',
    'teeth','chin','jaw','jawline','neck','throat','cleft chin','cleft-chin',
    'shoulder','shoulders','chest','breast','arm','arms','armpit','armpits',
    'elbow','elbows','forearm','forearms','wrist','wrists','hand','hands',
    'palm','palms','finger','fingers','thumb','thumbs','fingernail','fingernails',
    'knuckle','knuckles','belly','bellybutton','belly button','belly-button',
    'navel','stomach','tummy','abdomen','back','spine','waist','hip','hips',
    'leg','legs','thigh','thighs','knee','knees','kneecap','calf','calves',
    'shin','shins','ankle','ankles','foot','feet','heel','heels','toe','toes',
    'toenail','toenails','sole','soles','arch','body','eyelashes','nails'
  ];

  return (
    <div className="challenge-overlay-fixed">
      <div className="challenge-container-fixed">
        <div className="challenge-confetti">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="confetti-piece" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              fontSize: `${1 + Math.random() * 0.5}em`
            }}>
              {['🎉','⭐','✨','🌟','💫'][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>

        <div className="challenge-header">
          <div className="score-display">
            <span className="score-label">Question:</span>
            <span className="score-value">{currentQuestionIndex + 1} / {totalQuestions}</span>
          </div>
          <div className="accuracy-display">
            {quizTypeBadge}
            <span className="accuracy-label">Score:</span>
            <span className="accuracy-value">{score}</span>
          </div>
        </div>

        <div className="question-content">
          {currentQuestion.type === 'recognition' ? (
            <RecognitionChallenge
              word={currentQuestion.word.word}
              wordImage={getImagePath(currentQuestion.word.image)}
              allWords={wordList
                .filter(w => !bodyPartWords.includes(w.word.toLowerCase().trim()))
                .map(w => ({ word: w.word, image: getImagePath(w.image), originalFilename: w.image }))
                .filter(w => w.image)
              }
              onAnswer={handleRecognitionAnswer}
              speak={speak}
            />
          ) : (
            <>
              <div className={`word-card ${showFeedback ? (isCorrect ? 'correct' : 'incorrect') : ''}`}>
                <div className="word-emoji-display">
                  {getImagePath(currentQuestion.word.image) ? (
                    <img
                      src={getImagePath(currentQuestion.word.image)}
                      alt=""
                      className="emoji-huge-image"
                      style={{ maxWidth:'100%', maxHeight:'140px', objectFit:'contain', filter:'drop-shadow(0 6px 12px rgba(0,0,0,0.2))' }}
                    />
                  ) : (
                    <span className="emoji-huge">{getWordVisual(currentQuestion.word.word)}</span>
                  )}
                </div>
                {showFeedback && (
                  <div className="feedback-banner">
                    <span className="feedback-icon-inline">{isCorrect ? '✅' : '❌'}</span>
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
                    className={`answer-box ${userAnswer[index] ? 'filled' : ''} ${showFeedback ? (isCorrect ? 'correct-box' : 'incorrect-box') : ''}`}
                  >
                    {userAnswer[index] || ''}
                  </div>
                ))}
              </div>

              <div className="keyboard-wrapper-container">
                <div className="challenge-keyboard">
                  {alphabet.map(letter => {
                    const wordUpper   = currentQuestion.word.word.toUpperCase();
                    const totalNeeded = wordUpper.split('').filter(l => l === letter).length;
                    const alreadyUsed = userAnswer.filter(l => l === letter).length;
                    const isUsed      = totalNeeded > 0 && alreadyUsed >= totalNeeded;
                    const isNeeded    = alreadyUsed < totalNeeded;
                    return (
                      <button
                        key={letter}
                        className={`keyboard-key ${isUsed ? 'used' : isNeeded ? 'needed-letter' : 'not-needed-letter'}`}
                        onClick={() => handleLetterClick(letter)}
                        disabled={showFeedback || isUsed}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
                <div className="button-group-wrapper">
                  <div className="challenge-controls">
                    <button className="backspace-button" onClick={handleBackspace} disabled={showFeedback}>⌫ Backspace</button>
                    <button className="exit-button" onClick={handleExit}>🚪 Exit</button>
                  </div>
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