import React, { useState, useEffect } from 'react';
import './RecognitionChallenge.css';

// ✅ Import all emoji images
const importAll = (r) => {
  let images = {};
  r.keys().forEach((item) => { 
    images[item.replace('./', '')] = r(item); 
  });
  return images;
};

const images = importAll(require.context('../assets/emojis', false, /\.(png|jpe?g|svg)$/));

// ✅ Get image path helper with special X-word mappings
const getImagePath = (fileName) => {
  if (!fileName) {
    console.warn('RecognitionChallenge getImagePath: No fileName provided');
    return null;
  }
  
  // ✅ Special mapping for X-words
  const specialMappings = {
    'x-box.png': 'xbox-emoji.png',
    'x-pen.png': 'xpen-emoji.png',
    'xerox-machine.png': 'xeroxmachine-emoji.png',
    'x-ray.png': 'x-ray-emoji.png',
    'xylophone.png': 'xylophone-emoji.png',
  };
  
  // Check if it's a special case
  if (specialMappings[fileName]) {
    const mappedFile = specialMappings[fileName];
    if (images[mappedFile]) {
      return images[mappedFile];
    } else {
      console.warn(`RecognitionChallenge: Mapped file not found: ${mappedFile}`);
      return null;
    }
  }
  
  // Normal case: add -emoji
  const emojiFileName = fileName.replace('.png', '-emoji.png');
  if (images[emojiFileName]) {
    return images[emojiFileName];
  } else {
    console.warn(`RecognitionChallenge: Image not found: ${emojiFileName}`);
    return null;
  }
};

function RecognitionChallenge({ word, wordImage, allWords, onAnswer, speak }) {
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    // Generate 4 choices including the correct answer
    const generateChoices = () => {
      // Correct answer
      const correctChoice = {
        word: word,
        image: wordImage
      };
      
      // Get 3 random wrong answers - FILTER OUT ONES WITHOUT IMAGES
      const wrongChoices = allWords
        .filter(w => w.word.toLowerCase() !== word.toLowerCase())
        .filter(w => w.image !== null && w.image !== undefined) // ✅ Only include if image exists
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      // Combine and shuffle all 4
      const allChoices = [correctChoice, ...wrongChoices]
        .sort(() => Math.random() - 0.5);
      
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
        <h2 className="recognition-question">
          Which one is<br />
          the <span className="highlight-word">{word}</span>?
        </h2>
        <div className="sound-icon" onClick={() => speak && speak(word)}>
          🔊
        </div>
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
              {choice.image ? (
                <img 
                  src={choice.image} 
                  alt=""
                  className="choice-image"
                />
              ) : (
                <div className="choice-placeholder">?</div>
              )}
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