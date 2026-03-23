// main.js — Entry point for AJG AI Solutions landing page
import { initBgShader } from './bg-shader.js';
import { initNav } from './nav.js';
import { initReveal } from './reveal.js';
import { initFlowSpotlight } from './flow-spotlight.js';
import { initMotionEffects } from './motion-effects.js';
import { initToolsStack } from './tools-stack.js';
import { initToolsCarousel } from './tools-carousel.js';
import { initMagnetic } from './magnetic.js';
import { initCardEffects } from './card-effects.js';
import { initGlowingEffect } from './glowing-effect.js';

// ── FAQ accordion ──
function initFaq() {
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

// ── Tooltip touch ──
function initTooltips() {
  document.querySelectorAll(".tooltip-wrap").forEach(wrap => {
    wrap.querySelector(".tooltip-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = wrap.classList.contains("open");
      document.querySelectorAll(".tooltip-wrap.open").forEach(other => other.classList.remove("open"));
      if (!isOpen) wrap.classList.add("open");
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".tooltip-wrap.open").forEach(w => w.classList.remove("open"));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Inject liquid glass layer into primary buttons
  document.querySelectorAll('.btn.primary, .top-cta').forEach(btn => {
    const layer = document.createElement('div');
    layer.className = 'btn-glass-layer';
    btn.prepend(layer);
  });

  initBgShader();   // async — loads CDN shader, runs independently
  initMagnetic();
  initCardEffects();
  initGlowingEffect();
  initNav();
  initReveal();
  initFlowSpotlight();
  initMotionEffects();
  initToolsStack();
  initToolsCarousel();
  initFaq();
  initTooltips();
});
