import React, { useState, useEffect } from 'react';
import './RecognitionChallenge.css';

function RecognitionChallenge({ word, wordImage, allWords, onAnswer, speak }) {
  const [choices, setChoices] = useState([]);
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLocked, setIsLocked] = useState(false); // ✅ NEW: Lock choices after selection

  // ✅ CRITICAL FIX: Reset state when word changes (new question)
  useEffect(() => {
    console.log('New question detected, resetting state');
    setSelectedChoice(null);
    setShowFeedback(false);
    setIsLocked(false); // ✅ Unlock for new question
  }, [word]); // Reset when word prop changes

  useEffect(() => {
    // ✅ Don't regenerate if locked (user already clicked)
    if (isLocked) {
      console.log('Choices locked - preventing regeneration');
      return;
    }

    const generateChoices = () => {
      console.log('Generating choices for word:', word);
      console.log('Word image:', wordImage);
      
      const correctChoice = {
        word: word,
        image: wordImage,
        isCorrect: true
      };
      
      const otherWords = allWords.filter(w => 
        w.word.toLowerCase() !== word.toLowerCase() &&
        w.image !== null &&
        w.image !== undefined
      );
      
      console.log('Available wrong answers:', otherWords.length);
      
      const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
      const wrongChoices = shuffled.slice(0, 3).map(w => ({
        word: w.word,
        image: w.image,
        isCorrect: false
      }));
      
      console.log('Wrong choices selected:', wrongChoices.map(c => c.word));
      
      const allChoices = [correctChoice, ...wrongChoices];
      
      const finalChoices = allChoices.sort(() => Math.random() - 0.5);
      
      console.log('Final choices:', finalChoices.map(c => `${c.word} (${c.isCorrect ? 'CORRECT' : 'wrong'})`));
      
      const hasCorrectAnswer = finalChoices.some(c => 
        c.word.toLowerCase() === word.toLowerCase()
      );
      
      if (!hasCorrectAnswer) {
        console.error('CRITICAL BUG: Correct answer not in choices!');
        console.error('Looking for:', word);
        console.error('Got:', finalChoices.map(c => c.word));
        
        finalChoices.pop();
        finalChoices.push(correctChoice);
        finalChoices.sort(() => Math.random() - 0.5);
        
        console.log('Emergency fix applied. New choices:', finalChoices.map(c => c.word));
      }
      
      return finalChoices;
    };
    
    const newChoices = generateChoices();
    setChoices(newChoices);
  }, [word, wordImage, allWords]);

  const handleChoiceClick = (choice) => {
    if (showFeedback) return;
    
    setIsLocked(true); // ✅ LOCK choices immediately to prevent regeneration
    setSelectedChoice(choice);
    setShowFeedback(true);
    
    if (speak) {
      if (choice.isCorrect) {
        speak('Correct! Well done!');
      } else {
        speak(`Not quite! It's ${word}`);
      }
    }
    
    setTimeout(() => {
      onAnswer(choice.isCorrect);
    }, 1000);
  };

  const handleSpeakWord = () => {
    if (speak) {
      speak(word);
    }
  };

  return (
    <div className="recognition-challenge">
      <div className="recognition-header">
        <p className="recognition-question">
          Which one is the <span className="highlight-word">{word}</span>?
        </p>
        <div className="sound-icon" onClick={handleSpeakWord}>
          🔊
        </div>
      </div>

      <div className="recognition-choices">
        {choices.map((choice, index) => {
          const isSelected = selectedChoice?.word === choice.word;
          const isCorrect = choice.isCorrect;
          
          let boxClass = 'recognition-choice';
          if (showFeedback && isSelected) {
            boxClass += isCorrect ? ' correct-choice' : ' incorrect-choice';
          }
          if (showFeedback && !isSelected && isCorrect) {
            boxClass += ' show-correct';
          }
          
          return (
            <div
              key={index}
              className={boxClass}
              onClick={() => handleChoiceClick(choice)}
            >
              <div className="choice-visual">
                {choice.image ? (
                  <img 
                    src={choice.image} 
                    alt={choice.word} 
                    className="choice-image"
                  />
                ) : (
                  <div className="choice-placeholder">?</div>
                )}
              </div>
              
              {showFeedback && isSelected && (
                <div className={`feedback-badge ${isCorrect ? 'correct-badge' : 'incorrect-badge'}`}>
                  {isCorrect ? '✓' : '✗'}
                </div>
              )}
              
              {showFeedback && !isSelected && isCorrect && (
                <div className="feedback-badge correct-answer-badge">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecognitionChallenge;