import React, { useState, useEffect, useRef } from 'react';
import StatsScreen from './components/StatsScreen';
import scoreDB from './services/scoreDatabase';
import './App.css';
import MainScreen from './MainScreen';
import CategoryMenuScreen from './CategoryMenuScreen';
import AlphabetScreen from './AlphabetScreen';
import LearningScreen from './LearningScreen';

function App() {
  const getSavedState = () => {
    try {
      const saved = localStorage.getItem('preschoolerSpellerState');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.error('Error loading saved state:', e);
      return null;
    }
  };

  const savedState = getSavedState();

  const [currentScreen, setCurrentScreen] = useState(savedState?.currentScreen || 'cover');
  const [selectedCategory, setSelectedCategory] = useState(savedState?.selectedCategory || '');
  const [guideVoice, setGuideVoice] = useState(savedState?.guideVoice || 'male');
  const [brightness, setBrightness] = useState(savedState?.brightness || 100);
  const [pitch, setPitch] = useState(savedState?.pitch || 1);
  const [speed, setSpeed] = useState(savedState?.speed || 1);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        await scoreDB.init();
        console.log('✅ Database initialized successfully');
      } catch (error) {
        console.error('❌ Database initialization failed:', error);
      }
    };
    initDatabase();
  }, []);

  useEffect(() => {
    const stateToSave = {
      currentScreen,
      selectedCategory,
      guideVoice,
      brightness,
      pitch,
      speed,
      lastSaved: new Date().toISOString()
    };
    try {
      localStorage.setItem('preschoolerSpellerState', JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }, [currentScreen, selectedCategory, guideVoice, brightness, pitch, speed]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  useEffect(() => {
    if (typeof window.gtag === 'function') {
      const pagePath = `/${currentScreen}`;
      window.gtag('event', 'page_view', {
        page_title: currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1) + ' Screen',
        page_path: pagePath,
        send_to: 'G-WGSW8CZ35W'
      });
    }
  }, [currentScreen]);

  const speak = (text, forceGender = null) => {
    if (!('speechSynthesis' in window)) {
      console.error("Speech synthesis not supported.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = pitch;
    utterance.rate = speed;
    const voiceType = forceGender || guideVoice;
    if (voiceType === 'female') {
      const femaleVoice = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Female') || v.name.includes('Zira') || v.name.includes('Samantha'))
      );
      if (femaleVoice) utterance.voice = femaleVoice;
    } else if (voiceType === 'male') {
      const maleVoice = voices.find(v =>
        v.lang.startsWith('en') &&
        (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Google UK English Male'))
      );
      if (maleVoice) utterance.voice = maleVoice;
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
      case 'stats':
        return <StatsScreen onNavigate={navigateTo} speak={speak} />;
      default:
        return <MainScreen
          onNavigate={navigateTo}
          speak={speak}
          setGuideVoice={setGuideVoice}
          settings={{ brightness, pitch, speed }}
          setters={{ setBrightness, setPitch, setSpeed }}
        />;
    }
  };

  return <div className="App">{renderScreen()}</div>;
}

export default App;