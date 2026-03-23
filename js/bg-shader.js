// bg-shader.js — Flow Field Neural Background
// Adapted from NeuralBackground React component → vanilla JS
// Zero external dependencies

// CONFIG
const CONFIG = {
  color:          '#38bdf8',  // landing cyan
  trailOpacity:   0.12,       // lower = longer trails
  particleCount:  600,
  speed:          0.8,
};

// Landing bg color for trail fade: #050816 = rgb(5,8,22)
const TRAIL_COLOR = 'rgb(5,8,22)';

export function initBgShader() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const wrap = document.getElementById('bg-shader-wrap');
  if (!wrap) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'display:block;width:100%;height:100%';
  wrap.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) { console.warn('bg-shader: 2D context not available'); return; }

  let width    = window.innerWidth;
  let height   = window.innerHeight;
  let particles = [];
  let rafId;
  const mouse  = { x: -1000, y: -1000 };

  // ── Particle ──────────────────────────────────────────────────────────────

  class Particle {
    constructor(stagger) {
      this._stagger = stagger;
      this.reset(true);
    }

    reset(isInit) {
      this.x   = Math.random() * width;
      this.y   = Math.random() * height;
      this.vx  = 0;
      this.vy  = 0;
      this.life = Math.random() * 200 + 100;
      // Stagger initial ages so they don't all pop in at once
      this.age = isInit ? Math.random() * this.life : 0;
    }

    update() {
      // Flow field: angle from position
      const angle = (Math.cos(this.x * 0.005) + Math.sin(this.y * 0.005)) * Math.PI;
      this.vx += Math.cos(angle) * 0.2 * CONFIG.speed;
      this.vy += Math.sin(angle) * 0.2 * CONFIG.speed;

      // Mouse repulsion
      const dx   = mouse.x - this.x;
      const dy   = mouse.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 150) {
        const force = (150 - dist) / 150;
        this.vx -= dx * force * 0.05;
        this.vy -= dy * force * 0.05;
      }

      this.x  += this.vx;
      this.y  += this.vy;
      this.vx *= 0.95;  // friction
      this.vy *= 0.95;
      this.age++;

      if (this.age > this.life) this.reset(false);

      // Wrap around edges
      if (this.x < 0)      this.x = width;
      if (this.x > width)  this.x = 0;
      if (this.y < 0)      this.y = height;
      if (this.y > height) this.y = 0;
    }

    draw() {
      const t     = this.age / this.life;
      const alpha = Math.max(0, 1 - Math.abs(t - 0.5) * 2);
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = CONFIG.color;
      ctx.fillRect(this.x, this.y, 1.5, 1.5);
    }
  }

  // ── Init / resize ──────────────────────────────────────────────────────────

  function init() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = width  * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    canvas.style.width  = width  + 'px';
    canvas.style.height = height + 'px';

    // Fill initial frame with bg color
    ctx.globalAlpha = 1;
    ctx.fillStyle   = TRAIL_COLOR;
    ctx.fillRect(0, 0, width, height);

    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push(new Particle(true));
    }
  }

  function resize() {
    width  = window.innerWidth;
    height = window.innerHeight;
    init();
  }

  window.addEventListener('resize', resize);

  // ── Render loop ────────────────────────────────────────────────────────────

  function animate() {
    // Trail: semi-transparent bg overlay fades old frames
    ctx.globalAlpha = CONFIG.trailOpacity;
    ctx.fillStyle   = TRAIL_COLOR;
    ctx.fillRect(0, 0, width, height);

    // Draw particles (each sets its own globalAlpha)
    particles.forEach(p => { p.update(); p.draw(); });

    ctx.globalAlpha = 1; // reset
    rafId = requestAnimationFrame(animate);
  }

  // ── Mouse tracking (fixed overlay → use clientX/Y directly) ───────────────

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  document.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  // ── Start ──────────────────────────────────────────────────────────────────
  init();
  animate();

  // ── Scroll-based opacity ──────────────────────────────────────────────────
  // Zones (element-based, not hardcoded %):
  //   Hero start → flowSection start : 0.30 → 0.03  (fast fade)
  //   flowSection → cta start        : 0.03          (barely visible)
  //   cta start → cta end            : 0.03 → 0.20  (gradual reappear)
  //   cta end → page bottom          : 0.20 → 0.30  (back to hero level)

  function smoothStep(t) {
    const c = Math.max(0, Math.min(1, t));
    return c * c * (3 - 2 * c);
  }

  function getThresholds() {
    const totalH = document.body.scrollHeight;
    const vpH    = window.innerHeight;
    const maxSY  = totalH - vpH;

    const hero   = document.getElementById('hero');
    const cta    = document.getElementById('cta');

    // Fade completes when you've scrolled ~80% of the hero height
    // (background gone before flowSection fully takes over)
    const heroH   = hero ? hero.offsetHeight : vpH * 0.7;
    const fadeEnd = Math.min((heroH * 0.8) / maxSY, 0.10);

    // cta enters viewport when its top is ~60% from the bottom
    const ctaStart = cta ? Math.max(0, (cta.offsetTop - vpH * 0.6) / maxSY) : 0.85;
    // cta reappear completes near end of section
    const ctaEnd   = cta ? Math.min(0.98, (cta.offsetTop + cta.offsetHeight * 0.6) / maxSY) : 0.96;

    return { fadeEnd, ctaStart, ctaEnd };
  }

  let thresholds = getThresholds();
  window.addEventListener('resize', () => { thresholds = getThresholds(); }, { passive: true });

  function getTargetOpacity(p) {
    const { fadeEnd, ctaStart, ctaEnd } = thresholds;

    // Hero → fade: 0.30 → 0.03 (completes at ~80% of hero height scrolled)
    if (p < fadeEnd)    return 0.30 - smoothStep(p / fadeEnd) * 0.27;

    // Middle sections (flowSection → casos → proceso → faq): barely there
    if (p < ctaStart)   return 0.07;

    // cta fade-in: 0.07 → 0.20 (gradual, not as strong as hero)
    if (p < ctaEnd)     return 0.07 + smoothStep((p - ctaStart) / (ctaEnd - ctaStart)) * 0.13;

    // Very bottom: 0.20 → 0.30 (match hero intensity)
    return 0.20 + smoothStep((p - ctaEnd) / Math.max(0.01, 1 - ctaEnd)) * 0.10;

  }

  wrap.style.transition = 'opacity 0.6s ease';

  function onScroll() {
    const max = document.body.scrollHeight - window.innerHeight;
    const p   = max > 0 ? window.scrollY / max : 0;
    wrap.style.opacity = getTargetOpacity(p).toFixed(3);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
