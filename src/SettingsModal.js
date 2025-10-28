import React from 'react';
import './SettingsModal.css';

function SettingsModal(props) {
  return (
    <div className="settings-backdrop">
      <div className="settings-container">
        <h2>Settings</h2>
        
        <div className="settings-list">
          <div className="setting-option">
            <label>Brightness</label>
            <div className="slider-container">
              <span>Dark</span>
              <input type="range" min="50" max="100" value={props.currentBrightness} onChange={props.onBrightnessChange} />
              <span>Bright</span>
            </div>
          </div>
          
          <div className="setting-option">
            <label>Pitch</label>
            <div className="slider-container">
              <span>Low</span>
              <input type="range" min="0" max="2" step="0.1" value={props.currentPitch} onChange={props.onPitchChange} />
              <span>High</span>
            </div>
          </div>
          
          <div className="setting-option">
            <label>Speed</label>
            <div className="slider-container">
              <span>Slow</span>
              <input type="range" min="0.5" max="2" step="0.1" value={props.currentSpeed} onChange={props.onSpeedChange} />
              <span>Fast</span>
            </div>
          </div>
        </div>
        
        <button onClick={props.onClose} className="settings-close-button">Close</button>
      </div>
    </div>
  );
}

export default SettingsModal;