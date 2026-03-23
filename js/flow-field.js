// flow-field.js — Subtle particle flow field for hero background
// Colors: blue (#1e50d0), cyan (#38bdf8), titanium (#dde9ff) — AJG palette

export function initFlowField() {
  const canvas = document.getElementById('hero-flow-canvas');
  const hero   = document.getElementById('hero');
  if (!canvas || !hero) return;

  // Skip on reduced-motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // ── Palette (brand colors, very low opacity for subtlety) ──
  const COLORS = [
    'rgba(30,  80, 208, 0.50)',   // --blue
    'rgba(56, 189, 248, 0.32)',   // --cyan
    'rgba(221,233, 255, 0.18)',   // --titanium
    'rgba(53,  216,255, 0.25)',   // cyan-bright
  ];
  const BG_TRAIL = 'rgba(5, 8, 22, 0.09)';  // matches --bg (#050816), very transparent = long trails
  const COUNT    = 320;
  const SPEED    = 0.42;

  let width, height, dpr;
  let particles = [];
  let rafId;

  // ── Particle ──
  class Particle {
    constructor(initial) { this.reset(!!initial); }

    reset(initial) {
      this.x     = Math.random() * width;
      this.y     = initial ? Math.random() * height : Math.random() * height;
      this.vx    = 0;
      this.vy    = 0;
      this.age   = initial ? Math.floor(Math.random() * 200) : 0;
      this.life  = Math.random() * 260 + 140;
      this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
      this.size  = Math.random() * 1.1 + 0.5;
    }

    update() {
      // Flow field angle based on position
      const angle = (Math.cos(this.x * 0.0038) + Math.sin(this.y * 0.0038)) * Math.PI;
      this.vx += Math.cos(angle) * 0.14 * SPEED;
      this.vy += Math.sin(angle) * 0.14 * SPEED;

      // Friction
      this.vx *= 0.96;
      this.vy *= 0.96;

      this.x += this.vx;
      this.y += this.vy;
      this.age++;

      // Recycle when old or out of bounds
      if (this.age > this.life || this.x < -4 || this.x > width + 4 || this.y < -4 || this.y > height + 4) {
        this.reset(false);
      }
    }

    draw() {
      // Fade in/out over lifetime
      const t     = this.age / this.life;
      const alpha = (1 - Math.abs(t - 0.5) * 2) * 0.88;
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = this.color;
      ctx.fillRect(this.x, this.y, this.size, this.size);
    }
  }

  // ── Setup ──
  function init() {
    dpr    = window.devicePixelRatio || 1;
    width  = hero.clientWidth;
    height = hero.clientHeight;

    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    canvas.style.width  = width  + 'px';
    canvas.style.height = height + 'px';
    ctx.scale(dpr, dpr);

    // Fill canvas with bg color first to avoid white flash
    ctx.fillStyle = '#050816';
    ctx.fillRect(0, 0, width, height);

    particles = Array.from({ length: COUNT }, (_, i) => new Particle(true));
  }

  // ── Loop ──
  function animate() {
    // Semi-transparent fill = trail effect
    ctx.fillStyle = BG_TRAIL;
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    ctx.globalAlpha = 1;

    rafId = requestAnimationFrame(animate);
  }

  // ── Resize ──
  let resizeTimer;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(rafId);
      init();
      animate();
    }, 150);
  }

  init();
  animate();
  window.addEventListener('resize', onResize);
}
