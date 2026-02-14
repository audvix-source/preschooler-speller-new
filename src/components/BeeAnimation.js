import React, { useEffect, useState } from 'react';
import './BeeAnimation.css';
import beehiveImage from '../assets/emojis/beehive-emoji.png';
import branchImage from '../assets/emojis/branch-tree.png';
import beeSwarmImage from '../assets/emojis/swarm-emoji.png';

function BeeAnimation({ beeCount, beeSize, onComplete, flightPattern = 'default' }) {
  const [bees, setBees] = useState([]);

  useEffect(() => {
    // ✅ DIFFERENT FLIGHT PATTERNS based on snooze option
    const patterns = {
      // 20 bees - "Let's Go!" - RIGHT SIDE (default)
      'default': () => ({
        midX: (Math.random() - 0.5) * 40,
        midY: Math.random() * 100 + 60,
        endX: Math.random() * 80 + 140,
        endY: -(Math.random() * 120 + 140)
      }),
      
      // 35 bees - 1/4 images - FLY LEFT
      'quarter': () => ({
        midX: -(Math.random() * 40 + 20), // Fly LEFT initially
        midY: Math.random() * 80 + 40,
        endX: -(Math.random() * 120 + 100), // End position LEFT side
        endY: -(Math.random() * 100 + 120)
      }),
      
      // 50 bees - 1/3 images - FLY DIAGONAL UP-LEFT
      'third': () => ({
        midX: -(Math.random() * 30 + 10),
        midY: Math.random() * 60 + 30,
        endX: -(Math.random() * 150 + 120), // Far LEFT
        endY: -(Math.random() * 150 + 160) // Very HIGH
      }),
      
      // 70 bees - 1/2 images - FLY STRAIGHT UP
      'half': () => ({
        midX: (Math.random() - 0.5) * 30, // Minimal horizontal movement
        midY: Math.random() * 50 + 20,
        endX: (Math.random() - 0.5) * 60, // Stay near center horizontally
        endY: -(Math.random() * 180 + 180) // VERY high up
      }),
      
      // 100 bees - All images - FLY EVERYWHERE (chaos!)
      'all': () => ({
        midX: (Math.random() - 0.5) * 100, // Random horizontal
        midY: Math.random() * 120 + 40,
        endX: (Math.random() - 0.5) * 250, // Anywhere on screen
        endY: -(Math.random() * 200 + 100) // High variance
      })
    };

    const getPattern = patterns[flightPattern] || patterns['default'];
    
    // Generate bees with selected pattern
    const generatedBees = Array.from({ length: beeCount }).map((_, i) => {
      const coords = getPattern();
      return {
        id: i,
        startDelay: Math.random() * 0.5,
        ...coords,
        duration: 2.8 + Math.random() * 0.4,
        rotation: Math.random() * 360
      };
    });
    
    setBees(generatedBees);

    // Call onComplete after animation finishes
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [beeCount, flightPattern, onComplete]);

  return (
    <div className="bee-animation-container">
      {/* Tree Branch - at LEFT SIDE */}
      <div className="bee-animation__branch">
        <img 
          src={branchImage}
          alt="Tree Branch"
          className="branch-image"
          style={{
            height: '450px',
            width: 'auto'
          }}
          key={Date.now()}
        />
      </div>

      {/* Beehive - SEPARATE from tree, at LEFT SIDE */}
      <div className="bee-animation__beehive">
        <img 
          src={beehiveImage}
          alt="Beehive" 
          style={{ 
            width: 'auto',
            height: '300px'
          }}
        />
      </div>

      {/* Bees - with dynamic flight pattern */}
      {bees.map(bee => (
        <div
          key={bee.id}
          className="bee-animation__bee bee-animation__bee--to-right-side"
          style={{
            '--bee-size': `${beeSize}px`,
            '--start-delay': `${bee.startDelay}s`,
            '--mid-x': `${bee.midX}px`,
            '--mid-y': `${bee.midY}px`,
            '--end-x': `${bee.endX}px`,
            '--end-y': `${bee.endY}px`,
            '--duration': `${bee.duration}s`,
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