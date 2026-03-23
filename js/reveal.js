// reveal.js — Scroll-triggered reveal animations
import CONFIG from './config.js';

export function initReveal() {
  // ── Basic .reveal observer ──
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: CONFIG.REVEAL_THRESHOLD });

  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

  // ── fade-in-up and scroll-reveal observer ──
  const fadeSelectors = [
    '.card',
    '.problem-card',
    '.benefit-card',
    '.process-card',
    '.faq-item',
    '.result-card',
    '.action',
    '.mini-item',
    '.metric',
    '.wf-field',
    '.bento-card',
    'section h2',
    'section h3'
  ];

  const allFadeEls = [];
  fadeSelectors.forEach(sel => {
    try {
      document.querySelectorAll(sel).forEach(el => {
        if (!el.classList.contains('fade-in-up')) {
          el.classList.add('fade-in-up');
          allFadeEls.push(el);
        }
      });
    } catch(e) {}
  });

  // Stagger grid containers
  const staggerSelectors = [
    '.problem-cards',
    '.benefits-grid',
    '.cases-cards',
    '.process-grid',
    '.result-grid',
    '.metrics',
    '.stack-grid'
  ];
  staggerSelectors.forEach(sel => {
    try {
      document.querySelectorAll(sel).forEach(p => {
        p.classList.add('fade-stagger');
      });
    } catch(e) {}
  });

  const observer2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        entry.target.classList.add("revealed");
        observer2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '-60px 0px 0px 0px' });

  allFadeEls.forEach(el => observer2.observe(el));

  document.querySelectorAll(".fade-in-up, .scroll-reveal").forEach(el => {
    if (!allFadeEls.includes(el)) {
      observer2.observe(el);
    }
  });

  // ── Section separators ──
  if (!window.__sectionSepInit) {
    window.__sectionSepInit = true;
    const sections = document.querySelectorAll('main section, body > section, .hero, .section');
    sections.forEach(sec => {
      const next = sec.nextElementSibling;
      if (next && (next.tagName === 'SECTION' || next.classList.contains('section'))) {
        if (!sec.nextElementSibling || !sec.nextElementSibling.classList.contains('section-sep')) {
          const sep = document.createElement('div');
          sep.className = 'section-sep';
          sec.parentNode.insertBefore(sep, next);
        }
      }
    });
  }
}
