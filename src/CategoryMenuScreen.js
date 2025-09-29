import React from 'react';
import './CategoryMenuScreen.css'; 
import menuBackground from './assets/menu-background.png'; 

function CategoryMenuScreen({ onNavigate }) {
  // Consider moving this to a constants file or making it configurable
  const categories = [
    { id: 'alphabet-fun', name: 'Alphabet Fun', route: 'alphabet' }, 
    { id: 'body-parts', name: 'Parts of the Body', route: 'learning' },
    { id: 'inside-house', name: 'Inside the House', route: 'learning' },
    { id: 'outside', name: 'Outside', route: 'learning' },
    { id: 'community-places', name: 'Community Places', route: 'learning' },
    { id: 'vehicles', name: 'Vehicles', route: 'learning' },
    { id: 'counting', name: 'Counting', route: 'learning' },
    { id: 'telling-time', name: 'Telling Time', route: 'learning' },
    { id: 'days-months', name: 'Days & Months', route: 'learning' },
    { id: 'bible-words', name: 'My Bible Words', route: 'learning' }
  ];

  const handleCategoryClick = (category) => {
    if (category.route === 'alphabet') {
      onNavigate('alphabet');
    } else {
      onNavigate('learning', category.name);
    }
  };

  const handleKeyPress = (event, category) => {
    // Handle Enter and Space key presses for accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleCategoryClick(category);
    }
  };

  return (
    <div 
      className="category-menu-container" 
      style={{ 
        backgroundImage: `url(${menuBackground})`,
        // Fallback background color in case image fails to load
        backgroundColor: '#f0f8ff'
      }}
      role="main"
      aria-label="Category selection menu"
    >
      <h1 className="category-title">Choose an Activity</h1>
      
      <div className="category-buttons-grid" role="grid">
        {categories.map((category, index) => (
          <button 
            key={category.id} // Use unique ID instead of name
            className="category-button"
            onClick={() => handleCategoryClick(category)}
            onKeyPress={(e) => handleKeyPress(e, category)}
            aria-label={`Select ${category.name} activity`}
            tabIndex={0}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <button 
        className="back-button" 
        onClick={() => onNavigate('cover')}
        aria-label="Go back to main screen"
      >
        Go Back
      </button>
    </div>
  );
}

export default CategoryMenuScreen;
