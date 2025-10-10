import React from 'react';
import './CategoryMenuScreen.css'; 
import menuBackground from './assets/menu-background.png'; 

function CategoryMenuScreen(props) {
    const categories = [
    'Alphabet Fun', 
    'Parts of the Body', 
    'Counting',
    'Telling Time',
    'Days & Months',
    'Inside the House',
    'Outside',
    'Community Places',
    'Vehicles',
    'My Bible Words'
  ];

  const handleCategoryClick = (categoryName) => {
    if (categoryName === 'Alphabet Fun') {
      props.onNavigate('alphabet');
    } else {
      // All other categories will now navigate to the learning screen
      props.onNavigate('learning', categoryName);
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
            key={category} 
            className="category-button"
            onClick={() => handleCategoryClick(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <button className="back-button" onClick={() => props.onNavigate('cover')}>Go Back</button>
    </div>
  );
}

export default CategoryMenuScreen;
