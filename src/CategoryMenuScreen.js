import React from 'react';
import './CategoryMenuScreen.css'; 
import menuBackground from './assets/menu-background.png'; 

function CategoryMenuScreen({ onNavigate, activeUser, speak }) {
  const categories = [
    { name: 'Alphabet Fun', enabled: true }, 
    { name: 'Parts of the Body', enabled: true }, 
    { name: 'Counting', enabled: false },
    { name: 'Telling Time', enabled: false },
    { name: 'Days & Months', enabled: false },
    { name: 'Inside the House', enabled: false },
    { name: 'Outside', enabled: false },
    { name: 'Community Places', enabled: false },
    { name: 'Vehicles', enabled: false },
    { name: 'Faith-builder Words', enabled: false }
  ];

  const handleCategoryClick = (category) => {
    if (!category.enabled) return;
    if (category.name === 'Alphabet Fun') {
      onNavigate('alphabet');
    } else {
      onNavigate('learning', category.name);
    }
  };

  return (
    <div 
      className="category-menu-container" 
      style={{ backgroundImage: `url(${menuBackground})` }}
    >
      <h1 className="category-title">Choose an Activity</h1>

      {/* ✅ Active player indicator */}
      {activeUser && (
        <button
          className="players-menu-btn"
          onClick={() => onNavigate('players')}
        >
          <span className="players-btn-avatar">{activeUser.avatar}</span>
          <span className="players-btn-name">{activeUser.name}</span>
          <span className="players-btn-arrow">›</span>
        </button>
      )}

      <div className="category-buttons-grid">
        {categories.map(category => (
          <button 
            key={category.name} 
            className={`category-button ${!category.enabled ? 'disabled' : ''}`}
            onClick={() => handleCategoryClick(category)}
            disabled={!category.enabled}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <button className="progress-button" onClick={() => onNavigate('stats')}>
        🏆 My Progress 🏆
      </button>
      
      <button className="back-button" onClick={() => onNavigate('cover')}>Go Back</button>
    </div>
  );
}

export default CategoryMenuScreen;