import React, { useState, useEffect } from 'react';
import './ComingSoonModal.css';
import mayaImage from '../assets/maya-flying.png';
import trebImage from '../assets/treb-flying.png';

function ComingSoonModal({ show, onClose }) {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (show && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      onClose();
    }
  }, [show, countdown, onClose]);

  useEffect(() => {
    if (show) {
      setCountdown(10); // Reset countdown when modal opens
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="rainbow-header">
          <h2><span className="rainbow-left">🌈</span> More Fun Coming Soon! <span className="rainbow-right">🌈</span></h2>
        </div>
        
        <div className="birds-container">
          <div className="bird-message">
            <img src={mayaImage} alt="Maya the Parrot" className="bird-image parrot" />
            <p className="speech-bubble left">
              We're working on<br/>
              <strong>new body parts!</strong>
            </p>
          </div>
          
          <div className="bird-message">
            <img src={mayaImage} alt="Maya the Parrot" className="bird-image parrot" />
            <p className="speech-bubble right">
              And adding<br/>
              <strong>new voices & images!</strong>
            </p>
          </div>
          
          <div className="toucan-solo">
            <img src={trebImage} alt="Treb the Toucan" className="bird-image-large toucan" />
            <p className="toucan-text">Treb says hi! 👋</p>
          </div>
        </div>

        <div className="coming-soon-message">
          <p>✨ Check back in 2 weeks for more learning adventures! ✨</p>
        </div>

        <button className="close-button" onClick={onClose}>
          Let's Fly! 🐝
          <span className="countdown">{countdown}</span>
        </button>
      </div>
    </div>
  );
}

export default ComingSoonModal;