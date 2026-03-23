// motion-effects.js — Motion effects: word reveal, stagger, 3D tilt, magnetic buttons

export function initMotionEffects() {
  // Reduced motion check
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ── Hero word-by-word entrance ──
  const h1 = document.querySelector('.hero h1');
  if (h1) {
    const origNodes = [...h1.childNodes];
    h1.innerHTML = '';
    const wordEls = [];

    origNodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(chunk => {
          if (/\S/.test(chunk)) {
            const s = document.createElement('span');
            s.className = 'mj-word';
            s.textContent = chunk;
            h1.appendChild(s);
            wordEls.push(s);
          } else {
            h1.appendChild(document.createTextNode(chunk));
          }
        });
      } else {
        // Preserve .highlight spans intact
        node.classList.add('mj-word');
        h1.appendChild(node);
        wordEls.push(node);
      }
    });

    // Hide hero sub-elements initially
    const heroCopy    = document.querySelector('.hero-copy');
    const heroActions = document.querySelector('.hero-actions');
    [heroCopy, heroActions].forEach(el => {
      if (!el) return;
      el.style.opacity   = '0';
      el.style.transform = 'translateY(14px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
    });

    const BASE = 560;
    wordEls.forEach((w, i) => setTimeout(() => w.classList.add('in'), BASE + i * 50));
    const afterWords = BASE + wordEls.length * 50;

    if (heroCopy) {
      setTimeout(() => {
        heroCopy.style.opacity   = '1';
        heroCopy.style.transform = 'none';
      }, afterWords + 110);
    }
    if (heroActions) {
      setTimeout(() => {
        heroActions.style.opacity   = '1';
        heroActions.style.transform = 'none';
      }, afterWords + 270);
    }
  }

  // ── Stagger scroll children ──
  const staggerSelectors = [
    '.problem-cards .problem-card',
    '.cases-cards .case-card',
    '.process-grid .process-card',
    '.transform-grid .transform-card',
    '.faq-grid .faq-item',
    '.stack-grid .stack-chip',
  ];

  staggerSelectors.forEach(sel => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('mj-sch');
      el.style.transitionDelay = (i * 72) + 'ms';
    });
  });

  const sObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        sObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.mj-sch').forEach(el => sObs.observe(el));

  // ── Parallax orbs on scroll ──
  const o1 = document.querySelector('.orb.one');
  const o2 = document.querySelector('.orb.two');
  if (o1 || o2) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (o1) o1.style.transform = `translateY(${y * .20}px)`;
      if (o2) o2.style.transform = `translateY(${y * -.14}px)`;
    }, { passive: true });
  }

  // ── Magnetic buttons ──
  document.querySelectorAll('.btn, .top-cta').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      btn.style.transition = 'none';
      const r  = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width  / 2) * .28;
      const dy = (e.clientY - r.top  - r.height / 2) * .28;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transition = 'transform .38s cubic-bezier(.22,.8,.36,1)';
      btn.style.transform  = '';
      setTimeout(() => { btn.style.transition = ''; }, 400);
    });
  });

  // ── 3D card tilt on hover ──
  document.querySelectorAll(
    '.problem-card, .case-card, .process-card, .transform-card, .bento-card'
  ).forEach(card => {
    card.addEventListener('mousemove', e => {
      card.style.transition = 'none';
      const r   = card.getBoundingClientRect();
      const rx_ = (e.clientY - r.top  - r.height / 2) / r.height * -10;
      const ry_ = (e.clientX - r.left - r.width  / 2) / r.width  *  10;
      card.style.transform  = `perspective(700px) rotateX(${rx_}deg) rotateY(${ry_}deg) scale(1.03) translateZ(4px)`;
      card.style.boxShadow  = '0 24px 64px rgba(0,0,0,.32)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform .4s cubic-bezier(.25,.46,.45,.94), box-shadow .4s ease';
      card.style.transform  = '';
      card.style.boxShadow  = '';
      setTimeout(() => { card.style.transition = ''; }, 420);
    });
  });

  // ── Hero parallax + scale + fade on scroll ──
  if (!window.__heroParallaxV1) {
    window.__heroParallaxV1 = true;
    (function() {
      var hero        = document.querySelector('.hero');
      var heroContent = hero && (
        hero.querySelector('div[style*="z-index:2"]') ||
        hero.querySelector('div[style*="z-index: 2"]')
      );
      var hgBlobs     = hero ? hero.querySelectorAll('.hg') : [];
      if (!hero || !heroContent) return;

      var heroHeight = hero.offsetHeight;
      var ticking    = false;

      function updateHeroScroll() {
        var scrollY   = window.scrollY;
        var heroBottom = hero.offsetTop + heroHeight;
        if (scrollY > heroBottom) { ticking = false; return; }

        var progress = Math.min(1, scrollY / heroHeight);

        // 2. Scale + opacity + blur on content
        var scale   = 1 - progress * 0.04;
        var opacity = Math.max(0, 1 - progress * 2);
        var blur    = progress * 6;
        heroContent.style.transform       = 'scale(' + scale + ')';
        heroContent.style.transformOrigin = 'center center';
        heroContent.style.opacity         = opacity.toFixed(3);
        heroContent.style.filter          = 'blur(' + blur.toFixed(1) + 'px)';
        heroContent.style.willChange      = 'transform, opacity, filter';
        heroContent.style.pointerEvents   = opacity < 0.05 ? 'none' : '';

        // 3. Lateral movement on any .hg blobs (no-op if none exist)
        hgBlobs.forEach(function(blob, i) {
          var dir  = i % 2 === 0 ? 1 : -1;
          var blobX = scrollY * 0.08 * dir;
          var blobY = scrollY * 0.15;
          blob.style.transform = 'translate(' + blobX + 'px,' + blobY + 'px)';
        });

        ticking = false;
      }

      function onScroll() {
        if (!ticking) {
          requestAnimationFrame(updateHeroScroll);
          ticking = true;
        }
      }

      function onResize() { heroHeight = hero.offsetHeight; }

      if (window.innerWidth > 768) {
        window.addEventListener('scroll', onScroll,  { passive: true });
        window.addEventListener('resize', onResize,  { passive: true });
      } else {
        // Mobile: opacity fade only, no scale/blur/parallax
        window.addEventListener('scroll', function() {
          var p = Math.min(window.scrollY / (hero.offsetHeight * 0.5), 1);
          heroContent.style.opacity = Math.max(0, 1 - p * 1.5).toFixed(3);
        }, { passive: true });
      }
    })();
  }

  // ── Section exit blur/fade on scroll ──
  (function() {
    if (window.innerWidth <= 768) return;
    // flowSection has sticky children — filter breaks sticky, so only fade it
    const NO_FILTER = ['flowSection'];
    const sections  = Array.from(document.querySelectorAll('section[id]:not(#hero)'));
    let ticking = false;
    const vh = window.innerHeight;

    function update() {
      sections.forEach(sec => {
        const rect     = sec.getBoundingClientRect();
        const useBlur  = !NO_FILTER.includes(sec.id);

        if (rect.top < 0 && rect.bottom > 0) {
          // Section exiting upward
          const prog    = Math.min(1, Math.max(0, -rect.top / (vh * 1.2)));
          const opacity = Math.max(0, 1 - prog * 0.28).toFixed(3);
          sec.style.opacity = opacity;
          if (useBlur) sec.style.filter = 'blur(' + (prog * 1.2).toFixed(1) + 'px)';
        } else {
          sec.style.opacity = '';
          sec.style.filter  = '';
        }
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  })();

  // ── Smooth anchor scrolling ──
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Bento stagger entrance ──
  (function() {
    const grid = document.querySelector('#herramientas .bento-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.bento-card'));
    cards.forEach(c => {
      c.style.opacity = '0';
      c.style.transform = 'translateY(18px)';
    });
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        cards.forEach((c, i) => {
          setTimeout(() => {
            c.style.opacity = '';
            c.style.transform = '';
          }, i * 75);
        });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.10 });
    obs.observe(grid);
  })();

  // ── Stagger sections ──
  (function() {
    const groups = [
      { parent: '.cases-cards',    child: '.case-card' },
      { parent: '.process-grid',   child: '.process-card' },
      { parent: '.transform-grid', child: '.transform-card' },
      { parent: '.problem-cards',  child: '.problem-card' },
      { parent: '.faq-grid',       child: '.faq-item' }
    ];
    groups.forEach(g => {
      const container = document.querySelector(g.parent);
      if (!container) return;
      const items = Array.from(container.querySelectorAll(g.child));
      if (!items.length) return;
      items.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(40px)';
        item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      });
      const obs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          items.forEach((item, i) => {
            setTimeout(() => {
              item.style.opacity = '';
              item.style.transform = '';
              setTimeout(() => { item.style.transition = ''; }, 650);
            }, i * 100);
          });
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.10 });
      obs.observe(container);
    });
  })();

  // ── Cursor border glow on cards — disabled (replaced by ge-glow aurora) ──
}
