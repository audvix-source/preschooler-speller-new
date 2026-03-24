/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import './MainScreen.css';
import coverBackground from './assets/cover-background.png';
import SettingsModal from './SettingsModal';
import Greeting from './Greeting';
import welcomeJingle from './assets/welcome-jingle.mp3';

function MainScreen(props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const bubbleTimerRef = useRef(null);                  // Add this near your other refs [cite: 195]
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

  const [speechBubble, setSpeechBubble] = useState(null);

  const handleToucanClick = () => {
  window.speechSynthesis.cancel();
  if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current); // Clear previous

  setHasInteracted(true);
  setGuideVoice('male');
  const text = "Hi! I'm Treb the Toucan! Tap the truck below and I'll show you around!";
  setSpeechBubble({ who: 'toucan', text });

  bubbleTimerRef.current = setTimeout(() => setSpeechBubble(null), 7000);
  setTimeout(() => speak(text, 'male'), 300);
  };

  const handleParrotClick = () => {
  window.speechSynthesis.cancel();
  if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current); // Clear previous

  setHasInteracted(true);
  setGuideVoice('female');
  const text = "Hi! I'm Maya the Parrot! Tap the doll below and I'll guide you!";
  setSpeechBubble({ who: 'parrot', text });

  bubbleTimerRef.current = setTimeout(() => setSpeechBubble(null), 6000);
  setTimeout(() => speak(text, 'female'), 300);
  };
  
  const handleTruckClick = () => {
  window.speechSynthesis.cancel();
  if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current); // Clear previous

  setGuideVoice('male');
  const text = "Great choice! I'm Treb and I'll be your guide. Let's fly!";
  setSpeechBubble({ who: 'toucan', text });

  bubbleTimerRef.current = setTimeout(() => setSpeechBubble(null), 6000);
  setTimeout(() => speak(text, 'male'), 300);
  };

const handleDollClick = () => {
  window.speechSynthesis.cancel();
  if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current); // Clear previous

  setGuideVoice('female');
  const text = "Yay! I'm Maya and I'll guide you through! Let's fly!";
  setSpeechBubble({ who: 'parrot', text });

  bubbleTimerRef.current = setTimeout(() => setSpeechBubble(null), 6000);
  setTimeout(() => speak(text, 'female'), 300);
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
  <div style={{ position: 'relative', width: '100%', maxWidth: '420px', height: '100vh', maxHeight: '680px', margin: '0 auto', overflow: 'visible'}}>
    <div className="main-container" style={mainStyle}>
      <audio ref={audioRef} src={welcomeJingle} />
      <Greeting />
      <button className="settings-button" onClick={handleSettingsOpen}>⚙️</button>
      <button className="start-button-overlay" onClick={handleStart}></button>

      {/* Bird touchpads */}
      <button className="toucan-touchpad" onClick={handleToucanClick}></button>
      <button className="parrot-touchpad" onClick={handleParrotClick}></button>

      {/* Gender selection touchpads */}
      <button className="gender-touchpad male" onClick={() => { handleGenderSelect('boy'); handleTruckClick(); }}></button>
      <button className="gender-touchpad female" onClick={() => { handleGenderSelect('girl'); handleDollClick(); }}></button>

      {isModalOpen && <SettingsModal
        onClose={() => setIsModalOpen(false)}
        currentBrightness={brightness} onBrightnessChange={handleBrightnessChange}
        currentPitch={pitch} onPitchChange={handlePitchChange}
        currentSpeed={speed} onSpeedChange={handleSpeedChange}
      />}
    </div>

    {/* Speech bubble — outside filtered div so it's always visible */}
    {speechBubble && (
  <div style={{
    position: 'absolute',
    bottom: '380px',
    left: speechBubble.who === 'toucan' ? '5%' : '60%',     /* ← position based on who is speaking */
    backgroundColor: 'rgba(255, 255, 255, 0.25)',         /* ← transparent white */
    border: '2px solid #003580',                          /* ← dark blue border */
    borderRadius: '18px',
    padding: '10px 14px',
    fontSize: '0.78em',
    fontWeight: '700',
    color: 'black',                                         /* ← black text so it's readable */
    fontFamily: 'Arial, sans-serif',                        /* ← add this to fix font */
    maxWidth: '130px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',             /* ← softer shadow */
    backdropFilter: 'blur(4px)',                            /* ← frosted glass effect (bonus!) */
    zIndex: '30',
    lineHeight: '1.4',
  }}>
    {speechBubble.text}
  </div>
)}
  </div>
);
}

export default MainScreen;