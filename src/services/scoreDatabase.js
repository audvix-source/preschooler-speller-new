// scoreDatabase.js - IndexedDB Score Tracking System with Per-User Support

const DB_NAME = 'PreschoolerSpellerDB';
const DB_VERSION = 2;

class ScoreDatabase {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;

        // Handle connection being closed externally
        this.db.onclose = () => {
          console.warn('IndexedDB connection closed, will reinitialize on next call');
          this.db = null;
        };

        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Drop old stores if upgrading from v1
        const oldStores = ['alphabetScores', 'learningScores', 'overallProgress', 'rewards'];
        oldStores.forEach(name => {
          if (db.objectStoreNames.contains(name)) {
            db.deleteObjectStore(name);
          }
        });

        // New stores use compound keys with userId
        const alphabetStore = db.createObjectStore('alphabetScores', { keyPath: ['userId', 'letter'] });
        alphabetStore.createIndex('byUser', 'userId', { unique: false });

        const learningStore = db.createObjectStore('learningScores', { keyPath: ['userId', 'topic'] });
        learningStore.createIndex('byUser', 'userId', { unique: false });

        const progressStore = db.createObjectStore('overallProgress', { keyPath: ['userId', 'id'] });
        progressStore.createIndex('byUser', 'userId', { unique: false });

        const rewardsStore = db.createObjectStore('rewards', { keyPath: 'id', autoIncrement: true });
        rewardsStore.createIndex('byUser', 'userId', { unique: false });
      };
    });
  }

  async ensureDB() {
    if (!this.db) await this.init();
  }

  // ═══════════════════════════════════════
  // ALPHABET SCORES
  // ═══════════════════════════════════════

  async recordAlphabetAttempt(letter, isCorrect, userId = 'user_1') {
    await this.ensureDB();
    const transaction = this.db.transaction(['alphabetScores', 'overallProgress', 'rewards'], 'readwrite');
    const store = transaction.objectStore('alphabetScores');

    const existing = await this.getRecord(store, [userId, letter.toUpperCase()]);

    const updatedScore = {
      userId,
      letter: letter.toUpperCase(),
      correctAttempts: (existing?.correctAttempts || 0) + (isCorrect ? 1 : 0),
      totalAttempts: (existing?.totalAttempts || 0) + 1,
      currentStreak: isCorrect ? (existing?.currentStreak || 0) + 1 : 0,
      bestStreak: existing?.bestStreak || 0,
      lastPracticed: new Date().toISOString(),
      timesPressed: (existing?.timesPressed || 0) + 1
    };

    if (updatedScore.currentStreak > updatedScore.bestStreak) {
      updatedScore.bestStreak = updatedScore.currentStreak;
    }

    updatedScore.accuracy = Math.round((updatedScore.correctAttempts / updatedScore.totalAttempts) * 100);

    await this.putRecord(store, updatedScore);
    await this.checkRewardsInTransaction(transaction, userId, 'alphabet', updatedScore.correctAttempts);

    return updatedScore;
  }

  async getAlphabetScore(letter, userId = 'user_1') {
    await this.ensureDB();
    const store = this.db.transaction(['alphabetScores'], 'readonly').objectStore('alphabetScores');
    return await this.getRecord(store, [userId, letter.toUpperCase()]);
  }

  async getAllAlphabetScores(userId = 'user_1') {
    await this.ensureDB();
    const store = this.db.transaction(['alphabetScores'], 'readonly').objectStore('alphabetScores');
    const index = store.index('byUser');
    return await this.getRecordsByIndex(index, userId);
  }

  // ═══════════════════════════════════════
  // LEARNING SCORES
  // ═══════════════════════════════════════

  async recordLearningAttempt(topic, isCorrect, userId = 'user_1') {
    await this.ensureDB();
    const transaction = this.db.transaction(['learningScores', 'overallProgress', 'rewards'], 'readwrite');
    const store = transaction.objectStore('learningScores');

    const existing = await this.getRecord(store, [userId, topic]);

    const updatedScore = {
      userId,
      topic,
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
    await this.checkRewardsInTransaction(transaction, userId, 'learning', updatedScore.correctAttempts, topic, updatedScore.accuracy);

    return updatedScore;
  }

  async recordPerfectScore(topic, userId = 'user_1') {
    await this.ensureDB();
    const store = this.db.transaction(['learningScores'], 'readwrite').objectStore('learningScores');
    const existing = await this.getRecord(store, [userId, topic]);

    if (existing) {
      existing.perfectScores = (existing.perfectScores || 0) + 1;
      await this.putRecord(store, existing);
    }
  }

  async recordGrammarView(topic, userId = 'user_1') {
    await this.ensureDB();
    const store = this.db.transaction(['learningScores'], 'readwrite').objectStore('learningScores');
    const existing = await this.getRecord(store, [userId, topic]);

    if (existing) {
      existing.grammarViews = (existing.grammarViews || 0) + 1;
      await this.putRecord(store, existing);
    }
  }

  // ═══════════════════════════════════════
  // OVERALL PROGRESS
  // ═══════════════════════════════════════

  async getOverallProgress(userId = 'user_1') {
    await this.ensureDB();
    try {
      const transaction = this.db.transaction(['overallProgress', 'learningScores'], 'readonly');
      const progressStore = transaction.objectStore('overallProgress');
      const learningStore = transaction.objectStore('learningScores');

      const progress = await this.getRecord(progressStore, [userId, 'main']);
      const learningIndex = learningStore.index('byUser');
      const allLearningScores = await this.getRecordsByIndex(learningIndex, userId);

      let totalCorrect = 0;
      let totalAttempts = 0;

      allLearningScores.forEach(score => {
        totalCorrect += score.correctAttempts || 0;
        totalAttempts += score.totalAttempts || 0;
      });

      const baseProgress = progress || {
        userId,
        id: 'main',
        stars: 0,
        bronze: 0,
        silver: 0,
        champion: 0,
        dayStreak: 0,
        lastActiveDate: null
      };

      return {
        ...baseProgress,
        totalCorrect,
        totalAttempts,
        wordStats: allLearningScores.map(score => ({
          word: score.topic,
          correctAttempts: score.correctAttempts || 0,
          totalAttempts: score.totalAttempts || 0,
          perfectCount: score.perfectScores || 0,
          accuracy: score.accuracy || 0
        }))
      };
    } catch (error) {
      console.error('Error getting overall progress:', error);
      return {
        userId,
        id: 'main',
        stars: 0, bronze: 0, silver: 0, champion: 0,
        dayStreak: 0, totalCorrect: 0, totalAttempts: 0,
        wordStats: []
      };
    }
  }

  // ═══════════════════════════════════════
  // REWARDS
  // ═══════════════════════════════════════

  async checkRewardsInTransaction(transaction, userId = 'user_1', category, correctCount, topicName = null, accuracy = null) {
    const progressStore = transaction.objectStore('overallProgress');
    const rewardStore = transaction.objectStore('rewards');

    const progress = await this.getRecord(progressStore, [userId, 'main']) || {
      userId,
      id: 'main',
      stars: 0, bronze: 0, silver: 0, champion: 0
    };

    const rewards = [];

    if (correctCount % 5 === 0 && correctCount > 0) {
      rewards.push({ type: 'star' });
      progress.stars = (progress.stars || 0) + 1;
    }
    if (correctCount % 10 === 0 && correctCount > 0) {
      rewards.push({ type: 'bronze' });
      progress.bronze = (progress.bronze || 0) + 1;
    }
    if (correctCount % 20 === 0 && correctCount > 0) {
      rewards.push({ type: 'silver' });
      progress.silver = (progress.silver || 0) + 1;
    }
    if (correctCount % 50 === 0 && correctCount > 0) {
      rewards.push({ type: 'champion' });
      progress.champion = (progress.champion || 0) + 1;
    }

    if (rewards.length > 0) {
      await this.putRecord(progressStore, progress);
      for (const reward of rewards) {
        await this.putRecord(rewardStore, {
          userId,
          type: reward.type,
          count: 1,
          earnedDate: new Date().toISOString(),
          bodyPart: topicName || 'Unknown',
          accuracy: accuracy || 0,
          isNew: true
        });
      }
    }

    return rewards;
  }

  async getRewardsByType(type, userId = 'user_1') {
    await this.ensureDB();
    const store = this.db.transaction(['rewards'], 'readonly').objectStore('rewards');
    const index = store.index('byUser');
    const allRewards = await this.getRecordsByIndex(index, userId);
    return allRewards
      .filter(r => r.type === type)
      .sort((a, b) => new Date(b.earnedDate) - new Date(a.earnedDate));
  }

  async getRecentRewards(hours = 24, userId = 'user_1') {
    await this.ensureDB();
    const store = this.db.transaction(['rewards'], 'readonly').objectStore('rewards');
    const index = store.index('byUser');
    const allRewards = await this.getRecordsByIndex(index, userId);
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - hours);
    return allRewards.filter(r => new Date(r.earnedDate) > cutoffDate && r.isNew);
  }

  async markRewardsAsSeen(userId = 'user_1') {
    await this.ensureDB();
    const store = this.db.transaction(['rewards'], 'readwrite').objectStore('rewards');
    const index = store.index('byUser');
    const allRewards = await this.getRecordsByIndex(index, userId);
    for (const reward of allRewards) {
      if (reward.isNew) {
        reward.isNew = false;
        await this.putRecord(store, reward);
      }
    }
  }

  // ═══════════════════════════════════════
  // RESET
  // ═══════════════════════════════════════

  async resetAllData(userId = 'user_1') {
    await this.ensureDB();
    const storeNames = ['alphabetScores', 'learningScores', 'overallProgress'];
    for (const storeName of storeNames) {
      const store = this.db.transaction([storeName], 'readwrite').objectStore(storeName);
      const index = store.index('byUser');
      const records = await this.getRecordsByIndex(index, userId);
      for (const record of records) {
        const key = [userId, record.letter || record.topic || record.id];
        await new Promise((resolve, reject) => {
          const req = store.delete(key);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      }
    }
    // Clear rewards separately (autoIncrement key)
    const rewardStore = this.db.transaction(['rewards'], 'readwrite').objectStore('rewards');
    const rewardIndex = rewardStore.index('byUser');
    const rewards = await this.getRecordsByIndex(rewardIndex, userId);
    for (const reward of rewards) {
      await new Promise((resolve, reject) => {
        const req = rewardStore.delete(reward.id);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    }
  }

  // ═══════════════════════════════════════
  // HELPER METHODS
  // ═══════════════════════════════════════

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

  getRecordsByIndex(index, value) {
    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

const scoreDB = new ScoreDatabase();
export default scoreDB;