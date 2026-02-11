import React from 'react';
import './CategoryMenuScreen.css'; 
import menuBackground from './assets/menu-background.png'; 

function CategoryMenuScreen(props) {
  // ✅ Categories with enabled/disabled status
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
    { name: 'Faith-builder Words', enabled: false } // ✅ Changed from 'My Bible Words'
  ];

  const handleCategoryClick = (category) => {
    // Don't do anything if category is disabled
    if (!category.enabled) return;
    
    if (category.name === 'Alphabet Fun') {
      props.onNavigate('alphabet');
    } else {
      // All other categories will now navigate to the learning screen
      props.onNavigate('learning', category.name);
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
            className={`category-button ${!category.enabled ? 'disabled' : ''}`}
            onClick={() => handleCategoryClick(category)}
            disabled={!category.enabled}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      {/* My Progress Button */}
      <button className="progress-button" onClick={() => props.onNavigate('stats')}>
        🏆 My Progress 🏆
      </button>
      
      {/* ✅ Go Back button (pulse animation removed in CSS) */}
      <button className="back-button" onClick={() => props.onNavigate('cover')}>Go Back</button>
    </div>
  );
}

export default CategoryMenuScreen;