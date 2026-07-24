/* VibeFlow - LocalStorage Data Manager */

const STORAGE_KEYS = {
  TASKS: 'vibeflow_tasks_v1',
  THEME: 'vibeflow_theme_v1',
  STATS: 'vibeflow_stats_v1',
  SETTINGS: 'vibeflow_settings_v1'
};

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: '30-min Deep Work Session (Focus Flow)',
    priority: 'focus',
    category: 'Work',
    completed: false,
    subtasks: [
      { id: 'sub-1', text: 'Clear notifications', completed: true },
      { id: 'sub-2', text: 'Start ambient soundscape', completed: false }
    ],
    createdAt: Date.now()
  },
  {
    id: 'task-2',
    title: 'Design Synthwave UI Components',
    priority: 'rush',
    category: 'Creative',
    completed: false,
    subtasks: [],
    createdAt: Date.now() - 3600000
  },
  {
    id: 'task-3',
    title: 'Sip Matcha Tea & Reflect on Weekly Goals',
    priority: 'chill',
    category: 'Personal',
    completed: true,
    subtasks: [],
    createdAt: Date.now() - 7200000
  }
];

const DEFAULT_STATS = {
  tasksCompleted: 1,
  streakDays: 3,
  focusMinutesLogged: 45,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

export class VibeStorage {
  static getTasks() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) {
        this.saveTasks(DEFAULT_TASKS);
        return DEFAULT_TASKS;
      }
      return JSON.parse(data);
    } catch (e) {
      console.error('Failed to load tasks from LocalStorage', e);
      return DEFAULT_TASKS;
    }
  }

  static saveTasks(tasks) {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks', e);
    }
  }

  static getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'synthwave';
  }

  static saveTheme(themeName) {
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);
  }

  static getStats() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STATS);
      if (!data) {
        this.saveStats(DEFAULT_STATS);
        return DEFAULT_STATS;
      }
      const stats = JSON.parse(data);
      this.checkStreak(stats);
      return stats;
    } catch (e) {
      return DEFAULT_STATS;
    }
  }

  static saveStats(stats) {
    localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
  }

  static checkStreak(stats) {
    const today = new Date().toISOString().split('T')[0];
    if (stats.lastActiveDate !== today) {
      const last = new Date(stats.lastActiveDate);
      const now = new Date(today);
      const diffTime = Math.abs(now - last);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 1) {
        stats.streakDays = 1;
      } else {
        stats.streakDays += 1;
      }
      stats.lastActiveDate = today;
      this.saveStats(stats);
    }
  }

  static incrementCompletedCount() {
    const stats = this.getStats();
    stats.tasksCompleted += 1;
    this.saveStats(stats);
    return stats;
  }

  static addFocusMinutes(mins) {
    const stats = this.getStats();
    stats.focusMinutesLogged += mins;
    this.saveStats(stats);
    return stats;
  }
}
