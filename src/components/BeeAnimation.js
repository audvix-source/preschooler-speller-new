import React, { useEffect, useState } from 'react';
import './BeeAnimation.css';
import beehiveImage from '../assets/emojis/beehive-emoji.png';
import branchImage from '../assets/emojis/branch-tree.png';
import beeSwarmImage from '../assets/emojis/swarm-emoji.png';

function BeeAnimation({ beeCount, beeSize, onComplete, flightPattern = 'default' }) {
  const [bees, setBees] = useState([]);

  useEffect(() => {
    // Flight patterns mapped shortest → longest delay option:
    //   default  = Let's Go  → fly RIGHT (excited charge)
    //   taps:20  = +20 taps  → fly LEFT
    //   taps:30  = +30 taps  → diagonal up-left
    //   taps:40  = +40 taps  → straight up
    //   taps:50  = +50 taps  → chaos everywhere
    const patterns = {
      'default': () => ({
        midX: (Math.random() - 0.5) * 40,
        midY: Math.random() * 100 + 60,
        endX: Math.random() * 80 + 140,
        endY: -(Math.random() * 120 + 140)
      }),
      'taps:20': () => ({
        midX: -(Math.random() * 40 + 20),
        midY: Math.random() * 80 + 40,
        endX: -(Math.random() * 120 + 100),
        endY: -(Math.random() * 100 + 120)
      }),
      'taps:30': () => ({
        midX: -(Math.random() * 30 + 10),
        midY: Math.random() * 60 + 30,
        endX: -(Math.random() * 150 + 120),
        endY: -(Math.random() * 150 + 160)
      }),
      'taps:40': () => ({
        midX: (Math.random() - 0.5) * 30,
        midY: Math.random() * 50 + 20,
        endX: (Math.random() - 0.5) * 60,
        endY: -(Math.random() * 180 + 180)
      }),
      'taps:50': () => ({
        midX: (Math.random() - 0.5) * 100,
        midY: Math.random() * 120 + 40,
        endX: (Math.random() - 0.5) * 250,
        endY: -(Math.random() * 200 + 100)
      }),
    };

    const getPattern = patterns[flightPattern] || patterns['default'];

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

    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3500);

    return () => clearTimeout(timer);
  }, [beeCount, flightPattern, onComplete]);

  return (
    <div className="bee-animation-container">
      <div className="bee-animation__branch">
        <img
          src={branchImage}
          alt="Tree Branch"
          className="branch-image"
          style={{ height: '450px', width: 'auto' }}
          key={Date.now()}
        />
      </div>

      <div className="bee-animation__beehive">
        <img
          src={beehiveImage}
          alt="Beehive"
          style={{ width: 'auto', height: '300px' }}
        />
      </div>

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
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        </div>
      ))}
    </div>
  );
}

export default BeeAnimation;