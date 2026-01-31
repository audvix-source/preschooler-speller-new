import React from 'react';
import './MasteryCheckPrompt.css';

const MasteryCheckPrompt = ({ onAccept, onDecline, speak }) => {
  return (
    <div className="mastery-modal-overlay">
      <div className="mastery-modal-content">
        <h2>🌟 Amazing Progress!</h2>
        <p>You've learned so many letters! Ready for a quick challenge?</p>
        <div className="modal-buttons">
          <button className="accept-btn" onClick={onAccept}>Let's Go!</button>
          <button className="decline-btn" onClick={onDecline}>Later</button>
        </div>
      </div>
    </div>
  );
};

export default MasteryCheckPrompt;