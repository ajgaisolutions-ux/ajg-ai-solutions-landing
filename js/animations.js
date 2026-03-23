// animations.js — GSAP ScrollTrigger reveal animations
// Safe: no toca elementos con clase .reveal (los maneja initReveal)
// Usa autoAlpha (opacity + visibility) para evitar elementos invisible atascados

export function initAnimations() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  // Función helper: crea un ScrollTrigger seguro con fallback
  function reveal(targets, vars) {
    const els = gsap.utils.toArray(targets);
    if (!els.length) return;

    els.forEach(el => {
      // Fallback: si después de 3s sigue invisible, lo forzamos visible
      const fallback = setTimeout(() => {
        gsap.set(el, { clearProps: 'all' });
      }, 3000);

      gsap.from(el, {
        ...vars,
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => clearTimeout(fallback),
          ...(vars.scrollTrigger || {}),
        },
        onComplete: () => clearTimeout(fallback),
      });
    });
  }

  // ── Hero entrance ──
  const heroEl = document.querySelector('#hero');
  if (heroEl) {
    const tl = gsap.timeline({ delay: 0.1 });
    const eyebrow = heroEl.querySelector('.eyebrow');
    const h1      = heroEl.querySelector('h1');
    const copy    = heroEl.querySelector('.hero-copy');
    const actions = heroEl.querySelector('.hero-actions');

    if (eyebrow) tl.from(eyebrow, { autoAlpha: 0, y: 16, duration: 0.5, ease: 'power2.out' });
    if (h1)      tl.from(h1,      { autoAlpha: 0, y: 40, duration: 0.75, ease: 'power3.out' }, '-=0.25');
    if (copy)    tl.from(copy,    { autoAlpha: 0, y: 22, duration: 0.6,  ease: 'power2.out' }, '-=0.35');
    if (actions) tl.from(actions, { autoAlpha: 0, y: 18, duration: 0.5,  ease: 'power2.out' }, '-=0.3');
  }

  // ── Section h2 ──
  reveal('section h2', {
    autoAlpha: 0, y: 32, duration: 0.7, ease: 'power3.out',
  });

  // ── Cards (stagger por grupo) ──
  [
    '.problem-cards',
    '.cases-cards',
    '.process-grid',
    '.result-grid',
    '.bento-grid',
  ].forEach(sel => {
    const container = document.querySelector(sel);
    if (!container || !container.children.length) return;

    const fallback = setTimeout(() => {
      gsap.set(container.children, { clearProps: 'all' });
    }, 3000);

    gsap.from(Array.from(container.children), {
      autoAlpha: 0,
      y: 36,
      duration: 0.6,
      stagger: 0.08,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 88%',
        once: true,
        onEnter: () => clearTimeout(fallback),
      },
      onComplete: () => clearTimeout(fallback),
    });
  });

  // ── Métricas (pop) ──
  reveal('.metric, .flow-metric', {
    autoAlpha: 0, scale: 0.88, duration: 0.5, ease: 'back.out(1.4)',
  });

  // ── CTA panel ──
  reveal('.cta-panel', {
    autoAlpha: 0, y: 24, scale: 0.96, duration: 0.65, ease: 'power3.out',
  });

  // Refresca ScrollTrigger después de que todo esté en el DOM
  ScrollTrigger.refresh();
}
