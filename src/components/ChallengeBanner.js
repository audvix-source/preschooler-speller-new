import React from 'react';
import './ChallengeBanner.css';

export default function ChallengeBanner({ text = 'Challenge Mode!' }) {
  return (
    <div className="challenge-banner">
      {text}
    </div>
  );
}
