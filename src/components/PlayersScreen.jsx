import React, { useState } from 'react';
import { AVATARS, COLORS, createUser, deleteUser, setActiveUserId } from '../UserManager';
import './PlayersScreen.css';

function PlayersScreen({ users, setUsers, activeUserId, setActiveUserId: setActive, onBack, speak }) {
  const [editingSlot, setEditingSlot] = useState(null);
  const [deleteConfirmSlot, setDeleteConfirmSlot] = useState(null);
  const [deleteStep, setDeleteStep] = useState(0); // 0=none, 1=confirm, 2=preview
  const [formName, setFormName] = useState('');
  const [formAvatar, setFormAvatar] = useState(AVATARS[0]);
  const [formColor, setFormColor] = useState(COLORS[0]);

  const handleSlotClick = (index) => {
    const user = users[index];
    if (user) {
      // Switch to this user
      setActiveUserId(user.id);
      setActive(user.id);
      if (speak) speak(`Now playing as ${user.name}!`);
      onBack();
    } else {
      // Open creation form
      setEditingSlot(index);
      setFormName('');
      setFormAvatar(AVATARS[Math.floor(Math.random() * AVATARS.length)]);
      setFormColor(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
  };

  const handleSave = () => {
    if (!formName.trim()) {
      if (speak) speak("Please enter a name!");
      return;
    }
    const updated = createUser(users, editingSlot, formName, formAvatar, formColor);
    setUsers(updated);
    setActiveUserId(updated[editingSlot].id);
    setActive(updated[editingSlot].id);
    setEditingSlot(null);
    if (speak) speak(`Welcome, ${formName}!`);
    onBack();
  };

  const handleDeleteClick = (e, index) => {
    e.stopPropagation();
    setDeleteConfirmSlot(index);
    setDeleteStep(1);
  };

  const handleDeleteConfirm = () => {
    const updated = deleteUser(users, deleteConfirmSlot);
    setUsers(updated);
    // If deleted user was active, switch to Player 1
    if (users[deleteConfirmSlot]?.id === activeUserId) {
      setActiveUserId(updated[0].id);
      setActive(updated[0].id);
    }
    setDeleteConfirmSlot(null);
    setDeleteStep(0);
    if (speak) speak("Player removed.");
  };

  const activeUser = users.find(u => u?.id === activeUserId);

  return (
    <div className="players-screen">
      <div className="players-container">
        <div className="players-header">
          <h1 className="players-title">👥 Players</h1>
          {activeUser && (
            <p className="players-active-hint">Now playing as <strong>{activeUser.avatar} {activeUser.name}</strong></p>
          )}
        </div>

        <div className="players-grid">
          {users.map((user, index) => (
            <div
              key={index}
              className={`player-slot ${user ? 'filled' : 'empty'} ${user?.id === activeUserId ? 'active' : ''}`}
              style={user ? { backgroundColor: user.color } : {}}
              onClick={() => handleSlotClick(index)}
            >
              {user ? (
                <>
                  {user.id === activeUserId && (
                    <div className="active-crown">▶</div>
                  )}
                  <div className="player-avatar">{user.avatar}</div>
                  <div className="player-name">{user.name}</div>
                  {!user.isDefault && (
                    <button
                      className="player-delete-btn"
                      onClick={(e) => handleDeleteClick(e, index)}
                    >✕</button>
                  )}
                </>
              ) : (
                <>
                  <div className="empty-plus">+</div>
                  <div className="empty-label">Add Player</div>
                </>
              )}
            </div>
          ))}
        </div>

        <button className="players-back-btn" onClick={onBack}>
          ← Back to Menu
        </button>
      </div>

      {/* ── Create Player Form ── */}
      {editingSlot !== null && (
        <div className="players-overlay">
          <div className="players-modal">
            <h2 className="modal-title">New Player</h2>

            <input
              className="name-input"
              type="text"
              placeholder="Enter name..."
              maxLength={12}
              value={formName}
              onChange={e => setFormName(e.target.value)}
              autoFocus
            />

            <p className="picker-label">Choose an avatar:</p>
            <div className="avatar-picker">
              {AVATARS.map(av => (
                <button
                  key={av}
                  className={`avatar-option ${formAvatar === av ? 'selected' : ''}`}
                  onClick={() => setFormAvatar(av)}
                >{av}</button>
              ))}
            </div>

            <p className="picker-label">Choose a color:</p>
            <div className="color-picker">
              {COLORS.map(col => (
                <button
                  key={col}
                  className={`color-swatch ${formColor === col ? 'selected' : ''}`}
                  style={{ backgroundColor: col }}
                  onClick={() => setFormColor(col)}
                />
              ))}
            </div>

            <div className="modal-buttons">
              <button className="modal-save-btn" onClick={handleSave}>✓ Save</button>
              <button className="modal-cancel-btn" onClick={() => setEditingSlot(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ── */}
      {deleteStep > 0 && (
        <div className="players-overlay">
          <div className="players-modal">
            {deleteStep === 1 && (
              <>
                <div className="delete-icon">⚠️</div>
                <h2 className="modal-title">Remove Player?</h2>
                <p className="delete-explanation">
                  This will permanently delete <strong>{users[deleteConfirmSlot]?.name}</strong> and all their scores and progress.
                  <br /><br />
                  This cannot be undone!
                </p>
                <div className="modal-buttons">
                  <button className="modal-delete-btn" onClick={() => setDeleteStep(2)}>
                    👀 Show me what's lost
                  </button>
                  <button className="modal-cancel-btn" onClick={() => { setDeleteStep(0); setDeleteConfirmSlot(null); }}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <div className="delete-icon">🗑️</div>
                <h2 className="modal-title">Everything will be deleted:</h2>
                <div className="delete-preview">
                  <div className="delete-preview-item">⭐ All stars → 0</div>
                  <div className="delete-preview-item">🥉 All bronze → 0</div>
                  <div className="delete-preview-item">🥈 All silver → 0</div>
                  <div className="delete-preview-item">👑 All champion → 0</div>
                  <div className="delete-preview-item">📚 All learning progress → gone</div>
                  <div className="delete-preview-item">🔤 All alphabet progress → gone</div>
                </div>
                <div className="modal-buttons">
                  <button className="modal-delete-confirm-btn" onClick={handleDeleteConfirm}>
                    Yes, Remove Player
                  </button>
                  <button className="modal-cancel-btn" onClick={() => { setDeleteStep(0); setDeleteConfirmSlot(null); }}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PlayersScreen;