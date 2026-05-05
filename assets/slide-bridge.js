/* slide-bridge.js — runs INSIDE each slide iframe. Forwards keydown / wheel
   to the parent deck via postMessage so navigation works under file:// where
   same-origin iframe access is blocked. Auto-runs on load.

   Optional opt-out: any element with [data-no-deck-wheel] or .no-deck-wheel
   in its ancestor chain swallows wheel locally instead of paging. */
(function () {
  'use strict';
  if (window.top === window) return;       // not in an iframe → standalone view
  if (window.__deckBridge) return;
  window.__deckBridge = true;

  const NAV_KEYS = new Set([
    'ArrowRight', 'ArrowLeft', 'PageDown', 'PageUp',
    'Home', 'End', ' ', 'f', 'F', 'o', 'O', 'Escape',
  ]);

  function send(msg) {
    try { window.parent.postMessage(msg, '*'); } catch (_) {}
  }

  // Receive page index/total from the parent and stamp it into any
  // .pageno element on the slide. The page can ship a placeholder
  // ("— 03 —") and we just overwrite it once we know the real index.
  function applyPageInfo(info) {
    const n = info.index + 1;
    const pad = (x) => String(x).padStart(2, '0');
    document.querySelectorAll('.pageno').forEach(el => {
      el.textContent = '— ' + pad(n) + ' —';
    });
  }
  let pendingInfo = null;
  window.addEventListener('message', evt => {
    const data = evt.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== 'deck:pageinfo') return;
    if (document.readyState === 'loading') {
      pendingInfo = data;
      document.addEventListener('DOMContentLoaded', () => applyPageInfo(pendingInfo));
    } else {
      applyPageInfo(data);
    }
  });

  window.addEventListener('keydown', evt => {
    if (!NAV_KEYS.has(evt.key)) return;
    if (evt.ctrlKey || evt.metaKey || evt.altKey) return;
    evt.preventDefault();
    send({ type: 'deck:key', key: evt.key });
  }, true);

  function isScrollableAncestor(el, dy) {
    let n = el;
    while (n && n.nodeType === 1 && n !== document.documentElement) {
      if (n.hasAttribute && (n.hasAttribute('data-no-deck-wheel') ||
                              n.classList && n.classList.contains('no-deck-wheel'))) {
        return true;
      }
      const cs = getComputedStyle(n);
      const oy = cs.overflowY;
      const canScroll = (oy === 'auto' || oy === 'scroll' || oy === 'overlay');
      if (canScroll && n.scrollHeight > n.clientHeight + 1) {
        if (dy > 0 && n.scrollTop + n.clientHeight < n.scrollHeight - 1) return true;
        if (dy < 0 && n.scrollTop > 0) return true;
      }
      n = n.parentNode;
    }
    return false;
  }

  window.addEventListener('wheel', evt => {
    if (evt.ctrlKey) return;
    const dy = evt.deltaY;
    if (Math.abs(dy) < 1) return;
    if (evt.target && evt.target.nodeType === 1 && isScrollableAncestor(evt.target, dy)) {
      return;
    }
    evt.preventDefault();
    send({ type: 'deck:wheel', dy: dy });
  }, { passive: false, capture: true });
})();
