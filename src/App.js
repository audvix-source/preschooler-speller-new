import React, { useState, useEffect, useRef } from 'react';
import StatsScreen from './components/StatsScreen';
import scoreDB from './services/scoreDatabase';
import './App.css';
import MainScreen from './MainScreen';
import CategoryMenuScreen from './CategoryMenuScreen';
import AlphabetScreen from './AlphabetScreen';
import LearningScreen from './LearningScreen';
import PlayersScreen from './components/PlayersScreen';
import { initUsers, getActiveUserId, setActiveUserId } from './UserManager';

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

  // ✅ Multi-user state
  const [users, setUsers] = useState(() => initUsers());
  const [activeUserId, setActiveUserIdState] = useState(() => getActiveUserId());

  // ✅ Pending navigation — intercept quiz screens to confirm active player
  const [pendingNav, setPendingNav] = useState(null); // { screen, category }
  const [lastBrowsedUserId, setLastBrowsedUserId] = useState(null);

  // ✅ Track whether the player has been confirmed for this play session.
  // Using a ref so navigateTo always reads the live value — no stale closures.
  // Resets when user visits Stats (score-checking is the session break)
  // or switches player via the Players screen.
  const sessionConfirmedRef = useRef(false);

  const handleSetActiveUser = (userId, confirm = false) => {
  setActiveUserId(userId);
  setActiveUserIdState(userId);
  if (confirm) sessionConfirmedRef.current = true;
};

  const activeUser = users.find(u => u?.id === activeUserId) || users[0];

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
    setTimeout(() => {
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
    }, 50);
  };

  // ✅ Called by StatsScreen when user browses a *different* player's tab.
  // Only then do we re-prompt — viewing your own scores is not a session break.
  const handleViewedOtherPlayer = (browsedUserId) => {
  if (browsedUserId !== activeUserId) {
    setLastBrowsedUserId(browsedUserId);
    sessionConfirmedRef.current = false;
  }

  sessionConfirmedRef.current = false;
};
    
  // ✅ Intercept quiz screen navigation to confirm active player
  const QUIZ_SCREENS = ['alphabet', 'learning'];

 const navigateTo = (screen, category = '') => {
  // Visiting stats = session break, require re-confirmation before next quiz
  if (screen === 'stats') {
    sessionConfirmedRef.current = false;
  }
  if (QUIZ_SCREENS.includes(screen) && !sessionConfirmedRef.current) {
    setPendingNav({ screen, category });
    return;
  }
  setSelectedCategory(category);
  setCurrentScreen(screen);
};

  // ✅ User confirmed — proceed to the quiz and mark session as confirmed
  const handleConfirmPlayer = () => {
    if (pendingNav) {
      sessionConfirmedRef.current = true;
      setSelectedCategory(pendingNav.category);
      setCurrentScreen(pendingNav.screen);
      setPendingNav(null);
    }
  };

  // ✅ User wants to switch — drop them on Players screen.
  // Session will be confirmed once they pick a player there.
  const handleSwitchPlayer = () => {
    setPendingNav(null);
    setCurrentScreen('players');
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
        return <CategoryMenuScreen
  onNavigate={navigateTo}
  speak={speak}
  activeUser={activeUser}
/>;
      case 'alphabet':
        return <AlphabetScreen
          onNavigate={navigateTo}
          speak={speak}
          userId={activeUserId}
        />;
      case 'learning':
        return <LearningScreen
          onNavigate={navigateTo}
          speak={speak}
          category={selectedCategory}
          userId={activeUserId}
        />;
      case 'stats':
        return <StatsScreen
          onNavigate={navigateTo}
          speak={speak}
          userId={activeUserId}
          users={users}
          onViewedOtherPlayer={handleViewedOtherPlayer}
        />;
      case 'players':
        return <PlayersScreen
          users={users}
          setUsers={setUsers}
          activeUserId={activeUserId}
          setActiveUserId={(id) => handleSetActiveUser(id, true)}
          onBack={() => navigateTo('menu')}
          speak={speak}
        />;
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

  return (
    <div className="App">
      {renderScreen()}

      {/* ✅ Player confirmation modal — shown before any quiz screen */}
      {pendingNav && (
  <div style={{
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 9999
  }}>
    <div style={{
      background: '#fff8e7',
      borderRadius: 24,
      padding: '32px 28px',
      textAlign: 'center',
      maxWidth: 300,
      width: '85%',
      border: '3px solid #FFA500',
      boxShadow: '0 8px 32px rgba(0,0,0,0.25)'
    }}>
      {/* Active player confirmation */}
      <div style={{ fontSize: 52, marginBottom: 4 }}>{activeUser?.avatar}</div>
      <p style={{ margin: '0 0 4px', color: '#888', fontSize: 15 }}>Still playing?</p>
      <h2 style={{ margin: '0 0 20px', color: '#2d3436', fontSize: 26 }}>
        {activeUser?.name}
      </h2>
      <button
        onClick={handleConfirmPlayer}
        style={{
          display: 'block', width: '100%', padding: '13px',
          background: '#00b894', color: '#fff', border: 'none',
          borderRadius: 14, fontSize: 18, fontWeight: 'bold',
          marginBottom: 10, cursor: 'pointer',
          boxShadow: '0 4px 0 #00916e'
        }}
      >
        ✅ Yes, that's me!
      </button>

      {/* Switch to last browsed player */}
      {lastBrowsedUserId && lastBrowsedUserId !== activeUserId && (() => {
        const browsedUser = users.find(u => u?.id === lastBrowsedUserId);
        return browsedUser ? (
          <button
            onClick={() => {
              handleSetActiveUser(lastBrowsedUserId, true);
              setLastBrowsedUserId(null);
              sessionConfirmedRef.current = true;
              setSelectedCategory(pendingNav.category);
              setCurrentScreen(pendingNav.screen);
              setPendingNav(null);
            }}
            style={{
              display: 'block', width: '100%', padding: '13px',
              background: '#6c5ce7', color: '#fff', border: 'none',
              borderRadius: 14, fontSize: 18, fontWeight: 'bold',
              marginBottom: 10, cursor: 'pointer',
              boxShadow: '0 4px 0 #5b4bc4'
            }}
          >
            🔄 Switch to {browsedUser.avatar} {browsedUser.name}
          </button>
        ) : null;
      })()}

      {/* Go to Players screen */}
      <button
        onClick={handleSwitchPlayer}
        style={{
          display: 'block', width: '100%', padding: '13px',
          background: '#e17055', color: '#fff', border: 'none',
          borderRadius: 14, fontSize: 18, fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 0 #c0392b'
        }}
      >
        👥 Someone else?
      </button>
    </div>
  </div>
)}
    </div>
  );
}

export default App;