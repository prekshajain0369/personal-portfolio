/* =========================================================
   Preksha Jain — Personal Portfolio
   script.js

   Modules
   1. Helpers / feature flags
   2. Navbar (scrolled state, mobile menu, active link)
   3. Reveal-on-scroll (IntersectionObserver)
   4. Parallax (hero image + section backgrounds)
   5. Expandable startup cards (overlay, click-outside, Esc)
   6. Contact niceties (placeholder link guard, Gmail fallback)
   7. Hero wave (procedural SVG lines + noise + cursor deformation)
   ========================================================= */

(function () {
  'use strict';

  document.documentElement.classList.remove('no-js');

  /* -------------------------------------------------------
     1. HELPERS
     ------------------------------------------------------- */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Touch-only devices: no hover, and parallax is disabled for performance.
  const isTouch = window.matchMedia('(hover: none)').matches;


  /* -------------------------------------------------------
     2. NAVBAR
     ------------------------------------------------------- */
  const navbar    = $('#navbar');
  const navToggle = $('#navToggle');
  const navMenu   = $('#navMenu');
  const navLinks  = $$('.navbar__link');

  // Compact/shadowed navbar once the page is scrolled.
  function updateNavbarScrolled() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  // Mobile menu open/close
  function openMenu() {
    navMenu.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close menu');
  }
  function closeMenu() {
    navMenu.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  }
  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  // Close menu after choosing a link, and when clicking outside or pressing Esc.
  navLinks.forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu.classList.contains('is-open')) {
      closeMenu();
      navToggle.focus();
    }
  });

  // Highlight the nav link whose section is currently in view.
  const sections = navLinks
    .map((link) => $(link.getAttribute('href')))
    .filter(Boolean);

  const activeObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = '#' + entry.target.id;
        navLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === id));
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => activeObserver.observe(s));


  /* -------------------------------------------------------
     3. REVEAL ON SCROLL
     ------------------------------------------------------- */
  const revealEls = $$('.reveal');
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // animate once
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }


  /* -------------------------------------------------------
     4. PARALLAX
     Elements with [data-parallax="0.2"] move at 20% of scroll speed
     relative to their parent section. Disabled for touch devices and
     reduced-motion users; the backgrounds simply stay static.
     ------------------------------------------------------- */
  const parallaxEls = $$('[data-parallax]').map((el) => ({
    el,
    speed: parseFloat(el.dataset.parallax) || 0.2,
    parent: el.parentElement,
  }));

  const parallaxEnabled = !prefersReducedMotion && !isTouch && parallaxEls.length > 0;
  let ticking = false;

  function updateParallax() {
    const vh = window.innerHeight;
    parallaxEls.forEach(({ el, speed, parent }) => {
      const rect = parent.getBoundingClientRect();
      // Skip work for sections far outside the viewport.
      if (rect.bottom < -vh || rect.top > vh * 2) return;
      // Distance of the section's center from the viewport center.
      const offset = (rect.top + rect.height / 2) - vh / 2;
      el.style.transform = `translate3d(0, ${(offset * speed).toFixed(1)}px, 0)`;
    });
    ticking = false;
  }

  function onScroll() {
    updateNavbarScrolled();
    if (parallaxEnabled && !ticking) {
      ticking = true;
      requestAnimationFrame(updateParallax);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();


  /* -------------------------------------------------------
     5. EXPANDABLE STARTUP CARDS
     Click / tap expands (on every device). Hover only lifts the card.
     Close: click outside, Escape, or the × button.
     ------------------------------------------------------- */
  const overlay = $('#overlay');
  const expandableCards = $$('[data-expandable]');
  let expandedCard = null;
  let ghost = null;          // keeps the grid slot occupied while the card is fixed

  // The overlay lives in <body> so it always covers the full viewport.
  document.body.appendChild(overlay);

  function expandCard(card) {
    if (expandedCard === card) return;
    if (expandedCard) collapseCard(false);

    // Placeholder that preserves the card's footprint in the grid. The card
    // itself is moved to <body> so `position: fixed` is relative to the
    // viewport (ancestors with transform/overflow would otherwise trap it).
    ghost = document.createElement('div');
    ghost.className = 'idea-card__ghost';
    ghost.style.height = card.offsetHeight + 'px';
    card.parentNode.insertBefore(ghost, card);
    document.body.appendChild(card);

    card.classList.add('is-expanded');
    card.setAttribute('aria-expanded', 'true');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-modal', 'true');

    overlay.hidden = false;
    // Next frame so the opacity transition runs.
    requestAnimationFrame(() => overlay.classList.add('is-visible'));
    document.body.style.overflow = 'hidden';

    expandedCard = card;
    $('.idea-card__close', card).focus({ preventScroll: true });
  }

  function collapseCard(restoreFocus = true) {
    if (!expandedCard) return;
    const card = expandedCard;

    card.classList.remove('is-expanded');
    card.setAttribute('aria-expanded', 'false');
    card.removeAttribute('role');
    card.removeAttribute('aria-modal');

    // Put the card back into its original grid slot and drop the ghost.
    if (ghost && ghost.parentNode) {
      ghost.parentNode.insertBefore(card, ghost);
      ghost.parentNode.removeChild(ghost);
    }
    ghost = null;

    overlay.classList.remove('is-visible');
    // Hide after the fade-out (matches --dur in CSS).
    setTimeout(() => { if (!expandedCard) overlay.hidden = true; }, prefersReducedMotion ? 0 : 320);
    document.body.style.overflow = '';

    expandedCard = null;
    if (restoreFocus) card.focus({ preventScroll: true });
  }

  expandableCards.forEach((card) => {
    const closeBtn = $('.idea-card__close', card);

    // Click / tap to expand. (Hover only lifts the card via CSS; it never opens it.)
    card.addEventListener('click', (e) => {
      if (e.target.closest('.idea-card__close')) return;
      if (!card.classList.contains('is-expanded')) expandCard(card);
    });

    // Keyboard: Enter / Space toggles.
    card.addEventListener('keydown', (e) => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target === card) {
        e.preventDefault();
        card.classList.contains('is-expanded') ? collapseCard() : expandCard(card);
      }
    });

    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      collapseCard();
    });
  });

  // Click anywhere outside the expanded card closes it.
  overlay.addEventListener('click', () => collapseCard());
  document.addEventListener('click', (e) => {
    if (expandedCard && !expandedCard.contains(e.target)) collapseCard();
  });

  // Escape closes it.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && expandedCard) collapseCard();
  });


  /* -------------------------------------------------------
     6. CONTACT
     ------------------------------------------------------- */
  // Placeholder social links (href="#") shouldn't jump to the top of the page.
  $$('[data-placeholder-link]').forEach((link) => {
    link.addEventListener('click', (e) => {
      if (link.getAttribute('href') === '#') {
        e.preventDefault();
        link.classList.add('is-nudged');
        setTimeout(() => link.classList.remove('is-nudged'), 400);
      }
    });
  });

  // Gmail card: open Gmail compose; if the popup is blocked (or Gmail isn't
  // available), fall back to the mailto: link so the user's mail app opens.
  const gmailCard = $('[data-mailto]');
  if (gmailCard) {
    gmailCard.addEventListener('click', (e) => {
      const composeUrl = gmailCard.getAttribute('href');
      const mailto = gmailCard.dataset.mailto;
      e.preventDefault();
      const win = window.open(composeUrl, '_blank', 'noopener');
      if (!win) window.location.href = mailto;
    });
  }


  /* -------------------------------------------------------
     7. HERO WAVE
     Recreates the "many thin vertical lines" wave from the reference:
       final point = base grid position
                   + slow layered noise (continuous motion)
                   + cursor field (localised push, smooth falloff, eased)
     Each line is one <path>; only its `d` attribute changes per frame.
     Tunables live in CSS variables on .hero-wave (see style.css).
     ------------------------------------------------------- */
  const waveRoot = $('#heroWave');
  const waveSvg  = $('#heroWaveSvg');

  if (waveRoot && waveSvg) {
    const cssNum = (name, fallback) => {
      const v = parseFloat(getComputedStyle(waveRoot).getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };

    // --- tiny smooth noise (value noise with smoothstep) -------------
    // Deterministic pseudo-random for lattice points.
    function hash(x, y) {
      let h = (x * 374761393 + y * 668265263) | 0;
      h = ((h ^ (h >>> 13)) * 1274126177) | 0;
      return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
    }
    const smooth = (t) => t * t * (3 - 2 * t);
    function noise2(x, y) {
      const xi = Math.floor(x), yi = Math.floor(y);
      const xf = smooth(x - xi), yf = smooth(y - yi);
      const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
      return (a + (b - a) * xf) * (1 - yf) + (c + (d - c) * xf) * yf; // 0..1
    }

    // --- state ---------------------------------------------------------
    let W = 0, H = 0;
    let lines = [];        // [{ el, pts: [{x, y, ox, oy}] }]
    const mouse = {
      x: -9999, y: -9999,   // eased position (px, within wave box)
      tx: -9999, ty: -9999, // raw target
      vx: 0, vy: 0,         // eased velocity (drives the push direction)
      inside: false,
    };
    const cursorEnabled = !isTouch;
    const staticOnly = prefersReducedMotion;

    // Random events (all disabled for reduced-motion users):
    //  - ripples:    soft expanding rings at random points (like a pebble drop)
    //  - highlights: individual lines that briefly darken, then fade back
    //  - travellers: a dark pulse that glides left->right through the lines
    const ripples = [];      // { x, y, t0, dur, strength, radius }
    const highlights = [];   // { i, t0, dur }
    const travellers = [];   // { t0, dur, width }
    let nextRipple = 1.5, nextHighlight = 0.8, nextTraveller = 2.5;
    const rand = (a, b) => a + Math.random() * (b - a);

    // Colour helpers: interpolate between base stroke and highlight stroke.
    let strokeBase = [63, 127, 184], strokeHi = [159, 232, 255];
    function parseRgb(str) {
      const m = str.match(/\d+(\.\d+)?/g);
      return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null;
    }
    function readColours() {
      const probe = document.createElement('span');
      probe.style.color = getComputedStyle(waveRoot).getPropertyValue('--wave-stroke') || "#3f7fb8";
      waveRoot.appendChild(probe);
      strokeBase = parseRgb(getComputedStyle(probe).color) || strokeBase;
      probe.style.color = getComputedStyle(waveRoot).getPropertyValue('--wave-stroke-hi') || "#9fe8ff";
      strokeHi = parseRgb(getComputedStyle(probe).color) || strokeHi;
      probe.remove();
    }
    const mixColour = (k) => {
      const r = Math.round(strokeBase[0] + (strokeHi[0] - strokeBase[0]) * k);
      const g = Math.round(strokeBase[1] + (strokeHi[1] - strokeBase[1]) * k);
      const b = Math.round(strokeBase[2] + (strokeHi[2] - strokeBase[2]) * k);
      return `rgb(${r},${g},${b})`;
    };
    const easeOutBump = (u) => Math.sin(Math.PI * Math.min(1, Math.max(0, u))); // 0->1->0

    function build() {
      const rect = waveRoot.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      waveSvg.setAttribute('viewBox', `0 0 ${W} ${H}`);

      const gapX = cssNum('--wave-gap-x', 10);
      const gapY = cssNum('--wave-gap-y', 32);
      // Overshoot the box slightly so deformed lines never expose the edges.
      const padX = gapX * 4, padY = gapY * 2;
      const cols = Math.ceil((W + padX * 2) / gapX) + 1;
      const rows = Math.ceil((H + padY * 2) / gapY) + 1;

      waveSvg.textContent = '';
      lines = [];
      const frag = document.createDocumentFragment();
      for (let i = 0; i < cols; i++) {
        const ox = -padX + i * gapX;
        const pts = [];
        for (let j = 0; j < rows; j++) {
          const oy = -padY + j * gapY;
          pts.push({ ox, oy, x: ox, y: oy });
        }
        const el = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        el.setAttribute('class', 'hero-wave__line');
        frag.appendChild(el);
        lines.push({ el, pts, hi: 0 });
      }
      waveSvg.appendChild(frag);
      readColours();
      ripples.length = 0; highlights.length = 0; travellers.length = 0;
      render(0);
    }

    // Spawn / expire random events. `time` is seconds.
    function updateEvents(time) {
      if (staticOnly) return;
      const base = Math.min(W, H);
      const eventRate = cssNum('--wave-events', 1); // 0 = off, 2 = twice as busy
      if (eventRate <= 0) return;

      if (time > nextRipple && ripples.length < 3) {
        ripples.push({
          x: rand(W * 0.1, W * 0.9), y: rand(H * 0.15, H * 0.85),
          t0: time, dur: rand(2.2, 3.4),
          strength: base * rand(0.08, 0.16), radius: base * rand(0.35, 0.6),
        });
        nextRipple = time + rand(2, 6) / eventRate;
      }
      if (time > nextHighlight && highlights.length < 6) {
        highlights.push({ i: Math.floor(Math.random() * lines.length), t0: time, dur: rand(1.2, 2.6) });
        nextHighlight = time + rand(0.4, 1.6) / eventRate;
      }
      if (time > nextTraveller && travellers.length < 2) {
        travellers.push({ t0: time, dur: rand(5, 9), width: rand(3, 6) });
        nextTraveller = time + rand(4, 10) / eventRate;
      }

      for (let k = ripples.length - 1; k >= 0; k--)    if (time - ripples[k].t0 > ripples[k].dur) ripples.splice(k, 1);
      for (let k = highlights.length - 1; k >= 0; k--) if (time - highlights[k].t0 > highlights[k].dur) highlights.splice(k, 1);
      for (let k = travellers.length - 1; k >= 0; k--) if (time - travellers[k].t0 > travellers[k].dur) travellers.splice(k, 1);
    }

    // Cursor field settings (scale with the box so it feels the same on any size)
    function fieldParams() {
      const base = Math.min(W, H);
      return {
        radius: base * 0.42,   // influence radius (px)
        strength: base * 0.22, // max displacement (px)
      };
    }

    function render(t) {
      const time = t * 0.001;
      const { radius, strength } = fieldParams();
      const r2 = radius * radius;
      const mx = mouse.x, my = mouse.y;
      const speed = Math.hypot(mouse.vx, mouse.vy);
      // Push direction = where the cursor is heading; falls back to radial.
      const dirX = speed > 0.01 ? mouse.vx / speed : 0;
      const dirY = speed > 0.01 ? mouse.vy / speed : 0;
      const push = Math.min(1, speed / 18) * 0.7 + 0.3; // faster mouse = stronger
      // Motion amplitude scales with the box so it looks the same at any size.
      const amp = Math.min(W, H) * 0.075 * cssNum('--wave-motion', 1);
      updateEvents(time);

      // Precompute ripple ring parameters for this frame.
      const rip = ripples.map((r) => {
        const u = (time - r.t0) / r.dur;              // 0..1 lifetime
        const ringR = r.radius * u;                    // expanding radius
        const ringW = r.radius * 0.28;                 // ring thickness
        const fade = Math.sin(Math.PI * u);            // in/out
        return { x: r.x, y: r.y, ringR, ringW, k: r.strength * fade };
      });

      // Per-line colour intensity (0 = base, 1 = highlight colour).
      const lineHi = new Float32Array(lines.length);
      for (const h of highlights) {
        lineHi[h.i] = Math.max(lineHi[h.i], easeOutBump((time - h.t0) / h.dur));
      }
      for (const tr of travellers) {
        const u = (time - tr.t0) / tr.dur;
        const centre = -tr.width + u * (lines.length + tr.width * 2); // sweeps L->R
        const lo = Math.max(0, Math.floor(centre - tr.width)), hiI = Math.min(lines.length - 1, Math.ceil(centre + tr.width));
        for (let i = lo; i <= hiI; i++) {
          const f = 1 - Math.abs(i - centre) / tr.width;
          if (f > 0) lineHi[i] = Math.max(lineHi[i], f * f * 0.9);
        }
      }

      for (let i = 0; i < lines.length; i++) {
        const { el, pts } = lines[i];
        let d = '';
        // Traveller lines also get a slight extra lean so the pulse reads as motion.
        const lean = lineHi[i] * amp * 0.25;
        for (let j = 0; j < pts.length; j++) {
          const p = pts[j];

          // 1) continuous wave motion:
          //    two travelling sine bands (rolling up/down the lines, phase shifts
          //    across x so crests sweep diagonally) + two noise octaves for an
          //    organic, non-repeating feel. Reduced-motion users get a frozen frame.
          const tm = staticOnly ? 0 : time;
          // Negative x-phase (ox*k - t*v) makes crests travel LEFT -> RIGHT.
          const w1 = Math.sin(p.ox * 0.006 - tm * 1.4 + p.oy * 0.010);          // main swell, sweeps right
          const w2 = Math.sin(p.ox * 0.013 - tm * 0.9 + p.oy * 0.020 + 1.3);    // smaller ripple, also right
          const w3 = Math.sin(p.oy * 0.016 + tm * 0.6);                         // gentle vertical roll
          const n1 = noise2(p.ox * 0.0035 - tm * 0.35, p.oy * 0.0045 + tm * 0.15) - 0.5; // noise drifts right too
          const n2 = noise2(p.ox * 0.011 - tm * 0.2, p.oy * 0.013 + tm * 0.25) - 0.5;
          const nx = (w1 * 0.65 + w2 * 0.3 + w3 * 0.2) * amp + (n1 * 0.8 + n2 * 0.25) * amp;
          const ny = (w1 * 0.18 + w3 * 0.12) * amp + n1 * amp * 0.25;

          // 2) cursor deformation with smooth falloff
          let cx = 0, cy = 0;
          if (cursorEnabled && mouse.inside) {
            const dx = p.ox - mx, dy = p.oy - my;
            const dist2 = dx * dx + dy * dy;
            if (dist2 < r2) {
              const dist = Math.sqrt(dist2);
              const f = 1 - dist / radius;
              const infl = f * f * (3 - 2 * f) * strength * push; // smoothstep falloff
              // blend radial push (away from cursor) with directional drag
              const rx = dist > 0.5 ? dx / dist : 0, ry = dist > 0.5 ? dy / dist : 0;
              cx = (rx * 0.35 + dirX * 0.65) * infl;
              cy = (ry * 0.35 + dirY * 0.65) * infl * 0.6;
            }
          }

          // 3) random ripples: push outward along an expanding ring
          let rx2 = 0, ry2 = 0;
          for (let k = 0; k < rip.length; k++) {
            const r = rip[k];
            const dx = p.ox - r.x, dy = p.oy - r.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const band = 1 - Math.abs(dist - r.ringR) / r.ringW;
            if (band > 0 && dist > 0.5) {
              const s = band * band * (3 - 2 * band) * r.k;
              rx2 += (dx / dist) * s;
              ry2 += (dy / dist) * s * 0.6;
            }
          }

          p.x = p.ox + nx + cx + rx2 + lean;
          p.y = p.oy + ny + cy + ry2;
          d += (j === 0 ? 'M' : 'L') + p.x.toFixed(1) + ' ' + p.y.toFixed(1);
        }
        el.setAttribute('d', d);

        // Colour: only touch the attribute when it actually changes.
        const hi = lineHi[i];
        const q = Math.round(hi * 20) / 20; // quantise -> fewer style writes
        if (q !== lines[i].hi) {
          lines[i].hi = q;
          if (q === 0) {
            el.style.stroke = '';
            el.style.strokeWidth = '';
          } else {
            el.style.stroke = mixColour(q);
            el.style.strokeWidth = (cssNum('--wave-stroke-width', 1.15) + q * 0.9).toFixed(2);
          }
        }
      }
    }

    // --- mouse tracking (normalised to the wave box) -------------------
    if (cursorEnabled) {
      waveRoot.addEventListener('mousemove', (e) => {
        const rect = waveRoot.getBoundingClientRect();
        // normalised 0..1, then mapped to SVG units (viewBox == box px)
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        mouse.tx = nx * W;
        mouse.ty = ny * H;
        if (!mouse.inside) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
        mouse.inside = true;
      });
      waveRoot.addEventListener('mouseleave', () => {
        // keep eased position so the wave relaxes smoothly; just stop tracking
        mouse.inside = false;
      });
    }

    // --- animation loop ------------------------------------------------
    let waveRunning = false;
    let waveVisible = true;

    function frame(t) {
      if (!waveRunning) return;
      // ease cursor position; velocity decays when the cursor stops
      if (cursorEnabled) {
        const nx = mouse.x + (mouse.tx - mouse.x) * 0.14;
        const ny = mouse.y + (mouse.ty - mouse.y) * 0.14;
        mouse.vx = mouse.vx * 0.82 + (nx - mouse.x) * 0.9;
        mouse.vy = mouse.vy * 0.82 + (ny - mouse.y) * 0.9;
        mouse.x = nx; mouse.y = ny;
        // when the pointer has left, let the influence fade out
        if (!mouse.inside && Math.abs(mouse.vx) < 0.02 && Math.abs(mouse.vy) < 0.02) {
          mouse.tx = mouse.ty = -9999; // guarantees no residual field
        }
      }
      render(t);
      requestAnimationFrame(frame);
    }
    function start() {
      if (waveRunning || staticOnly) return;
      waveRunning = true;
      requestAnimationFrame(frame);
    }
    function stop() { waveRunning = false; }

    // Only animate while the hero is on screen and the tab is visible.
    new IntersectionObserver((entries) => {
      waveVisible = entries[0].isIntersecting;
      waveVisible && !document.hidden ? start() : stop();
    }, { threshold: 0.05 }).observe(waveRoot);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : (waveVisible && start());
    });

    // Rebuild on resize (debounced) so density and viewBox stay correct.
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    }, { passive: true });

    build();
    start();
  }
})();
