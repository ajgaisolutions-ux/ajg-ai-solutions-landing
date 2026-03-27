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

  menuBtn?.addEventListener("click", () => {
    mobileNav?.classList.contains("open") ? closeNav() : openNav();
  });
  mobileNavClose?.addEventListener("click", closeNav);
  mobileNavBackdrop?.addEventListener("click", closeNav);
  document.querySelectorAll(".mobile-nav a").forEach(link => {
    link.addEventListener("click", closeNav);
  });

  // ── Floating pill nav on scroll ──
  function updatePillNav() {
    const scrolled = (window.scrollY || window.pageYOffset ||
      document.documentElement.scrollTop || document.body.scrollTop) > 60;
    document.body.classList.toggle('nav-scrolled', scrolled);
  }

  // Primary: scroll events (belt & suspenders)
  window.addEventListener('scroll', updatePillNav, { passive: true });
  document.addEventListener('scroll', updatePillNav, { passive: true });

  // Reliable fallback: sentinel div just below the header
  // Triggers as soon as the user scrolls ~100px — doesn't depend on scroll events
  const sentinel = document.getElementById('nav-sentinel');
  if (sentinel) {
    const pillObs = new IntersectionObserver(
      ([entry]) => document.body.classList.toggle('nav-scrolled', !entry.isIntersecting),
      { threshold: 0 }
    );
    pillObs.observe(sentinel);
  }

  updatePillNav();
}
