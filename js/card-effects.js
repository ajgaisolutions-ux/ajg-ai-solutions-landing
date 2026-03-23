// card-effects.js — Radial shine on hover (sin 3D tilt para performance)

export function initCardEffects() {
  if (window.matchMedia('(hover: none)').matches) return;

  const sel = '.problem-card, .case-card, .process-card, .result-card, .card, .bento-card';
  document.querySelectorAll(sel).forEach(card => {
    card.classList.add('card-shine');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--shine-x', `${((e.clientX - rect.left) / rect.width)  * 100}%`);
      card.style.setProperty('--shine-y', `${((e.clientY - rect.top)  / rect.height) * 100}%`);
    });
  });
}
