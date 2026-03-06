// UserManager.js - Manages up to 5 user profiles

const USERS_KEY = 'preschoolerSpeller_users';
const ACTIVE_USER_KEY = 'preschoolerSpeller_activeUser';

const DEFAULT_PLAYER_1 = {
  id: 'user_1',
  name: 'Player 1',
  avatar: '🌟',
  color: '#FF6B6B',
  createdAt: new Date().toISOString(),
  isDefault: true
};

export const AVATARS = ['🌟','🦁','🐼','🦊','🐸','🐨','🦄','🐯','🐙','🐶','🐱','🐻'];
export const COLORS = [
  '#FF6B6B', // coral red
  '#4ECDC4', // teal
  '#45B7D1', // sky blue
  '#96CEB4', // sage green
  '#FFEAA7', // yellow
  '#DDA0DD', // plum
  '#98D8C8', // mint
  '#F7DC6F', // gold
  '#BB8FCE', // purple
  '#85C1E9', // light blue
];

// Initialize users — always ensure slot 0 (Player 1) exists
export const initUsers = () => {
  try {
    const saved = localStorage.getItem(USERS_KEY);
    if (saved) {
      const users = JSON.parse(saved);
      // Ensure array is always length 5
      while (users.length < 5) users.push(null);
      return users.slice(0, 5);
    }
  } catch (e) {
    console.error('Error loading users:', e);
  }

  // First time — create default Player 1 in slot 0
  const users = [DEFAULT_PLAYER_1, null, null, null, null];
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return users;
};

export const saveUsers = (users) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error saving users:', e);
  }
};

export const getActiveUserId = () => {
  return localStorage.getItem(ACTIVE_USER_KEY) || 'user_1';
};

export const setActiveUserId = (userId) => {
  localStorage.setItem(ACTIVE_USER_KEY, userId);
};

export const createUser = (users, slotIndex, name, avatar, color) => {
  const newUser = {
    id: `user_${Date.now()}`,
    name: name.trim().slice(0, 12),
    avatar,
    color,
    createdAt: new Date().toISOString(),
    isDefault: false
  };
  const updated = [...users];
  updated[slotIndex] = newUser;
  saveUsers(updated);
  return updated;
};

export const deleteUser = (users, slotIndex) => {
  const updated = [...users];
  // Clear all data for this user
  const user = updated[slotIndex];
  if (user) {
    clearUserData(user.id);
  }
  updated[slotIndex] = null;
  saveUsers(updated);
  return updated;
};

export const clearUserData = (userId) => {
  // Clear all localStorage keys for this user
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${userId}_`)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
};

export const getUserStorageKey = (userId, key) => `${userId}_${key}`;