import React from 'react';
import './MagicalTransition.css';

function MagicalTransition({ side }) {
  const particles = Array.from({ length: 40 }); 
  
  const containerClassName = `magic-container ${side}`;

  return (
    <div className={containerClassName}>
      {particles.map((_, index) => (
        <div
          key={index}
          className="smoke-particle"
          style={{
            '--x': (Math.random() - 0.5) * 150,
            '--y': Math.random() * 50,
            '--delay': Math.random() * 1, 
          }}
        />
      ))}
    </div>
  );
}

export default MagicalTransition;
