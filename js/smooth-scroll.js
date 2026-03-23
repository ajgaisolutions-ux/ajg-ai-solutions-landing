// smooth-scroll.js — Lenis smooth scroll + GSAP ticker sync

export function initSmoothScroll() {
  if (!window.Lenis || !window.gsap) return;

  const lenis = new Lenis({
    duration: 0.85,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.2,
  });

  // Sync Lenis with GSAP ticker
  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // Smooth anchor link scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80, duration: 1.4 });
      }
    });
  });

  return lenis;
}
