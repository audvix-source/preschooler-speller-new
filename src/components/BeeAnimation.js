import React, { useEffect, useState } from 'react';
import './BeeAnimation.css';
import beehiveImage from '../assets/emojis/beehive-emoji.png';
import branchImage from '../assets/emojis/branch-tree.png'; // ✅ UNCOMMENTED - file is now in place!
import beeSwarmImage from '../assets/emojis/swarm-emoji.png';

function BeeAnimation({ beeCount, beeSize, onComplete }) {
  const [bees, setBees] = useState([]);

  useEffect(() => {
    // Generate bees - FLY to RIGHT SIDE of Progress container
    const generatedBees = Array.from({ length: beeCount }).map((_, i) => ({
      id: i,
      startDelay: Math.random() * 0.5, // 0-0.5s delay for staggered launch
      // Bees fly: DOWN first, then UP and TO THE RIGHT SIDE (near Progress edge)
      midX: (Math.random() - 0.5) * 40, // -20px to +20px (slight variation while going down)
      midY: Math.random() * 100 + 60, // 60px to 160px DOWN first
      endX: Math.random() * 80 + 140, // 140px to 220px to the right (RIGHT SIDE of Progress)
      endY: -(Math.random() * 120 + 140), // -140px to -260px UP (HIGHER, near top of Progress)
      duration: 2.8 + Math.random() * 0.4, // ✅ 2.8-3.2s flight (FULL 3 SECONDS!)
      rotation: Math.random() * 360 // Random rotation
    }));
    
    setBees(generatedBees);

    // Call onComplete after animation finishes (3.5s total - plenty of time!)
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500); // ✅ Extended from 2800 to 3500

    return () => clearTimeout(timer);
  }, [beeCount, onComplete]);

  return (
    <div className="bee-animation-container">
      {/* Tree Branch - at LEFT SIDE */}
      <div className="bee-animation__branch">
        <img 
          src={branchImage}  // ✅ Uses branch-tree.png (your lush tree)
          alt="Tree Branch"
          className="branch-image"
          style={{
            height: '450px',  // ✅ TALLER - 450px so crown extends above Progress
            width: 'auto'
          }}
          key={Date.now()} // ✅ Forces reload of image on component mount
        />
      </div>

      {/* Beehive - SEPARATE from tree, at LEFT SIDE */}
      <div className="bee-animation__beehive">
        <img 
          src={beehiveImage}  // ✅ Uses beehive-emoji.png
          alt="Beehive" 
          style={{ 
            width: 'auto',
            height: '300px'  // ✅ REDUCED from 360px to 300px (smaller!)
          }}
        />
      </div>

      {/* Bees - FLY DOWN THEN UP TO RIGHT SIDE of Progress */}
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