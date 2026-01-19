// scoreDatabase.js - IndexedDB Score Tracking System

const DB_NAME = 'PreschoolerSpellerDB';
const DB_VERSION = 1;

class ScoreDatabase {
  constructor() {
    this.db = null;
  }

  // Initialize database
  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Alphabet Scores Store (A-Z letter tracking)
        if (!db.objectStoreNames.contains('alphabetScores')) {
          const alphabetStore = db.createObjectStore('alphabetScores', { keyPath: 'letter' });
          alphabetStore.createIndex('accuracy', 'accuracy', { unique: false });
          alphabetStore.createIndex('lastPracticed', 'lastPracticed', { unique: false });
        }

        // Learning Scores Store (Body parts, etc.)
        if (!db.objectStoreNames.contains('learningScores')) {
          const learningStore = db.createObjectStore('learningScores', { keyPath: 'topic' });
          learningStore.createIndex('accuracy', 'accuracy', { unique: false });
        }

        // Overall Progress Store
        if (!db.objectStoreNames.contains('overallProgress')) {
          db.createObjectStore('overallProgress', { keyPath: 'id' });
        }

        // Rewards Store
        if (!db.objectStoreNames.contains('rewards')) {
          db.createObjectStore('rewards', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  // === ALPHABET SCORES ===

  // Record alphabet attempt (correct or incorrect)
  async recordAlphabetAttempt(letter, isCorrect) {
    const store = this.db.transaction(['alphabetScores'], 'readwrite').objectStore('alphabetScores');
    
    // Get existing score or create new
    const existing = await this.getRecord(store, letter);
    
    const updatedScore = {
      letter: letter.toUpperCase(),
      correctAttempts: (existing?.correctAttempts || 0) + (isCorrect ? 1 : 0),
      totalAttempts: (existing?.totalAttempts || 0) + 1,
      currentStreak: isCorrect ? (existing?.currentStreak || 0) + 1 : 0,
      bestStreak: existing?.bestStreak || 0,
      lastPracticed: new Date().toISOString(),
      timesPressed: (existing?.timesPressed || 0) + 1
    };

    // Update best streak
    if (updatedScore.currentStreak > updatedScore.bestStreak) {
      updatedScore.bestStreak = updatedScore.currentStreak;
    }

    // Calculate accuracy
    updatedScore.accuracy = Math.round((updatedScore.correctAttempts / updatedScore.totalAttempts) * 100);

    await this.putRecord(store, updatedScore);
    
    // Check for rewards
    await this.checkRewards('alphabet', updatedScore.correctAttempts);
    
    return updatedScore;
  }

  // Get alphabet letter score
  async getAlphabetScore(letter) {
    const store = this.db.transaction(['alphabetScores'], 'readonly').objectStore('alphabetScores');
    return await this.getRecord(store, letter.toUpperCase());
  }

  // Get all alphabet scores
  async getAllAlphabetScores() {
    const store = this.db.transaction(['alphabetScores'], 'readonly').objectStore('alphabetScores');
    return await this.getAllRecords(store);
  }

  // === LEARNING SCORES (Body Parts) ===

  async recordLearningAttempt(topic, isCorrect) {
    const store = this.db.transaction(['learningScores'], 'readwrite').objectStore('learningScores');
    
    const existing = await this.getRecord(store, topic);
    
    const updatedScore = {
      topic: topic,
      correctAttempts: (existing?.correctAttempts || 0) + (isCorrect ? 1 : 0),
      totalAttempts: (existing?.totalAttempts || 0) + 1,
      currentStreak: isCorrect ? (existing?.currentStreak || 0) + 1 : 0,
      bestStreak: existing?.bestStreak || 0,
      lastPracticed: new Date().toISOString(),
      grammarViews: existing?.grammarViews || 0,
      perfectScores: existing?.perfectScores || 0
    };

    if (updatedScore.currentStreak > updatedScore.bestStreak) {
      updatedScore.bestStreak = updatedScore.currentStreak;
    }

    updatedScore.accuracy = Math.round((updatedScore.correctAttempts / updatedScore.totalAttempts) * 100);

    await this.putRecord(store, updatedScore);
    await this.checkRewards('learning', updatedScore.correctAttempts);
    
    return updatedScore;
  }

  // Record perfect score in learning section
  async recordPerfectScore(topic) {
    const store = this.db.transaction(['learningScores'], 'readwrite').objectStore('learningScores');
    const existing = await this.getRecord(store, topic);
    
    if (existing) {
      existing.perfectScores = (existing.perfectScores || 0) + 1;
      await this.putRecord(store, existing);
    }
  }

  // Record grammar rule view
  async recordGrammarView(topic) {
    const store = this.db.transaction(['learningScores'], 'readwrite').objectStore('learningScores');
    const existing = await this.getRecord(store, topic);
    
    if (existing) {
      existing.grammarViews = (existing.grammarViews || 0) + 1;
      await this.putRecord(store, existing);
    }
  }

  // === OVERALL PROGRESS ===

  async getOverallProgress() {
    const store = this.db.transaction(['overallProgress'], 'readonly').objectStore('overallProgress');
    const progress = await this.getRecord(store, 'main');
    
    return progress || {
      id: 'main',
      totalStars: 0,
      bronzeMedals: 0,
      silverTrophies: 0,
      goldCrowns: 0,
      currentStreak: 0,
      lastActiveDate: null,
      totalCorrect: 0,
      totalAttempts: 0
    };
  }

  async updateOverallProgress(updates) {
    const store = this.db.transaction(['overallProgress'], 'readwrite').objectStore('overallProgress');
    const existing = await this.getOverallProgress();
    const updated = { ...existing, ...updates };
    await this.putRecord(store, updated);
    return updated;
  }

  // === REWARDS SYSTEM ===

  async checkRewards(category, correctCount) {
    const rewards = [];
    
    // Check milestones
    if (correctCount % 5 === 0 && correctCount > 0) {
      rewards.push({ type: 'star', level: 'minor', count: 1 });
      await this.addReward('star', 1);
    }
    
    if (correctCount % 10 === 0 && correctCount > 0) {
      rewards.push({ type: 'bronze', level: 'medium', count: 1 });
      await this.addReward('bronze', 1);
    }
    
    if (correctCount % 20 === 0 && correctCount > 0) {
      rewards.push({ type: 'silver', level: 'milestone', count: 1 });
      await this.addReward('silver', 1);
    }
    
    return rewards;
  }

  async addReward(type, count = 1) {
    const progress = await this.getOverallProgress();
    
    const updates = {};
    if (type === 'star') updates.totalStars = (progress.totalStars || 0) + count;
    if (type === 'bronze') updates.bronzeMedals = (progress.bronzeMedals || 0) + count;
    if (type === 'silver') updates.silverTrophies = (progress.silverTrophies || 0) + count;
    if (type === 'gold') updates.goldCrowns = (progress.goldCrowns || 0) + count;
    
    await this.updateOverallProgress(updates);
    
    // Record in rewards table for "new" tracking
    const rewardStore = this.db.transaction(['rewards'], 'readwrite').objectStore('rewards');
    await this.putRecord(rewardStore, {
      type,
      count,
      earnedDate: new Date().toISOString(),
      isNew: true
    });
  }

  async getRecentRewards(hours = 24) {
    const store = this.db.transaction(['rewards'], 'readonly').objectStore('rewards');
    const allRewards = await this.getAllRecords(store);
    
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    
    return allRewards.filter(r => new Date(r.earnedDate) > cutoffDate && r.isNew);
  }

  async markRewardsAsSeen() {
    const store = this.db.transaction(['rewards'], 'readwrite').objectStore('rewards');
    const allRewards = await this.getAllRecords(store);
    
    for (const reward of allRewards) {
      if (reward.isNew) {
        reward.isNew = false;
        await this.putRecord(store, reward);
      }
    }
  }

  // === HELPER METHODS ===

  getRecord(store, key) {
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  putRecord(store, record) {
    return new Promise((resolve, reject) => {
      const request = store.put(record);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  getAllRecords(store) {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // === RESET (for testing) ===

  async resetAllData() {
    const stores = ['alphabetScores', 'learningScores', 'overallProgress', 'rewards'];
    for (const storeName of stores) {
      const store = this.db.transaction([storeName], 'readwrite').objectStore(storeName);
      await new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
}

// Create singleton instance
const scoreDB = new ScoreDatabase();

export default scoreDB;