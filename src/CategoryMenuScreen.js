import React from 'react';
import './CategoryMenuScreen.css'; 
import menuBackground from './assets/menu-background.png'; 

function CategoryMenuScreen({ onNavigate, activeUser, speak }) {
  const categories = [
    { name: 'Alphabet Fun', enabled: true }, 
    { name: 'Parts of the Body', enabled: true }, 
    { name: 'Add Players?', enabled: true },
    { name: 'Counting & Telling Time', enabled: false },
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
    } else if (category.name === 'Add Players?') {
      onNavigate('players');
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

      <div className="category-buttons-grid">
        {categories.map(category => (
          <button 
            key={category.name} 
            className={`category-button ${!category.enabled ? 'disabled' : ''} ${category.name === 'Add Players?' ? 'add-players-btn' : ''}`}
            onClick={() => handleCategoryClick(category)}
            disabled={!category.enabled}
          >
            {category.name === 'Add Players?' ? '👥 Add / Change Players' : category.name}
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