// nav.js — Mobile nav hamburger and sticky hide/show
import CONFIG from './config.js';

export function initNav() {
  // ── Hamburger menu (mobile-nav drawer) ──
  const menuBtn = document.getElementById("menuBtn");
  const mobileNav = document.getElementById("mobileNav");
  const mobileNavClose = document.getElementById("mobileNavClose");
  const mobileNavBackdrop = document.getElementById("mobileNavBackdrop");

  function openNav() {
    mobileNav?.classList.add("open");
    menuBtn?.classList.add("open");
    menuBtn?.setAttribute("aria-expanded", "true");
    mobileNav?.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeNav() {
    mobileNav?.classList.remove("open");
    menuBtn?.classList.remove("open");
    menuBtn?.setAttribute("aria-expanded", "false");
    mobileNav?.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  menuBtn?.addEventListener("click", openNav);
  mobileNavClose?.addEventListener("click", closeNav);
  mobileNavBackdrop?.addEventListener("click", closeNav);
  document.querySelectorAll(".mobile-nav a").forEach(link => {
    link.addEventListener("click", closeNav);
  });

  // ── Sticky nav hide on scroll down ──
  if (!window.__navV3) {
    window.__navV3 = true;
    const header = document.querySelector('header');
    if (header) {
      let lastY = 0;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        if (y > 80 && y > lastY) {
          header.classList.add('nav-hidden');
        } else {
          header.classList.remove('nav-hidden');
        }
        lastY = Math.max(0, y);
      }, { passive: true });
    }
  }
}
