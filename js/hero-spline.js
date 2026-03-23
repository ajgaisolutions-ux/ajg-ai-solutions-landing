// hero-spline.js — Spline 3D scene initialization for hero
import CONFIG from './config.js';

export function initHeroSpline() {
  const viewer = document.querySelector('.hero-stage__viewer spline-viewer');
  if (!viewer) return;

  // Set URL from config
  viewer.setAttribute('url', CONFIG.SPLINE_SCENE_URL);

  // Loading state
  const stage = document.querySelector('.hero-stage__viewer');
  if (stage) stage.setAttribute('data-loading', 'true');

  viewer.addEventListener('load', () => {
    if (stage) stage.removeAttribute('data-loading');
  });

  // Timeout fallback — if Spline takes too long, hide it gracefully
  setTimeout(() => {
    if (stage?.hasAttribute('data-loading')) {
      stage.style.opacity = '0';
    }
  }, 8000);
}
