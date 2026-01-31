import React, { useState, useEffect } from 'react';
import './RecognitionChallenge.css';

function RecognitionChallenge({ word, wordImage, allWords, onAnswer, speak }) {
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  // Comprehensive emoji mapping
  const getEmojiForWord = (wordText) => {
    const emojiMap = {
      // A
      'apple': '🍎', 'ant': '🐜', 'alligator': '🐊', 'astronaut': '🧑‍🚀', 'airplane': '✈️',
      'anchor': '⚓', 'arrow': '➡️', 'axe': '🪓',
      // B
      'ball': '⚽', 'bear': '🐻', 'bus': '🚌', 'baby': '👶', 'banana': '🍌',
      'bee': '🐝', 'bird': '🐦', 'book': '📖', 'butterfly': '🦋', 'boat': '⛵',
      // C
      'cat': '🐱', 'car': '🚗', 'cookie': '🍪', 'cow': '🐄', 'cake': '🎂',
      'crown': '👑', 'crab': '🦀', 'cloud': '☁️', 'cup': '☕',
      // D
      'dog': '🐕', 'duck': '🦆', 'door': '🚪', 'dinosaur': '🦕', 'deer': '🦌',
      'dolphin': '🐬', 'drum': '🥁', 'diamond': '💎',
      // E
      'egg': '🥚', 'elephant': '🐘', 'elf': '🧝', 'elbow': '💪', 'eagle': '🦅',
      'earth': '🌍', 'eye': '👁️', 'ear': '👂',
      // F
      'fish': '🐠', 'frog': '🐸', 'fire': '🔥', 'flower': '🌸', 'fox': '🦊',
      'flag': '🚩', 'fork': '🍴', 'feather': '🪶',
      // G
      'goat': '🐐', 'girl': '👧', 'grapes': '🍇', 'globe': '🌍', 'guitar': '🎸',
      'gift': '🎁', 'ghost': '👻', 'giraffe': '🦒',
      // H
      'hat': '🎩', 'horse': '🐴', 'hand': '✋', 'heart': '❤️', 'house': '🏠',
      'hammer': '🔨', 'honey': '🍯', 'helicopter': '🚁',
      // I
      'igloo': '🏔️', 'iguana': '🦎', 'island': '🏝️', 'infant': '👶', 'ice-cream': '🍦',
      'insect': '🐛',
      // J
      'jacket': '🧥', 'jellyfish': '🪼', 'jar': '🫙', 'jet': '✈️', 'juice': '🧃',
      'jaguar': '🐆',
      // K
      'kite': '🪁', 'king': '🤴', 'kitten': '🐱', 'koala': '🐨', 'key': '🔑',
      'kangaroo': '🦘', 'kettle': '🫖',
      // L
      'lion': '🦁', 'lamp': '💡', 'lemon': '🍋', 'lollipop': '🍭', 'leaf': '🍃',
      'lips': '💋', 'lock': '🔒', 'ladybug': '🐞',
      // M
      'monkey': '🐵', 'moon': '🌙', 'mouse': '🐭', 'mushroom': '🍄', 'milk': '🥛',
      'mango': '🥭', 'mountain': '⛰️', 'music': '🎵',
      // N
      'nail': '🔨', 'necklace': '📿', 'net': '🥅', 'nurse': '👩‍⚕️', 'nose': '👃',
      'nest': '🪺', 'notebook': '📓',
      // O
      'octopus': '🐙', 'ostrich': '🦩', 'otter': '🦦', 'ox': '🐂', 'orange': '🍊',
      'ocean': '🌊', 'owl': '🦉',
      // P
      'peacock': '🦚', 'pencil': '✏️', 'pizza': '🍕', 'pumpkin': '🎃', 'panda': '🐼',
      'parrot': '🦜', 'pig': '🐷', 'piano': '🎹',
      // Q
      'quail': '🦢', 'queen': '👸', 'quilt': '🛏️', 'question-mark': '❓',
      // R
      'rain': '🌧️', 'rainbow': '🌈', 'robot': '🤖', 'rocket': '🚀', 'rose': '🌹',
      'rabbit': '🐰', 'ring': '💍',
      // S
      'shoes': '👟', 'spoon': '🥄', 'star': '⭐', 'sun': '☀️', 'snake': '🐍',
      'snowman': '⛄', 'ship': '🚢', 'scissors': '✂️',
      // T
      'table': '🪑', 'tree': '🌳', 'telephone': '📞', 'truck': '🚚', 'turtle': '🐢',
      'tiger': '🐯', 'tooth': '🦷', 'tornado': '🌪️',
      // U
      'umbrella': '☂️', 'unicorn': '🦄', 'umpire': '🧑‍⚖️', 'unicycle': '🚲', 'uniform': '👔',
      // V
      'vase': '🏺', 'vest': '🦺', 'violin': '🎻', 'volcano': '🌋', 'van': '🚐',
      // W
      'wagon': '🛒', 'watch': '⌚', 'whale': '🐋', 'wheel': '🎡', 'watermelon': '🍉',
      'wolf': '🐺', 'windmill': '🏰',
      // X
      'xylophone': '🎹', 'x-ray': '🩻', 'x-box': '🎮',
      // Y
      'yak': '🦬', 'yarn': '🧶', 'yogurt': '🥛', 'yacht': '⛵', 'yo-yo': '🪀',
      // Z
      'zebra': '🦓', 'zipper': '🤐', 'zap': '⚡', 'zeppelin': '🎈', 'zigzag': '〰️',
      'zombie': '🧟', 'zoo': '🦁'
    };

    const wordLower = wordText.toLowerCase();
    return emojiMap[wordLower] || '📝';
  };

  useEffect(() => {
    // Generate 4 choices including the correct answer
    const generateChoices = () => {
      const correctWord = { word, image: wordImage, emoji: getEmojiForWord(word) };
      
      // Filter out the correct word and get random wrong choices
      const wrongWords = allWords
        .filter(w => w.word.toLowerCase() !== word.toLowerCase())
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => ({ ...w, emoji: getEmojiForWord(w.word) }));
      
      // Combine and shuffle
      const allChoices = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5);
      setChoices(allChoices);
    };

    generateChoices();
    setSelectedChoice(null);
    setIsCorrect(null);
  }, [word, wordImage, allWords]);

  const handleChoiceClick = (choice) => {
    if (selectedChoice) return; // Already answered

    setSelectedChoice(choice);
    const correct = choice.word.toLowerCase() === word.toLowerCase();
    setIsCorrect(correct);

    if (speak) {
      if (correct) {
        speak(`Correct! It's ${word}!`);
      } else {
        speak(`Not quite. It's ${word}, not ${choice.word}.`);
      }
    }

    setTimeout(() => {
      onAnswer(correct);
    }, 1500);
  };

  return (
    <div className="recognition-challenge">
      <div className="recognition-header">
        <div className="sound-icon" onClick={() => speak && speak(word)}>
          🔊
        </div>
        <h2 className="recognition-question">
          Which one is the <span className="highlight-word">{word}</span>?
        </h2>
      </div>

      <div className="recognition-choices">
        {choices.map((choice, index) => (
          <div
            key={index}
            className={`recognition-choice ${
              selectedChoice === choice
                ? isCorrect
                  ? 'correct-choice'
                  : 'incorrect-choice'
                : ''
            } ${selectedChoice && choice.word.toLowerCase() === word.toLowerCase() ? 'show-correct' : ''}`}
            onClick={() => handleChoiceClick(choice)}
          >
            <div className="choice-visual">
              {/* Use emoji instead of image */}
              <div className="choice-emoji">
                {choice.emoji}
              </div>
            </div>
            <div className="choice-label">
              {choice.word}
            </div>
            
            {/* Feedback icons */}
            {selectedChoice && (
              <>
                {selectedChoice === choice && isCorrect && (
                  <div className="feedback-badge correct-badge">✓</div>
                )}
                {selectedChoice === choice && !isCorrect && (
                  <div className="feedback-badge incorrect-badge">✗</div>
                )}
                {selectedChoice !== choice && choice.word.toLowerCase() === word.toLowerCase() && (
                  <div className="feedback-badge correct-answer-badge">✓</div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecognitionChallenge;