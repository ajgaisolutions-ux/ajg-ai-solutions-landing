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

  // ── v3 hamburger — inline drawer creation ──
  if (!window.__hamburgerInit) {
    window.__hamburgerInit = true;
    const menuBtnEl = document.querySelector('.menu-btn');
    if (menuBtnEl) {
      const drawer = document.createElement('div');
      drawer.id = 'nav-drawer';
      drawer.innerHTML = [
        '<a href="#casos">Casos</a>',
        '<a href="#proceso">Proceso</a>',
        '<a href="#resultados">Resultados</a>',
        '<a href="#faq">FAQ</a>',
        `<a class="drawer-cta btn primary" href="${CONFIG.BOOKING_URL}">Agenda tu diagnóstico</a>`
      ].join('');
      document.body.appendChild(drawer);

      menuBtnEl.addEventListener('click', function() {
        const open = drawer.classList.toggle('open');
        menuBtnEl.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : '';
      });

      drawer.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() {
          drawer.classList.remove('open');
          document.body.style.overflow = '';
        });
      });

      document.addEventListener('touchstart', function(e) {
        if (drawer.classList.contains('open') && !drawer.contains(e.target) && !menuBtnEl.contains(e.target)) {
          drawer.classList.remove('open');
          document.body.style.overflow = '';
        }
      }, { passive: true });
    }
  }

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
