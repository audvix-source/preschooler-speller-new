// src/SpellTheWordScreen.js
import React, { useState } from "react";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const SpellTheWordScreen = ({ onBack }) => {
  const [targetWord] = useState("APE"); // fixed word for mock run
  const [currentGuess, setCurrentGuess] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleLetterClick = (letter) => {
    const newGuess = currentGuess + letter;
    setCurrentGuess(newGuess);

    if (newGuess.length === targetWord.length) {
      if (newGuess === targetWord) {
        setFeedback("🎉 Correct! Well done!");
      } else {
        setFeedback("❌ Try again!");
      }
    }
  };

  const handleReset = () => {
    setCurrentGuess("");
    setFeedback("");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Spell the Word!</h1>
      <p style={styles.wordHint}>Hint: 🐒 (A kind of animal)</p>

      <div style={styles.spellBox}>
        {currentGuess.split("").map((letter, idx) => (
          <span key={idx} style={styles.letter}>
            {letter}
          </span>
        ))}
      </div>

      <div style={styles.keyboard}>
        {alphabet.map((letter) => (
          <button
            key={letter}
            style={styles.key}
            onClick={() => handleLetterClick(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      {feedback && <p style={styles.feedback}>{feedback}</p>}

      <div style={styles.buttonRow}>
        <button style={styles.controlBtn} onClick={handleReset}>
          Reset
        </button>
        <button style={styles.controlBtn} onClick={onBack}>
          Back
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: { padding: "20px", textAlign: "center" },
  title: { fontSize: "2rem", marginBottom: "10px" },
  wordHint: { fontSize: "1.2rem", marginBottom: "20px" },
  spellBox: {
    display: "flex",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "20px",
    fontSize: "2rem",
    fontWeight: "bold",
  },
  letter: {
    borderBottom: "2px solid #000",
    width: "30px",
    textAlign: "center",
  },
  keyboard: {
    display: "grid",
    gridTemplateColumns: "repeat(6, 1fr)",
    gap: "10px",
    marginTop: "20px",
  },
  key: {
    padding: "10px",
    fontSize: "1rem",
    borderRadius: "6px",
    cursor: "pointer",
  },
  feedback: {
    marginTop: "20px",
    fontSize: "1.5rem",
    fontWeight: "bold",
  },
  buttonRow: {
    marginTop: "20px",
    display: "flex",
    justifyContent: "center",
    gap: "20px",
  },
  controlBtn: {
    padding: "10px 20px",
    fontSize: "1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#f39c12",
    color: "#fff",
  },
};

export default SpellTheWordScreen;
