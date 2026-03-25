// flow-spotlight.js — Sticky stacking flow section v2
import CONFIG from './config.js';

export function initFlowSpotlight() {
  const section   = document.getElementById('flowSection');
  const pill      = document.getElementById('flowPill');
  const cardWraps = document.querySelectorAll('.flow-v2-card-wrap[data-step]');
  const pillSteps = document.querySelectorAll('.flow-v2-pill-step');
  if (!section || !pill || !cardWraps.length) return;

  const isDesktop = window.innerWidth > 900;

  // Mover el pill a body para escapar de cualquier opacity/filter/stacking context del padre
  document.body.appendChild(pill);

  // ── Mostrar/ocultar el pill via scroll puro ──
  // Show: cuando hemos scrolleado 80% del title card (card 01 entra)
  // Hide: exactamente cuando la sección termina (card 04 acaba)
  function updatePillVisibility() {
    const rect    = section.getBoundingClientRect();
    const vh      = window.innerHeight;
    const scrolled = -rect.top;                       // px scrolleados dentro de la sección
    const sectionH = section.offsetHeight;            // altura real de la sección (~500vh)
    const shouldShow = scrolled >= vh * 0.8 && scrolled < sectionH - vh * 1.0;
    pill.classList.toggle('show', shouldShow);
  }

  window.addEventListener('scroll', updatePillVisibility, { passive: true });
  updatePillVisibility();

  // ── Actualizar el step activo en el pill ──
  // Con sticky stacking de z-index creciente, múltiples cards pueden estar
  // en viewport simultáneamente. El visualmente visible es el de mayor step.
  const intersecting = new Set();

  const cardObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const step = parseInt(entry.target.dataset.step || '0');
      if (entry.isIntersecting) {
        intersecting.add(step);
      } else {
        intersecting.delete(step);
      }
    });
    if (intersecting.size > 0) {
      const activeStep = Math.max(...intersecting);
      pillSteps.forEach((s, i) => s.classList.toggle('active', i === activeStep));
    }
  }, {
    threshold: isDesktop ? 0.5 : 0.3
  });

  cardWraps.forEach(w => cardObs.observe(w));

  // Set first step active on load
  pillSteps[0] && pillSteps[0].classList.add('active');
}
