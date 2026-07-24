/* VibeFlow - Pomodoro Focus Timer Logic */

export class VibeTimer {
  constructor(callbacks = {}) {
    this.durations = {
      focus: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60
    };
    this.currentMode = 'focus';
    this.timeLeft = this.durations.focus;
    this.isRunning = false;
    this.intervalId = null;

    this.onTick = callbacks.onTick || (() => {});
    this.onStateChange = callbacks.onStateChange || (() => {});
    this.onComplete = callbacks.onComplete || (() => {});
  }

  setMode(mode) {
    if (!this.durations[mode]) return;
    this.pause();
    this.currentMode = mode;
    this.timeLeft = this.durations[mode];
    this.onStateChange({ mode: this.currentMode, isRunning: false, timeLeft: this.timeLeft });
    this.onTick(this.getFormattedTime());
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.onStateChange({ mode: this.currentMode, isRunning: true, timeLeft: this.timeLeft });

    this.intervalId = setInterval(() => {
      this.timeLeft--;
      this.onTick(this.getFormattedTime());

      if (this.timeLeft <= 0) {
        this.pause();
        this.onComplete(this.currentMode);
        this.reset();
      }
    }, 1000);
  }

  pause() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.onStateChange({ mode: this.currentMode, isRunning: false, timeLeft: this.timeLeft });
  }

  toggle() {
    if (this.isRunning) this.pause();
    else this.start();
  }

  reset() {
    this.pause();
    this.timeLeft = this.durations[this.currentMode];
    this.onTick(this.getFormattedTime());
  }

  getFormattedTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}
