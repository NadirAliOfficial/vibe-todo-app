/* VibeFlow - Dynamic Canvas Visualizer & Particle System */

export class VibeCanvasEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.theme = 'synthwave';
    this.particles = [];
    this.burstParticles = [];
    this.gridOffset = 0;
    this.width = 0;
    this.height = 0;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.createThemeParticles();
    this.loop();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    this.createThemeParticles();
  }

  setTheme(themeName) {
    this.theme = themeName;
    this.createThemeParticles();
  }

  createThemeParticles() {
    this.particles = [];
    const count = Math.min(Math.floor(this.width / 18), 80);

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5 - 0.2,
        opacity: Math.random() * 0.7 + 0.3,
        color: this.getParticleColor()
      });
    }
  }

  getParticleColor() {
    switch (this.theme) {
      case 'synthwave': return Math.random() > 0.5 ? '#ff2a85' : '#00f0ff';
      case 'lofi': return Math.random() > 0.5 ? '#ffab40' : '#e76f51';
      case 'zen': return Math.random() > 0.5 ? '#2ec4b6' : '#83c5be';
      case 'cosmic': return Math.random() > 0.5 ? '#00e5ff' : '#c77dff';
      case 'vaporwave': return Math.random() > 0.5 ? '#ff9ebb' : '#80ffea';
      default: return '#ffffff';
    }
  }

  /* Trigger particle explosion on task completion */
  triggerBurst(x, y) {
    const count = 35;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.burstParticles.push({
        x: x || this.width / 2,
        y: y || this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: Math.random() * 6 + 3,
        color: this.getParticleColor(),
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.015
      });
    }
  }

  drawSynthwaveGrid() {
    this.gridOffset = (this.gridOffset + 0.4) % 40;
    this.ctx.strokeStyle = 'rgba(255, 42, 133, 0.08)';
    this.ctx.lineWidth = 1;

    // Horizon line
    const horizon = this.height * 0.7;

    // Vertical perspective lines
    const totalLines = 24;
    const cx = this.width / 2;
    for (let i = 0; i <= totalLines; i++) {
      const x = (i / totalLines) * this.width * 2 - this.width / 2;
      this.ctx.beginPath();
      this.ctx.moveTo(cx + (x - cx) * 0.1, horizon);
      this.ctx.lineTo(x, this.height);
      this.ctx.stroke();
    }

    // Horizontal moving grid lines
    for (let y = horizon; y < this.height; y += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + (this.gridOffset % 15));
      this.ctx.lineTo(this.width, y + (this.gridOffset % 15));
      this.ctx.stroke();
    }
  }

  loop() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    if (this.theme === 'synthwave') {
      this.drawSynthwaveGrid();
    }

    // Draw ambient floating particles
    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      this.ctx.save();
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillStyle = p.color;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    });

    // Draw burst completion particles
    for (let i = this.burstParticles.length - 1; i >= 0; i--) {
      const bp = this.burstParticles[i];
      bp.x += bp.vx;
      bp.y += bp.vy;
      bp.vy += 0.15; // Gravity effect
      bp.alpha -= bp.decay;

      if (bp.alpha <= 0) {
        this.burstParticles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = bp.alpha;
      this.ctx.fillStyle = bp.color;
      this.ctx.shadowBlur = 12;
      this.ctx.shadowColor = bp.color;
      this.ctx.beginPath();
      this.ctx.arc(bp.x, bp.y, bp.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    requestAnimationFrame(() => this.loop());
  }
}
