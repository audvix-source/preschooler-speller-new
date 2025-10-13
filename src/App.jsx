import React, { useState, useEffect } from 'react';
import MainScreen from './MainScreen';
import CategoryMenuScreen from './CategoryMenuScreen';
import AlphabetScreen from './AlphabetScreen';
import LearningScreen from './LearningScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('cover');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [guideVoice, setGuideVoice] = useState('male');

  const [brightness, setBrightness] = useState(100); 
  const [pitch, setPitch] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

 // In App.jsx

  const speak = (text, forceGender = null) => {
    if (!('speechSynthesis' in window)) {
      console.error("Speech synthesis not supported.");
      return;
    }
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = speed;

    // Get the latest list of voices directly from the browser
    const allVoices = window.speechSynthesis.getVoices();
    if (allVoices.length === 0) {
        console.warn("Voices not loaded yet.");
        // As a fallback, just speak with the default voice
        window.speechSynthesis.speak(utterance);
        return;
    }

    const voiceType = forceGender || guideVoice;

    if (voiceType === 'male') {
        // Find a suitable male voice
        const maleVoice = allVoices.find(v => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David')));
        if (maleVoice) {
            utterance.voice = maleVoice;
        }
    } else { // female
        const femaleVoice = allVoices.find(v => v.lang.startsWith('en') && (v.name.includes('Female') || v.name.includes('Zira')));
        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }
    }
    
    window.speechSynthesis.speak(utterance);
  };

  const navigateTo = (screen, category = '') => {
    setSelectedCategory(category);
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'cover':
        return <MainScreen 
          onNavigate={navigateTo} 
          speak={speak}
          setGuideVoice={setGuideVoice}
          settings={{ brightness, pitch, speed }}
          setters={{ setBrightness, setPitch, setSpeed }}
        />;
      case 'menu':
        return <CategoryMenuScreen onNavigate={navigateTo} />;
      case 'alphabet':
        return <AlphabetScreen onNavigate={navigateTo} speak={speak} />;
      case 'learning':
        return <LearningScreen onNavigate={navigateTo} speak={speak} category={selectedCategory} />;
      default:
        // Fallback to the cover screen if the state is unknown
        return <MainScreen onNavigate={navigateTo} speak={speak} setGuideVoice={setGuideVoice} settings={{ brightness, pitch, speed }} setters={{ setBrightness, setPitch, setSpeed }}/>;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;
