import React, { useEffect, useState } from 'react';
import './BeeAnimation.css';
import beehiveImage from '../assets/emojis/beehive-emoji.png';
import beeSwarmImage from '../assets/emojis/swarm-emoji.png';

function BeeAnimation({ beeCount, beeSize, onComplete }) {
  const [bees, setBees] = useState([]);

  useEffect(() => {
    // Generate bees with random properties
    const generatedBees = Array.from({ length: beeCount }).map((_, i) => ({
      id: i,
      startDelay: Math.random() * 0.5, // 0-0.5s delay for staggered launch
      // Bees fly OUT from center (0, 0) to random positions
      endX: (Math.random() - 0.5) * 350, // -175px to +175px horizontal spread
      endY: Math.random() * 250 + 80, // 80px to 330px vertical spread (below beehive)
      duration: 1.5 + Math.random() * 0.8, // 1.5-2.3s flight duration
      zigzagIntensity: Math.random() * 40 + 15, // 15-55px zigzag amplitude
      rotation: Math.random() * 360, // Random rotation
      // Random flight curve for variety
      curveX: (Math.random() - 0.5) * 100, // -50 to +50px curve in X
      curveY: Math.random() * 80 + 40 // 40-120px curve in Y
    }));
    
    setBees(generatedBees);

    // Call onComplete after animation finishes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2500);

    return () => clearTimeout(timer);
  }, [beeCount, onComplete]);

  return (
    <div className="bee-animation-container">
      {/* Beehive - 3X BIGGER (360px instead of 120px) */}
      <div className="bee-animation__beehive">
        <img 
          src={beehiveImage} 
          alt="Beehive" 
          style={{ 
            width: '360px',  // ✅ 3X BIGGER (was 120px)
            height: 'auto' 
          }}
        />
      </div>

      {/* Bees - FLY OUT from beehive center */}
      {bees.map(bee => (
        <div
          key={bee.id}
          className="bee-animation__bee bee-animation__bee--flying"
          style={{
            '--bee-size': `${beeSize}px`,
            '--start-delay': `${bee.startDelay}s`,
            '--end-x': `${bee.endX}px`,
            '--end-y': `${bee.endY}px`,
            '--curve-x': `${bee.curveX}px`,
            '--curve-y': `${bee.curveY}px`,
            '--duration': `${bee.duration}s`,
            '--zigzag': `${bee.zigzagIntensity}px`,
            '--rotation': `${bee.rotation}deg`,
            animationDelay: `${bee.startDelay}s`
          }}
        >
          <img 
            src={beeSwarmImage} 
            alt="Bee"
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain'
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default BeeAnimation;