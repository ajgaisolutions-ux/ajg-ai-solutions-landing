// magnetic.js — Magnetic hover effect on primary buttons

export function initMagnetic() {
  // Skip on touch devices
  if (window.matchMedia('(hover: none)').matches) return;

  const targets = document.querySelectorAll('.btn.primary, .top-cta');

  targets.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.transition = 'transform 0.12s ease';
    });

    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.38;
      const dy = (e.clientY - cy) * 0.38;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      btn.style.transform  = 'translate(0px, 0px)';
    });
  });
}
