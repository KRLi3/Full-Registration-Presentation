/* slide-base.js — shared scale-to-fit + arrow defs.
   Each slide calls SlideBase.fit() once and (optionally) SlideBase.injectDefs(svg). */
(function (root) {
  'use strict';

  // Auto-inject the deck bridge so slides forward nav events to the parent
  // deck via postMessage (works under file:// where same-origin iframe access
  // is blocked). slide-base.js sits next to slide-bridge.js in /assets.
  (function injectBridge() {
    if (root.top === root) return;
    if (root.__deckBridge) return;
    const cur = document.currentScript;
    if (!cur) return;
    const href = cur.getAttribute('src') || '';
    const bridgeHref = href.replace(/slide-base\.js(\?.*)?$/, 'slide-bridge.js$1');
    if (bridgeHref === href) return;
    const s = document.createElement('script');
    s.src = bridgeHref;
    s.async = false;
    (document.head || document.documentElement).appendChild(s);
  })();

  (function injectGlossary() {
    if (root.__deckGlossaryTooltips) return;
    const cur = document.currentScript;
    if (!cur) return;
    const href = cur.getAttribute('src') || '';
    const glossaryHref = href.replace(/slide-base\.js(\?.*)?$/, 'glossary-tooltips.js$1');
    if (glossaryHref === href) return;
    const s = document.createElement('script');
    s.src = glossaryHref;
    s.async = false;
    (document.head || document.documentElement).appendChild(s);
  })();

  function fit(stageId) {
    const stage = document.getElementById(stageId || 'stage');
    if (!stage) return;
    const apply = () => {
      const W = window.innerWidth;
      const H = window.innerHeight;
      const s = Math.min(W / 1920, H / 1080) * 0.9;
      stage.style.transform = `scale(${s})`;
    };
    apply();
    window.addEventListener('resize', apply);
  }

  /* SVG arrow markers — call once per <svg> that needs arrowheads.
     Mirrors the shapes used in 01-research-workflow. */
  function injectArrowDefs(svg) {
    const ns = 'http://www.w3.org/2000/svg';
    let defs = svg.querySelector('defs');
    if (!defs) {
      defs = document.createElementNS(ns, 'defs');
      svg.insertBefore(defs, svg.firstChild);
    }
    if (defs.querySelector('#arrowMain')) return;

    defs.insertAdjacentHTML('beforeend', `
      <marker id="arrowMain"   markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M1,1 L9,5 L1,9 L3,5 Z" fill="#1a2942"/>
      </marker>
      <marker id="arrowSoft"   markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M1,1 L9,5 L1,9 Z" fill="#44546c"/>
      </marker>
      <marker id="arrowLoop"   markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M1,1 L9,5 L1,9 Z" fill="#b07d2c"/>
      </marker>
      <marker id="arrowOnline" markerWidth="10" markerHeight="10" refX="9" refY="5" orient="auto" markerUnits="strokeWidth">
        <path d="M1,1 L9,5 L1,9 Z" fill="#8b2727"/>
      </marker>
    `);
  }

  root.SlideBase = { fit, injectArrowDefs };
})(window);
