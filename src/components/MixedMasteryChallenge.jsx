import React, { useState, useEffect, useRef } from 'react';
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
    console.log('❌ getImagePath: fileName is empty/null');
    return null;
  }
  if (typeof fileName !== 'string') {
    console.log('✅ getImagePath: Already resolved module:', fileName);
    return fileName;
  }
  console.log(`🔍 getImagePath: Processing "${fileName}"`);
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
  if (specialMappings[fileName]) {
    const mappedFile = specialMappings[fileName];
    if (images[mappedFile]) {
      console.log(`✅ Special mapping: ${fileName} → ${mappedFile} (FOUND)`);
      return images[mappedFile];
    } else {
      console.log(`❌ Special mapping: ${fileName} → ${mappedFile} (NOT FOUND)`);
      return null;
    }
  }
  const emojiFileName = fileName.replace('.png', '-emoji.png');
  if (images[emojiFileName]) {
    console.log(`✅ Found in emojis: ${fileName} → ${emojiFileName}`);
    return images[emojiFileName];
  } else {
    console.log(`❌ NOT in emojis folder: ${fileName} → ${emojiFileName}`);
    return null;
  }
};

// Count syllables in a word — vowel groups, minimum 1
const countSyllables = (word) => {
  const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!cleaned) return 1;
  const matches = cleaned.match(/[aeiouy]+/g);
  return matches ? matches.length : 1;
};

// Calculate how long to wait after speak() fires before advancing
// word speech + 750ms buffer + power word speech, all estimated from syllables
const getSpeechDelay = (wordText, powerWordText) => {
  const wordSyllables  = wordText.split(/[\s-]/).reduce((sum, w) => sum + countSyllables(w), 0);
  const powerSyllables = countSyllables(powerWordText);
  const wordMs  = wordSyllables  * 350; // ~350ms per syllable
  const powerMs = powerSyllables * 350;
  const buffer  = 750; // 3/4 second pause between word and power word
  const tail    = wordSyllables * 500; // ~1 full second after power word for 2-syl words
  return wordMs + buffer + powerMs + tail;
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

function MixedMasteryChallenge({ recentWords, onExit, speak, milestone, quizSize = 5 }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [score, setScore] = useState(0);
  const [userAnswer, setUserAnswer] = useState([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);
  const [completionMessage, setCompletionMessage] = useState('Perfect!');

  // ✅ Refs to track live values — avoids ALL stale closure bugs
  const questionsRef = useRef([]);
  const scoreRef = useRef(0);
  const quizStartedRef = useRef(false);
  const currentQuestionIndexRef = useRef(0);

  useEffect(() => {
    questionsRef.current = questions;
  }, [questions]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // ✅ Fallback: only exits if questions never loaded AND quiz never started
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
    const generateQuestions = () => {
      if (!recentWords || recentWords.length === 0) {
        console.warn('No recent words available for quiz');
        return;
      }

      const normalizeWord = (wordObj) => {
        if (wordObj.word && wordObj.word.toLowerCase() === 'nail') {
          return { ...wordObj, word: 'nails' };
        }
        return wordObj;
      };

      const normalizedWords = recentWords.map(normalizeWord);
      const spellingQuestions = [];
      const recognitionQuestions = [];

      normalizedWords.forEach(word => {
        if (!word.word) return;
        if (word.word.length >= 6) {
          const imgPath = getImagePath(word.image);
          if (imgPath) {
            recognitionQuestions.push({ type: 'recognition', word });
          } else {
            spellingQuestions.push({ type: 'spelling', word });
          }
        } else {
          spellingQuestions.push({ type: 'spelling', word });
        }
      });

      // ✅ Shortest word first
      spellingQuestions.sort((a, b) => a.word.word.length - b.word.word.length);

      const orderedQuestions = [...spellingQuestions, ...recognitionQuestions];

      // Scale spelling/recognition ratio with quizSize
      // Roughly 60% spelling, 40% recognition, always at least 1 of each if available
      const wantSpelling = Math.max(1, Math.round(quizSize * 0.6));

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
          const remaining = orderedQuestions.filter(q => !trimmed.includes(q));
          trimmed.push(...remaining.slice(0, quizSize - trimmed.length));
        }
        setQuestions(trimmed.slice(0, quizSize));
      } else {
        // Pad by cycling through recentWords until we reach quizSize
        const padded = [...orderedQuestions];
        let padIndex = 0;
        while (padded.length < quizSize) {
          const source = normalizedWords[padIndex % normalizedWords.length];
          padded.push({ type: 'spelling', word: source });
          padIndex++;
        }
        const finalSpelling    = padded.filter(q => q.type === 'spelling');
        const finalRecognition = padded.filter(q => q.type === 'recognition');
        setQuestions([...finalSpelling, ...finalRecognition].slice(0, quizSize));
      }
    };

    generateQuestions();
  }, [recentWords, quizSize]);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleLetterClick = (letter) => {
    quizStartedRef.current = true;
    if (!currentQuestion || showFeedback || currentQuestion.type !== 'spelling') return;
    // Speak "hyphen" for the hyphen character
    if (speak) speak(letter === '-' ? 'hyphen' : letter);

    const newAnswer = [...userAnswer, letter];
    setUserAnswer(newAnswer);

    if (newAnswer.length === currentQuestion.word.word.length) {
      const userWord = newAnswer.join('').toLowerCase();
      const correctWord = currentQuestion.word.word.toLowerCase();
      const correct = userWord === correctWord;

      setIsCorrect(correct);
      setShowFeedback(true);

      let calculatedScore = scoreRef.current;

      if (correct) {
        const newScore = scoreRef.current + 1;
        setScore(newScore);
        scoreRef.current = newScore;
        calculatedScore = newScore;
        globalPowerWordIndex = (globalPowerWordIndex + 1) % POWER_WORDS.length;
        const chosen = POWER_WORDS[globalPowerWordIndex];
        setCompletionMessage(chosen.display);
        // Say word then power word
        if (speak) {
          const wordText = currentQuestion.word.word;
          speak(`${wordText}, ${chosen.speak}`);
        }
        // Wait for speech to finish before advancing — syllable-based estimate
        const delay = getSpeechDelay(currentQuestion.word.word, chosen.speak);
        setTimeout(() => {
          moveToNextQuestion(calculatedScore);
        }, delay);
      } else {
        // Wrong — say "Try again", then reset answer so user can retry same question
        if (speak) speak('Try again!');
        setTimeout(() => {
          setUserAnswer([]);
          setShowFeedback(false);
          setIsCorrect(false);
        }, 1500);
      }
    }
  };

  const handleRecognitionAnswer = (correct) => {
    quizStartedRef.current = true;
    if (showFeedback && currentQuestion?.type === 'recognition') return;

    let calculatedScore = scoreRef.current;
    if (correct) {
      const newScore = scoreRef.current + 1;
      setScore(newScore);
      scoreRef.current = newScore;
      calculatedScore = newScore;
      globalPowerWordIndex = (globalPowerWordIndex + 1) % POWER_WORDS.length;
      const chosen = POWER_WORDS[globalPowerWordIndex];
      setCompletionMessage(chosen.display);
      if (speak) {
        const wordText = currentQuestion.word.word;
        speak(`${wordText}, ${chosen.speak}`);
      }
      const delay = getSpeechDelay(currentQuestion.word.word, chosen.speak);
      setTimeout(() => {
        window.speechSynthesis.cancel();
        moveToNextQuestion(calculatedScore);
      }, delay);
    } else {
      // Wrong recognition — just move on after a short pause
      setTimeout(() => {
        window.speechSynthesis.cancel();
        moveToNextQuestion(calculatedScore);
      }, 500);
    }
  };

  const moveToNextQuestion = (calculatedScore) => {
    // ✅ Use refs — never stale inside setTimeout callbacks
    const currentIndex = currentQuestionIndexRef.current;
    const totalQuestions = questionsRef.current.length;

    if (currentIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentIndex + 1);
      setUserAnswer([]);
      setShowFeedback(false);
      setIsCorrect(false);
    } else {
      if (totalQuestions === 0) {
        onExit(0, 0);
        return;
      }
      const safeScore = calculatedScore ?? scoreRef.current;
      setFinalScore(safeScore);
      setFinalTotal(totalQuestions);
      window.speechSynthesis.cancel();
      setTimeout(() => {
        setShowAnimation(true);
      }, 400);
    }
  };

  const handleBackspace = () => {
    if (userAnswer.length > 0 && !showFeedback) {
      setUserAnswer(userAnswer.slice(0, -1));
    }
  };

  const handleExit = () => {
    onExit(scoreRef.current, questionsRef.current.length);
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
        speak={speak}
        milestone={milestone}
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
      'nails': '💅', 'nail': '💅', 'net': '🥅', 'nurse': '👩‍⚕️', 'ox': '🐂', 'pizza': '🍕',
      'queen': '👸', 'quilt': '🛏️', 'rain': '🌧️', 'robot': '🤖', 'star': '⭐', 'sun': '☀️',
      'tree': '🌳', 'truck': '🚚', 'vase': '🏺', 'vest': '🦺', 'watch': '⌚', 'whale': '🐋',
      'yak': '🦬', 'yarn': '🧶', 'zebra': '🦓', 'zap': '⚡', 'zipper': '🤐',
      'zigzag': '⚡', 'zeppelin': '🛩️', 'queue': '👥', 'question-mark': '❓'
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
              allWords={wordList
                .filter(w => {
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
                  const wordLower = w.word.toLowerCase().trim();
                  if (bodyPartWords.includes(wordLower)) return false;
                  return true;
                })
                .map(w => {
                  const resolvedImage = getImagePath(w.image);
                  return {
                    word: w.word,
                    image: resolvedImage,
                    originalFilename: w.image
                  };
                })
                .filter(w => {
                  if (!w.image) return false;
                  return true;
                })
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

              <div className="keyboard-wrapper-container">
                <div className="challenge-keyboard">
                  {alphabet.map(letter => {
                    const wordUpper = currentQuestion.word.word.toUpperCase();
                    const totalNeeded = wordUpper.split('').filter(l => l === letter).length;
                    const alreadyUsed = userAnswer.filter(l => l === letter).length;
                    const isUsed = (totalNeeded > 0) && (alreadyUsed >= totalNeeded);
                    const isNeeded = alreadyUsed < totalNeeded;
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
                    <button className="backspace-button" onClick={handleBackspace} disabled={showFeedback}>
                      ⌫ Backspace
                    </button>
                    <button className="exit-button" onClick={handleExit}>
                      🚪 Exit
                    </button>
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