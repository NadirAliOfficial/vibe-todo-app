/* VibeFlow - Main Application Logic */

import { VibeCanvasEngine } from './particles.js';
import { vibeAudio } from './audio.js';
import { VibeStorage } from './storage.js';
import { VibeTimer } from './timer.js';

class VibeApp {
  constructor() {
    this.canvasEngine = null;
    this.timer = null;
    this.tasks = [];
    this.currentFilter = 'all';
    this.currentCategory = null;
    this.editingTaskId = null;

    this.affirmations = [
      `"Focus on being productive instead of busy. Protect your flow state."`,
      `"Small daily progress creates extraordinary aesthetic results."`,
      `"Breathe in clarity, exhale distraction. Dive deep into the work."`,
      `"Your environment dictates your mind. Enjoy the ambient vibe."`,
      `"Deep focus is a quiet superpower. Build one feature at a time."`
    ];

    this.init();
  }

  init() {
    // 1. Initialize Canvas Background Engine
    this.canvasEngine = new VibeCanvasEngine('bgCanvas');

    // 2. Load Stored Theme & Apply
    const savedTheme = VibeStorage.getTheme();
    this.applyTheme(savedTheme);

    // 3. Load Tasks & Stats
    this.tasks = VibeStorage.getTasks();
    this.updateStatsUI();

    // 4. Initialize Focus Timer
    this.timer = new VibeTimer({
      onTick: (formattedTime) => {
        document.getElementById('timerDisplay').textContent = formattedTime;
      },
      onStateChange: ({ isRunning }) => {
        const btn = document.getElementById('btnTimerToggle');
        btn.textContent = isRunning ? 'Pause Focus' : 'Start Focus';
      },
      onComplete: (mode) => {
        vibeAudio.playTimerEndSound();
        if (mode === 'focus') {
          VibeStorage.addFocusMinutes(25);
          this.updateStatsUI();
        }
      }
    });

    // 5. Setup DOM Event Listeners
    this.setupEventListeners();

    // 6. Render Initial Task List
    this.renderTasks();

    // 7. Random Affirmation
    this.setRandomAffirmation();
  }

  applyTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    this.canvasEngine.setTheme(themeName);
    VibeStorage.saveTheme(themeName);

    // Update active button state in header
    document.querySelectorAll('.vibe-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.vibe === themeName);
    });
  }

  setRandomAffirmation() {
    const text = this.affirmations[Math.floor(Math.random() * this.affirmations.length)];
    const el = document.getElementById('affirmationCard');
    if (el) el.textContent = text;
  }

  setupEventListeners() {
    // Theme Selector
    document.getElementById('vibeSelector').addEventListener('click', (e) => {
      const btn = e.target.closest('.vibe-btn');
      if (btn && btn.dataset.vibe) {
        vibeAudio.ensureContext();
        this.applyTheme(btn.dataset.vibe);
      }
    });

    // Navigation Filters
    document.querySelectorAll('.app-sidebar .nav-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.app-sidebar .nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (btn.dataset.filter) {
          this.currentFilter = btn.dataset.filter;
          this.currentCategory = null;
        } else if (btn.dataset.category) {
          this.currentFilter = 'category';
          this.currentCategory = btn.dataset.category;
        }

        this.renderTasks();
      });
    });

    // Add Task Button & Keydown
    const taskInput = document.getElementById('taskInput');
    const btnAddTask = document.getElementById('btnAddTask');

    const handleAddTask = () => {
      const title = taskInput.value.trim();
      if (!title) return;

      const priority = document.getElementById('prioritySelect').value;
      const category = document.getElementById('categorySelect').value;

      const newTask = {
        id: `task-${Date.now()}`,
        title,
        priority,
        category,
        completed: false,
        subtasks: [],
        createdAt: Date.now()
      };

      this.tasks.unshift(newTask);
      VibeStorage.saveTasks(this.tasks);
      taskInput.value = '';
      this.renderTasks();
    };

    btnAddTask.addEventListener('click', handleAddTask);
    taskInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleAddTask();
    });

    // Timer Buttons
    document.getElementById('btnTimerToggle').addEventListener('click', () => {
      vibeAudio.ensureContext();
      this.timer.toggle();
    });

    document.getElementById('btnTimerReset').addEventListener('click', () => {
      this.timer.reset();
    });

    document.getElementById('timerModes').addEventListener('click', (e) => {
      const btn = e.target.closest('.timer-mode-btn');
      if (btn && btn.dataset.mode) {
        document.querySelectorAll('.timer-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.timer.setMode(btn.dataset.mode);
      }
    });

    // Audio Widget Listeners
    document.querySelectorAll('.track-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const track = btn.dataset.track;
        const isPlaying = btn.classList.contains('active');

        if (isPlaying) {
          btn.classList.remove('active');
          btn.textContent = '▶';
          vibeAudio.toggleTrack(track, false);
        } else {
          btn.classList.add('active');
          btn.textContent = '⏸';
          vibeAudio.toggleTrack(track, true);
        }
      });
    });

    document.querySelectorAll('.volume-slider').forEach((slider) => {
      slider.addEventListener('input', (e) => {
        const track = e.target.dataset.track;
        const val = parseFloat(e.target.value);
        vibeAudio.setVolume(track, val);
      });
    });

    // Modal Handlers
    document.getElementById('btnCloseModal').addEventListener('click', () => this.closeModal());
    document.getElementById('btnSaveModal').addEventListener('click', () => this.saveModalChanges());
    document.getElementById('btnAddSubtask').addEventListener('click', () => this.addSubtaskFromModal());
    document.getElementById('subtaskInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.addSubtaskFromModal();
    });
  }

  renderTasks() {
    const listContainer = document.getElementById('taskList');
    listContainer.innerHTML = '';

    // Filter Tasks
    let filtered = this.tasks.filter((t) => {
      if (this.currentFilter === 'active') return !t.completed;
      if (this.currentFilter === 'completed') return t.completed;
      if (this.currentFilter === 'priority-rush') return t.priority === 'rush';
      if (this.currentFilter === 'category') return t.category === this.currentCategory;
      return true;
    });

    // Update Header Text
    const titleEl = document.getElementById('currentViewTitle');
    if (this.currentFilter === 'category') titleEl.textContent = `${this.currentCategory} Tasks`;
    else titleEl.textContent = this.currentFilter.charAt(0).toUpperCase() + this.currentFilter.slice(1) + ' Tasks';

    // Update Nav Count Badges
    document.getElementById('countAll').textContent = this.tasks.length;
    document.getElementById('countActive').textContent = this.tasks.filter(t => !t.completed).length;
    document.getElementById('countCompleted').textContent = this.tasks.filter(t => t.completed).length;
    document.getElementById('countRush').textContent = this.tasks.filter(t => t.priority === 'rush').length;

    if (filtered.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--text-dim);">
          <p>No tasks found in this view. Enjoy the ambient stillness.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((task) => {
      const card = document.createElement('div');
      card.className = `task-card ${task.completed ? 'completed' : ''}`;
      card.dataset.id = task.id;

      const subtaskDone = task.subtasks.filter(s => s.completed).length;
      const subtaskMeta = task.subtasks.length > 0 ? `<span>${subtaskDone}/${task.subtasks.length} subtasks</span>` : '';

      card.innerHTML = `
        <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
        <div class="task-body">
          <div class="task-title">${this.escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="priority-badge priority-${task.priority}">${task.priority.toUpperCase()}</span>
            <span class="tag-badge">${task.category}</span>
            ${subtaskMeta}
          </div>
        </div>
        <div class="task-actions">
          <button class="action-btn edit" title="Edit Subtasks">Edit</button>
          <button class="action-btn delete" title="Delete Task">Delete</button>
        </div>
      `;

      // Task Checkbox Event
      const checkbox = card.querySelector('.task-checkbox');
      checkbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        task.completed = isChecked;

        if (isChecked) {
          card.classList.add('completed');
          vibeAudio.playCompletionChime();

          // Trigger particle burst at checkbox coordinates
          const rect = checkbox.getBoundingClientRect();
          this.canvasEngine.triggerBurst(rect.left + 10, rect.top + 10);

          VibeStorage.incrementCompletedCount();
          this.updateStatsUI();
        } else {
          card.classList.remove('completed');
        }

        VibeStorage.saveTasks(this.tasks);
        this.renderTasks();
      });

      // Task Edit Event
      card.querySelector('.action-btn.edit').addEventListener('click', () => {
        this.openModal(task.id);
      });

      // Task Delete Event
      card.querySelector('.action-btn.delete').addEventListener('click', () => {
        this.tasks = this.tasks.filter(t => t.id !== task.id);
        VibeStorage.saveTasks(this.tasks);
        this.renderTasks();
      });

      listContainer.appendChild(card);
    });
  }

  openModal(taskId) {
    this.editingTaskId = taskId;
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) return;

    document.getElementById('editTaskTitle').value = task.title;
    this.renderSubtasksModal(task);
    document.getElementById('taskModal').classList.add('active');
  }

  closeModal() {
    document.getElementById('taskModal').classList.remove('active');
    this.editingTaskId = null;
  }

  renderSubtasksModal(task) {
    const container = document.getElementById('subtaskList');
    container.innerHTML = '';

    if (task.subtasks.length === 0) {
      container.innerHTML = '<div style="font-size: 0.82rem; color: var(--text-dim);">No subtasks added yet.</div>';
      return;
    }

    task.subtasks.forEach((sub) => {
      const item = document.createElement('div');
      item.style.display = 'flex';
      item.style.alignItems = 'center';
      item.style.gap = '10px';

      item.innerHTML = `
        <input type="checkbox" ${sub.completed ? 'checked' : ''} style="accent-color: var(--accent-primary);">
        <span style="flex:1; font-size: 0.88rem; ${sub.completed ? 'text-decoration: line-through; color: var(--text-dim);' : ''}">${this.escapeHtml(sub.text)}</span>
        <button class="action-btn delete" style="padding: 2px 6px;">&times;</button>
      `;

      item.querySelector('input').addEventListener('change', (e) => {
        sub.completed = e.target.checked;
        this.renderSubtasksModal(task);
      });

      item.querySelector('.action-btn.delete').addEventListener('click', () => {
        task.subtasks = task.subtasks.filter(s => s.id !== sub.id);
        this.renderSubtasksModal(task);
      });

      container.appendChild(item);
    });
  }

  addSubtaskFromModal() {
    if (!this.editingTaskId) return;
    const task = this.tasks.find(t => t.id === this.editingTaskId);
    const input = document.getElementById('subtaskInput');
    const text = input.value.trim();
    if (!text || !task) return;

    task.subtasks.push({
      id: `sub-${Date.now()}`,
      text,
      completed: false
    });

    input.value = '';
    this.renderSubtasksModal(task);
  }

  saveModalChanges() {
    if (!this.editingTaskId) return;
    const task = this.tasks.find(t => t.id === this.editingTaskId);
    if (task) {
      task.title = document.getElementById('editTaskTitle').value.trim() || task.title;
      VibeStorage.saveTasks(this.tasks);
      this.renderTasks();
    }
    this.closeModal();
  }

  updateStatsUI() {
    const stats = VibeStorage.getStats();
    document.getElementById('streakVal').textContent = `${stats.streakDays} Days`;
    document.getElementById('focusVal').textContent = `${stats.focusMinutesLogged}m`;

    const activeCount = this.tasks.filter(t => !t.completed).length;
    const completedCount = this.tasks.filter(t => t.completed).length;
    const total = activeCount + completedCount;

    const percentage = total > 0 ? Math.round((completedCount / total) * 100) : 100;
    document.getElementById('flowVal').textContent = `${percentage}%`;
    document.getElementById('flowBar').style.width = `${percentage}%`;
  }

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }
}

// Start VibeFlow App when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.vibeApp = new VibeApp();
});
