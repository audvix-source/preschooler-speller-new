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
  const [selectedGender, setSelectedGender] = useState(null);

  const { speak, settings, setters, onNavigate, setGuideVoice, guideVoice } = props;
  const { brightness, pitch, speed } = settings;
  const { setBrightness, setPitch, setSpeed } = setters;

  const handleBrightnessChange = (event) => setBrightness(parseInt(event.target.value, 10));
  const handlePitchChange = (event) => setPitch(parseFloat(event.target.value));
  const handleSpeedChange = (event) => setSpeed(parseFloat(event.target.value));

  const playJingle = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => console.error("Jingle play failed:", e));
    }
  };

  const handleFirstInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  };

  const handleStart = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (selectedGender) {
      playJingle();
      setTimeout(() => {
        onNavigate('menu');
      }, 5000);
    } else {
      speak("Please choose a playmate first!");
    }
  };

  const handleSettingsOpen = () => {
    handleFirstInteraction();
    setIsModalOpen(true);
  };

  const handleToucanClick = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setHasInteracted(true);
    setGuideVoice('male');
    setTimeout(() => {
      const text = "Hello, I'm Treb, the toucan; great to see you here!";
      speak(text, 'male');
    }, 300);
  };

  const handleParrotClick = () => {
    window.speechSynthesis.cancel();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setHasInteracted(true);
    setGuideVoice('female');
    setTimeout(() => {
      const text = "Hi, I'm Maya, the parrot. how are you?";
      speak(text, 'female');
    }, 300);
  };
  
  // REPLACE IT WITH THIS
const handleGenderSelect = (gender) => {
  setSelectedGender(gender);
  
  // This sets the main guide voice for the rest of the app
  const voiceType = gender === 'boy' ? 'male' : 'female';
  setGuideVoice(voiceType);

  window.speechSynthesis.cancel();
  const instructionText = "We are your guide in this learning journey. I'm happy to be your learning buddy. Click on the 'let's fly' button and let's get started!";
  
  // This now correctly uses the voice of the gender you just clicked
  speak(instructionText, voiceType);
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

      {/* Bird touchpads */}
      <button className="toucan-touchpad" onClick={handleToucanClick}></button>
      <button className="parrot-touchpad" onClick={handleParrotClick}></button>

      {/* Gender selection touchpads */}
      <button 
        className="gender-touchpad male" 
        onClick={() => handleGenderSelect('boy')}
      ></button>
      <button 
        className="gender-touchpad female" 
        onClick={() => handleGenderSelect('girl')}
      ></button>

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