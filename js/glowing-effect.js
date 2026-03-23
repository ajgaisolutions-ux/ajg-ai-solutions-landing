// glowing-effect.js — Mouse-tracking glowing border on cards
// Adapted from GlowingEffect React component → vanilla JS, zero dependencies

const SPREAD       = 30;   // arc width in degrees
const PROXIMITY    = 64;   // px outside card that still activates glow
const INACTIVE_ZONE = 0.7; // fraction of card radius that suppresses glow
const BORDER_W     = '1.5px';
const LERP_FACTOR  = 0.1;  // smoothing (0=no movement, 1=instant)

const CARD_SEL = '.problem-card, .case-card, .process-card, .transform-card, .bento-card, .faq-item, .cta-panel, .flow-metric, .flow-card, .tcard, .tcard-m, .result-card, .flow-v2-card';

export function initGlowingEffect() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  const cards = [...document.querySelectorAll(CARD_SEL)];
  if (!cards.length) return;

  // ── Inject glow div into each card ──────────────────────────────────────
  cards.forEach(card => {
    card.style.setProperty('--ge-start',  '0');
    card.style.setProperty('--ge-active', '0');
    card.style.setProperty('--ge-spread', String(SPREAD));
    card.style.setProperty('--ge-border', BORDER_W);

    const glow = document.createElement('div');
    glow.className = 'ge-glow';
    card.appendChild(glow);
  });

  // ── Per-card state (target angle) ───────────────────────────────────────
  const state = new Map();
  cards.forEach(c => state.set(c, { target: 0 }));

  let mouseX = -9999, mouseY = -9999;

  // ── Update active/angle for one card ────────────────────────────────────
  function updateCard(card) {
    const { left, top, width, height } = card.getBoundingClientRect();
    const cx = left + width  / 2;
    const cy = top  + height / 2;

    const distFromCenter = Math.hypot(mouseX - cx, mouseY - cy);
    const inactiveR = 0.5 * Math.min(width, height) * INACTIVE_ZONE;

    if (distFromCenter < inactiveR) {
      card.style.setProperty('--ge-active', '0');
      return;
    }

    const active =
      mouseX > left - PROXIMITY && mouseX < left + width  + PROXIMITY &&
      mouseY > top  - PROXIMITY && mouseY < top  + height + PROXIMITY;

    card.style.setProperty('--ge-active', active ? '1' : '0');
    if (!active) return;

    state.get(card).target =
      (180 * Math.atan2(mouseY - cy, mouseX - cx)) / Math.PI + 90;
  }

  // ── Continuous RAF loop — smoothly interpolates --ge-start ──────────────
  function tick() {
    cards.forEach(card => {
      const s       = state.get(card);
      const current = parseFloat(card.style.getPropertyValue('--ge-start')) || 0;
      const diff    = ((s.target - current + 180) % 360) - 180;
      if (Math.abs(diff) > 0.05) {
        card.style.setProperty('--ge-start', String(current + diff * LERP_FACTOR));
      }
    });
    requestAnimationFrame(tick);
  }

  // ── Events ───────────────────────────────────────────────────────────────
  document.body.addEventListener('pointermove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cards.forEach(updateCard);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    cards.forEach(updateCard);
  }, { passive: true });

  tick();
}
