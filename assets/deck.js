(function () {
  'use strict';

  const SLIDES = [
    { id: 'title',                     name: 'Title' },
    { id: 'introduction',              name: 'Introduction' },
    { id: '00-framework-overview',     name: 'Framework overview' },
    { id: 'demos-pareto',              name: 'Primer · Pareto' },
    { id: 'demos-ml',                  name: 'Primer · Surrogate' },
    { id: '01-research-workflow',      name: 'Research workflow' },
    { id: '02-why-saea',               name: 'Why SAEA' },
    { id: '03-surrogate-spectrum',     name: 'Surrogate spectrum' },
    { id: '04-acquisition-strategies', name: 'Acquisition' },
    { id: '05-moo-algorithms',         name: 'MOO algorithms' },
    { id: '06-coordination-contract',  name: 'Coordination contract' },
    { id: '08-literature-landscape',   name: 'Literature landscape' },
    { id: '07-roadmap',                name: 'Roadmap' },
  ];

  const total = SLIDES.length;
  let idx = 0;

  const frame = document.getElementById('slide-frame');
  const loading = document.getElementById('deck-loading');
  const hud = document.getElementById('deck-hud');
  const progress = document.getElementById('deck-progress');
  const counterNow = document.querySelector('#deck-counter .now');
  const counterTotal = document.querySelector('#deck-counter .total');
  const counterName = document.getElementById('deck-counter-name');
  const overview = document.getElementById('deck-overview');
  const overviewGrid = document.getElementById('deck-overview-grid');

  function pageUrl(i) {
    return 'pages/' + SLIDES[i].id + '/index.html';
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function load(i, smooth) {
    if (i < 0) i = 0;
    if (i >= total) i = total - 1;
    idx = i;

    if (smooth) {
      frame.classList.add('swap');
      loading.classList.add('show');
      setTimeout(doLoad, 160);
    } else {
      doLoad();
    }

    function doLoad() {
      frame.src = pageUrl(idx);
      frame.onload = () => {
        frame.classList.remove('swap');
        loading.classList.remove('show');
        try { window.focus(); } catch (_) {}
        try {
          frame.contentWindow.postMessage(
            { type: 'deck:pageinfo', index: idx, total: total, name: SLIDES[idx].name },
            '*'
          );
        } catch (_) {}
      };
      updateHud();
      updateHash();
    }
  }

  function updateHud() {
    if (counterNow) counterNow.textContent = pad(idx + 1);
    if (counterTotal) counterTotal.textContent = pad(total);
    if (counterName) counterName.textContent = SLIDES[idx].name;
    if (progress) {
      const pct = total > 1 ? (idx / (total - 1)) * 100 : 0;
      progress.style.setProperty('--progress', pct + '%');
    }
  }

  function updateHash() {
    const newHash = '#' + (idx + 1);
    if (location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  function readHash() {
    const m = location.hash.match(/^#(\d+)$/);
    if (!m) return 0;
    const n = parseInt(m[1], 10) - 1;
    if (Number.isNaN(n)) return 0;
    return Math.max(0, Math.min(total - 1, n));
  }

  function next() { load(idx + 1, true); }
  function prev() { load(idx - 1, true); }
  function first() { load(0, true); }
  function last() { load(total - 1, true); }

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  }

  function toggleOverview() {
    if (!overview) return;
    if (overview.classList.contains('show')) {
      overview.classList.remove('show');
    } else {
      buildOverview();
      overview.classList.add('show');
    }
  }

  function buildOverview() {
    if (!overviewGrid) return;
    if (overviewGrid.dataset.built === '1') {
      // refresh "current" highlight
      overviewGrid.querySelectorAll('.deck-thumb').forEach((el, i) => {
        el.classList.toggle('current', i === idx);
      });
      return;
    }
    overviewGrid.innerHTML = '';
    SLIDES.forEach((s, i) => {
      const thumb = document.createElement('button');
      thumb.className = 'deck-thumb' + (i === idx ? ' current' : '');
      thumb.type = 'button';
      thumb.addEventListener('click', () => {
        overview.classList.remove('show');
        load(i, true);
      });
      const ifr = document.createElement('iframe');
      ifr.src = pageUrl(i);
      ifr.tabIndex = -1;
      ifr.setAttribute('aria-hidden', 'true');
      thumb.appendChild(ifr);

      const label = document.createElement('div');
      label.className = 'deck-thumb-label';
      const tag = document.createElement('span');
      tag.textContent = pad(i + 1);
      const name = document.createElement('span');
      name.className = 'name';
      name.textContent = s.name;
      label.appendChild(tag);
      label.appendChild(name);
      thumb.appendChild(label);

      // Scale the iframe content to fit the thumb after it loads
      ifr.onload = () => {
        const rect = thumb.getBoundingClientRect();
        const scale = Math.min(rect.width / 1920, rect.height / 1080);
        ifr.style.transform = 'scale(' + scale + ')';
      };
      // Set initial scale based on element ratio (16:9, so width-bound)
      ifr.style.transform = 'scale(0.146)';

      overviewGrid.appendChild(thumb);
    });
    overviewGrid.dataset.built = '1';
  }

  // ────────────────────────────────────────────────────────────
  // Keyboard
  // ────────────────────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    // Ignore when overview is open EXCEPT Esc to close it
    if (overview && overview.classList.contains('show')) {
      if (e.key === 'Escape' || e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        overview.classList.remove('show');
      }
      return;
    }

    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault(); next(); break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault(); prev(); break;
      case 'Home':
        e.preventDefault(); first(); break;
      case 'End':
        e.preventDefault(); last(); break;
      case 'f':
      case 'F':
        e.preventDefault(); toggleFullscreen(); break;
      case 'o':
      case 'O':
      case 'Escape':
        e.preventDefault(); toggleOverview(); break;
    }
  });

  // Slides forward keydown / wheel via postMessage (slide-bridge.js inside
  // each slide). This is the same-origin-free path that works under file://.
  function handleKeyFromSlide(key) {
    if (overview && overview.classList.contains('show')) {
      if (key === 'Escape' || key === 'o' || key === 'O') {
        overview.classList.remove('show');
      }
      return;
    }
    switch (key) {
      case 'ArrowRight': case 'PageDown': case ' ': next(); break;
      case 'ArrowLeft':  case 'PageUp':            prev(); break;
      case 'Home':                                 first(); break;
      case 'End':                                  last(); break;
      case 'f': case 'F':                          toggleFullscreen(); break;
      case 'o': case 'O': case 'Escape':           toggleOverview(); break;
    }
  }

  window.addEventListener('message', evt => {
    const data = evt.data;
    if (!data || typeof data !== 'object') return;
    if (data.type === 'deck:key') handleKeyFromSlide(data.key);
    else if (data.type === 'deck:wheel') {
      if (overview && overview.classList.contains('show')) return;
      consumeWheel(data.dy);
    }
  });

  // ────────────────────────────────────────────────────────────
  // Mouse / touch
  // ────────────────────────────────────────────────────────────
  // Click on right half → next, left edge → prev (small zone, not in slide centre)
  document.addEventListener('click', e => {
    if (overview && overview.classList.contains('show')) return;
    if (e.target.closest('#deck-hud')) return;
    // No-op for now — clicking inside iframe content gets eaten by it.
    // Use keyboard or HUD buttons instead.
  });

  // ────────────────────────────────────────────────────────────
  // Wheel / trackpad — page on scroll, with cooldown.
  // Skips when the cursor is inside an element marked
  // [data-no-deck-wheel] / .no-deck-wheel, or inside any ancestor
  // that is genuinely scrollable in the wheel's direction.
  // ────────────────────────────────────────────────────────────
  const WHEEL_COOLDOWN = 300;   // ms between page flips
  const WHEEL_THRESHOLD = 10;   // ignore tiny trackpad jitter
  let wheelLockUntil = 0;
  let wheelAccum = 0;
  let wheelAccumResetAt = 0;

  function isScrollableAncestor(el, dy) {
    let n = el;
    while (n && n.nodeType === 1 && n !== n.ownerDocument.documentElement) {
      if (n.hasAttribute && (n.hasAttribute('data-no-deck-wheel') ||
                              n.classList.contains('no-deck-wheel'))) {
        return true;
      }
      const cs = n.ownerDocument.defaultView.getComputedStyle(n);
      const oy = cs.overflowY;
      const canScrollY = (oy === 'auto' || oy === 'scroll' || oy === 'overlay');
      if (canScrollY && n.scrollHeight > n.clientHeight + 1) {
        if (dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
        if (dy < 0 && n.scrollTop > 0) return true;
      }
      n = n.parentNode;
      if (n && n.host) n = n.host;
    }
    return false;
  }

  function consumeWheel(dy) {
    const now = Date.now();
    if (now < wheelLockUntil) return;
    if (now > wheelAccumResetAt) wheelAccum = 0;
    wheelAccum += dy;
    wheelAccumResetAt = now + 260;
    if (Math.abs(wheelAccum) < WHEEL_THRESHOLD) return;
    wheelLockUntil = now + WHEEL_COOLDOWN;
    if (wheelAccum > 0) next(); else prev();
    wheelAccum = 0;
  }

  function handleWheel(evt) {
    if (overview && overview.classList.contains('show')) return;
    if (evt.ctrlKey) return;
    const dy = evt.deltaY;
    if (Math.abs(dy) < 1) return;
    const target = evt.target;
    if (target && target.nodeType === 1 && isScrollableAncestor(target, dy)) {
      return;
    }
    evt.preventDefault();
    consumeWheel(dy);
  }
  window.addEventListener('wheel', handleWheel, { passive: false, capture: true });

  // Touch swipe (mobile / trackpad)
  let touchStart = null;
  document.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  });
  document.addEventListener('touchend', e => {
    if (!touchStart || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      if (dx < 0) next(); else prev();
    }
    touchStart = null;
  });

  // ────────────────────────────────────────────────────────────
  // HUD — kept always visible (idle-hide caused users to lose
  // navigation cues; nav still works regardless of HUD state).
  // ────────────────────────────────────────────────────────────
  function showHud() {
    if (!hud) return;
    hud.classList.remove('idle');
  }

  // ────────────────────────────────────────────────────────────
  // Hash → slide on load + back/forward navigation
  // ────────────────────────────────────────────────────────────
  window.addEventListener('hashchange', () => {
    const h = readHash();
    if (h !== idx) load(h, true);
  });

  // ────────────────────────────────────────────────────────────
  // Boot
  // ────────────────────────────────────────────────────────────
  load(readHash(), false);
  showHud();
})();
