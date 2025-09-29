import React, { useState, useRef } from 'react';
import './MainScreen.css';
import coverBackground from './assets/cover-background.png';
import SettingsModal from './SettingsModal';
import Greeting from './Greeting';
import welcomeJingle from './assets/welcome-jingle.mp3';

function MainScreen(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const audioRef = useRef(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { speak, settings, setters, onNavigate, setGuideVoice } = props;
  const { brightness, pitch, speed } = settings;
  const { setBrightness, setPitch, setSpeed } = setters;

  const handleBrightnessChange = (event) => setBrightness(parseInt(event.target.value, 10));
  const handlePitchChange = (event) => setPitch(parseFloat(event.target.value));
  const handleSpeedChange = (event) => setSpeed(parseFloat(event.target.value));

  const playJingle = () => {
    console.log("Attempting to play jingle...");
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play()
        .then(() => {
          console.log("Jingle started successfully");
          // Start fade out after 4 seconds
          setTimeout(() => {
            if (audioRef.current) {
              console.log("Starting jingle fade out after 4 seconds");
              const fadeOut = setInterval(() => {
                if (audioRef.current.volume > 0.1) {
                  audioRef.current.volume -= 0.1;
                } else {
                  console.log("Stopping jingle after fade");
                  audioRef.current.pause();
                  audioRef.current.currentTime = 0;
                  audioRef.current.volume = 1.0; // Reset volume for next time
                  clearInterval(fadeOut);
                }
              }, 100);
            }
          }, 4000);
        })
        .catch(e => console.error("Jingle play failed:", e));
    } else {
      console.error("Audio ref is null");
    }
  };

  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleStart = () => {
    console.log("Let's Fly button clicked");
    window.speechSynthesis.cancel();
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (!hasInteracted) {
      setHasInteracted(true);
    }

    playJingle();
    
    // Navigate after jingle finishes (5 seconds + buffer)
    setTimeout(() => {
      console.log("Navigating to menu");
      onNavigate('menu');
    }, 5500);
  };

  const handleSettingsOpen = () => {
    handleFirstInteraction();
    setIsModalOpen(true);
  };

  const handleToucanClick = () => {
    console.log("Toucan clicked");
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setHasInteracted(true);
    setGuideVoice('male');

    setTimeout(() => {
      const text = "I'm Treb the toucan and this is Maya the parrot. We are your guides in this learning journey. Click on the 'Let's Fly' button and let's get started!";
      console.log("Speaking toucan text");
      speak(text, 'male');
    }, 300);
  };

  const handleParrotClick = () => {
    console.log("Parrot clicked");
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setHasInteracted(true);
    setGuideVoice('female');

    setTimeout(() => {
      const text = "I'm Maya the parrot and this is Treb the toucan. We are your guides in this learning journey. Click on the 'Let's Fly' button and let's get started!";
      console.log("Speaking parrot text");
      speak(text, 'female');
    }, 300);
  };

  const mainStyle = {
    backgroundImage: `url(${coverBackground})`,
    filter: `brightness(${brightness}%)`
  };

  return (
    <div className="main-container" style={mainStyle}>
      <audio ref={audioRef} src={welcomeJingle} />

      <Greeting />

      <button className="settings-button" onClick={handleSettingsOpen}>⚙️</button>

      <button className="start-button-overlay" onClick={handleStart}></button>

      <button className="toucan-touchpad" onClick={handleToucanClick}></button>

      <button className="parrot-touchpad" onClick={handleParrotClick}></button>

      {isModalOpen && <SettingsModal
        onClose={() => setIsModalOpen(false)}
        currentBrightness={brightness} onBrightnessChange={handleBrightnessChange}
        currentPitch={pitch} onPitchChange={handlePitchChange}
        currentSpeed={speed} onSpeedChange={handleSpeedChange}
      />}
    </div>
  );
}

export default MainScreen;