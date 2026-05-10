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

    // ── Two-layer scale: baseScale (auto fit-to-viewport) × userScale (zoom)
    let baseScale = 1;
    let userScale = 1;
    let panX = 0;     // translation in viewport px (post-scale)
    let panY = 0;
    const MIN_USER = 1;
    const MAX_USER = 8;

    // Stage uses transform-origin: center center already (set in slide-base.css).
    // To zoom around the cursor, we keep transform-origin fixed and emit a
    // translate component that compensates for the difference between
    // "where the cursor *was* in stage space" before/after scale change.
    function clampPan() {
      // Once zoomed in, allow the slide to be panned but don't let it leave
      // the viewport entirely. Limit translation to half the over-scale span,
      // i.e. how far the slide can move before its center reaches the edge.
      const W = window.innerWidth;
      const H = window.innerHeight;
      const sw = 1920 * baseScale * userScale;
      const sh = 1080 * baseScale * userScale;
      const maxX = Math.max(0, (sw - W) / 2 + W * 0.25);
      const maxY = Math.max(0, (sh - H) / 2 + H * 0.25);
      if (panX >  maxX) panX =  maxX;
      if (panX < -maxX) panX = -maxX;
      if (panY >  maxY) panY =  maxY;
      if (panY < -maxY) panY = -maxY;
    }
    function apply() {
      clampPan();
      const t = `translate(${panX}px, ${panY}px) scale(${baseScale * userScale})`;
      stage.style.transform = t;
    }

    function recomputeBase() {
      const W = window.innerWidth;
      const H = window.innerHeight;
      baseScale = Math.min(W / 1920, H / 1080) * 0.9;
      apply();
    }

    function resetUserZoom() {
      userScale = 1;
      panX = 0;
      panY = 0;
      stage.style.cursor = '';
      apply();
      notifyHud();
    }

    // ── Convert a viewport (clientX, clientY) to "stage-content" coordinates
    // i.e. the 1920×1080 internal frame, before transforms.
    // We need this to know "what point of the slide is under the cursor"
    // so we can keep that point fixed across a scale change.
    function clientToStage(clientX, clientY) {
      const rect = stage.getBoundingClientRect();
      const stageX = (clientX - rect.left) / (baseScale * userScale);
      const stageY = (clientY - rect.top) / (baseScale * userScale);
      return { x: stageX, y: stageY };
    }

    // ── Wheel-based zoom around cursor
    function onWheel(evt) {
      if (!(evt.ctrlKey || evt.metaKey)) return;
      evt.preventDefault();
      evt.stopPropagation();

      const beforeScale = baseScale * userScale;

      // Multiplicative step. Browser deltas vary wildly across devices;
      // exp(-deltaY / 500) gives a smooth feel from trackpad to chunky wheel.
      const factor = Math.exp(-evt.deltaY / 500);
      let newUser = userScale * factor;
      newUser = Math.min(MAX_USER, Math.max(MIN_USER, newUser));
      if (newUser === userScale) return;

      // Cursor position relative to stage's top-left, in viewport px
      const rect = stage.getBoundingClientRect();
      const cx = evt.clientX - rect.left;   // includes current panX already
      const cy = evt.clientY - rect.top;

      // We want the point under the cursor to stay fixed.
      // After: newRect.left = oldRect.left + (oldScale - newScale) * stage.width/2 ...
      // Simpler: adjust panX/panY so that
      //   (cursor - newCenter) / newScale == (cursor - oldCenter) / oldScale
      // Since transform-origin is center center, the math reduces to:
      //   delta_pan = cursor_offset_from_rect_center * (1 - newScale/oldScale)
      const afterScale = baseScale * newUser;
      const ratio = afterScale / beforeScale;

      // Cursor offset from current rect center
      const cxFromCenter = cx - rect.width / 2;
      const cyFromCenter = cy - rect.height / 2;

      panX -= cxFromCenter * (ratio - 1);
      panY -= cyFromCenter * (ratio - 1);

      userScale = newUser;
      stage.style.cursor = userScale > 1 ? 'grab' : '';
      apply();
      notifyHud();
    }

    // ── Drag-to-pan (only active when zoomed in)
    let dragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panStartX = 0;
    let panStartY = 0;

    function onPointerDown(evt) {
      if (userScale <= 1) return;
      if (evt.button !== 0) return;
      dragging = true;
      dragStartX = evt.clientX;
      dragStartY = evt.clientY;
      panStartX = panX;
      panStartY = panY;
      stage.style.cursor = 'grabbing';
      stage.setPointerCapture && stage.setPointerCapture(evt.pointerId);
      evt.preventDefault();
    }
    function onPointerMove(evt) {
      if (!dragging) return;
      panX = panStartX + (evt.clientX - dragStartX);
      panY = panStartY + (evt.clientY - dragStartY);
      apply();
    }
    function onPointerUp(evt) {
      if (!dragging) return;
      dragging = false;
      stage.style.cursor = userScale > 1 ? 'grab' : '';
      stage.releasePointerCapture && stage.releasePointerCapture(evt.pointerId);
    }

    // ── Keyboard: 0 to reset, +/- to zoom in/out at center
    function onKey(evt) {
      if (evt.ctrlKey || evt.metaKey || evt.altKey) return;
      if (evt.key === '0') {
        resetUserZoom();
        evt.preventDefault();
      } else if (evt.key === '=' || evt.key === '+') {
        zoomAtCenter(1.25);
        evt.preventDefault();
      } else if (evt.key === '-' || evt.key === '_') {
        zoomAtCenter(0.8);
        evt.preventDefault();
      }
    }
    function zoomAtCenter(factor) {
      const newUser = Math.min(MAX_USER, Math.max(MIN_USER, userScale * factor));
      if (newUser === userScale) return;
      // Center zoom: cursor offset is 0 → no pan adjustment needed
      userScale = newUser;
      stage.style.cursor = userScale > 1 ? 'grab' : '';
      apply();
      notifyHud();
    }

    // ── HUD readout: tell parent deck (or self if standalone) the zoom level
    function notifyHud() {
      const pct = Math.round(baseScale * userScale * 100);
      const userPct = Math.round(userScale * 100);
      try {
        if (window.parent !== window) {
          window.parent.postMessage(
            { type: 'deck:zoom', userScale: userScale, percent: userPct },
            '*'
          );
        }
      } catch (_) {}
      // Optional: stamp into a local element if present
      const el = document.querySelector('.zoom-readout');
      if (el) el.textContent = userScale > 1 ? userPct + '%' : '';
    }

    // ── External API: deck calls this on slide change to reset zoom
    window.__slideResetZoom = resetUserZoom;

    recomputeBase();
    window.addEventListener('resize', recomputeBase);

    // Listen for ctrl+wheel on the document so that wherever the cursor is,
    // it works. Capture phase so we beat slide-bridge's wheel handler that
    // would otherwise forward non-ctrl wheels to the parent for paging.
    document.addEventListener('wheel', onWheel, { passive: false, capture: true });

    // Pointer events for drag-pan
    stage.addEventListener('pointerdown', onPointerDown);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerup', onPointerUp);
    stage.addEventListener('pointercancel', onPointerUp);

    // Keyboard shortcuts (slide-bridge already filters these to nav keys,
    // so 0/+/- are still ours)
    document.addEventListener('keydown', onKey);

    // Sandwich-flow body layout — runs once after fonts ready, then on resize
    // (and after any DOM mutation a slide cares about — slides can call
    //  SlideBase.layoutBody() manually if they swap content dynamically).
    function maybeLayoutBody() {
      if (document.querySelector('.slide-body')) layoutBody();
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(maybeLayoutBody);
    } else {
      window.addEventListener('load', maybeLayoutBody);
    }
    // Initial kick (fonts may already be ready)
    maybeLayoutBody();
    window.addEventListener('resize', maybeLayoutBody);
  }

  /* ────────────────────────────────────────────────────────────
     layoutBody() — gap-as-min-value algorithm.

     For each .slide-body element on the page, measure the natural
     heights of slide-header, synthesis, slide-footer, then assign
     edge gap (top/bottom anchors) and body gap such that:
       - if content fits at IDEAL gap → use IDEAL
       - if it overflows → reduce edge first toward MIN, then body
       - if even all-MIN doesn't fit → mark .is-overflow

     Pages don't write absolute top/height numbers any more; this
     function does it for them at runtime.
     ──────────────────────────────────────────────────────────── */
  const LAYOUT = {
    SLIDE_HEIGHT:   1080,
    HEADER_OFFSET:  64,    // top of slide-header inside slide
    FOOTER_OFFSET:  36,    // bottom of slide-footer inside slide
    BODY_BOTTOM_PAD: 14,   // breathing space between body and synthesis
    GAP_IDEAL: 48,         // sp-7 — preferred gap when slack allows
    GAP_MIN:   8,          // sp-2 — floor below which we don't go
  };

  function layoutBody() {
    const bodies = document.querySelectorAll('.slide-body');
    bodies.forEach(layoutSingleBody);
  }

  function layoutSingleBody(body) {
    const slide   = body.closest('.slide') || body.parentElement;
    if (!slide) return;
    const header  = slide.querySelector('.slide-header');
    // Bottom-anchored content can be a .synthesis claim OR any element
    // marked with [data-bottom-anchor]. The latter is for pages where
    // the bottom region is structurally different from the standard
    // claim band (e.g. a multi-column band, a table row, a CAS-trait
    // strip). Both are treated as "fixed" height the body must clear.
    const claim   = slide.querySelector('.synthesis, [data-bottom-anchor]');
    const footer  = slide.querySelector('.slide-footer');

    const headerH = header  ? header.offsetHeight  : 0;
    const claimH  = (claim && !claim.hidden) ? claim.offsetHeight : 0;
    const footerH = footer  ? footer.offsetHeight  : 0;

    const fixed = LAYOUT.HEADER_OFFSET + headerH +
                  LAYOUT.FOOTER_OFFSET + footerH +
                  claimH + LAYOUT.BODY_BOTTOM_PAD;

    body.classList.remove('is-overflow');

    // Helper to apply a candidate (edge, body-gap) pair
    function applyGaps(edge, gapBody) {
      body.style.top    = (LAYOUT.HEADER_OFFSET + headerH + edge) + 'px';
      body.style.bottom = (LAYOUT.FOOTER_OFFSET + footerH + claimH +
                           edge + LAYOUT.BODY_BOTTOM_PAD) + 'px';
      body.style.setProperty('--gap-body', gapBody + 'px');
      body.offsetHeight; // force reflow
    }

    // Try IDEAL
    let edge = LAYOUT.GAP_IDEAL;
    let gapBody = LAYOUT.GAP_IDEAL;
    applyGaps(edge, gapBody);

    let available = LAYOUT.SLIDE_HEIGHT - fixed - 2 * edge;
    let natural   = body.scrollHeight;

    if (natural <= available) {
      // Fits at ideal — done.
      return;
    }

    // Overflow case. Pay shortage down by lowering edge first.
    let shortage = natural - available;
    const edgeRoom = (LAYOUT.GAP_IDEAL - LAYOUT.GAP_MIN) * 2;

    if (shortage <= edgeRoom) {
      edge = LAYOUT.GAP_IDEAL - Math.ceil(shortage / 2);
      edge = Math.max(LAYOUT.GAP_MIN, edge);
      applyGaps(edge, gapBody);
      natural = body.scrollHeight;
      if (natural <= LAYOUT.SLIDE_HEIGHT - fixed - 2 * edge) return;
      shortage = natural - (LAYOUT.SLIDE_HEIGHT - fixed - 2 * edge);
    } else {
      edge = LAYOUT.GAP_MIN;
      shortage -= edgeRoom;
    }

    // Lower body gap.
    gapBody = LAYOUT.GAP_IDEAL - shortage;
    gapBody = Math.max(LAYOUT.GAP_MIN, gapBody);
    applyGaps(edge, gapBody);
    natural = body.scrollHeight;

    if (natural > LAYOUT.SLIDE_HEIGHT - fixed - 2 * edge + 1) {
      body.classList.add('is-overflow');
    }
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

  /* ────────────────────────────────────────────────────────────
     autoScaleStaticSvg(svg)

     Make a static (hand-authored) SVG render at 1:1 with its
     container, so font-size declarations in CSS produce the exact
     physical pixel sizes you wrote (e.g. font-size: 12 → 12 physical px
     on the slide stage).

     The SVG must declare its design viewBox in `data-design-vb` —
     four space-separated numbers "x y w h". Coordinates inside SVG
     children (<text x>, <line x1 x2 y1 y2>, <circle cx cy r>, etc.)
     are written in that design coordinate system, but get rescaled
     to fit the actual container size on load. Only geometry attrs
     are rescaled — font-size, stroke-width, etc. are left alone so
     the visual size of strokes and glyphs matches the rest of the
     deck.

     Usage in a slide:
       <svg data-design-vb="0 0 720 180">…</svg>
       <script>SlideBase.autoScaleStaticSvg(document.querySelector('svg.matrix'));</script>

     If the design viewBox aspect ratio differs from the container
     aspect ratio, the longer axis gets centred (preserveAspectRatio
     meet semantics).
     ──────────────────────────────────────────────────────────── */
  function autoScaleStaticSvg(svg) {
    if (!svg) return;
    const designStr = svg.getAttribute('data-design-vb');
    if (!designStr) {
      console.warn('[SlideBase] autoScaleStaticSvg: SVG missing data-design-vb attribute');
      return;
    }
    const parts = designStr.trim().split(/\s+/).map(Number);
    if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) {
      console.warn('[SlideBase] autoScaleStaticSvg: invalid data-design-vb', designStr);
      return;
    }
    const [, , designW, designH] = parts;

    /* Container's *intrinsic* pixel size (untransformed). The page
       stage uses transform: scale(), but the SVG's parent stays in
       the 1920×1080 stage coordinate system, so offsetWidth on it
       returns stage-px (= physical px when the stage is rendered 1:1
       at viewport, or scaled in lockstep with everything else). */
    const parent = svg.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    if (!w || !h) {
      // parent has no resolved size yet — try again on next frame.
      requestAnimationFrame(() => autoScaleStaticSvg(svg));
      return;
    }

    /* Pick a uniform scale = min, mimicking preserveAspectRatio meet,
       so SVG text/circles keep their aspect ratio. */
    const k = Math.min(w / designW, h / designH);

    /* Centring offsets — after scaling, the design content occupies
       designW*k × designH*k. The container is w × h. Centre the
       content by shifting half the leftover space. (This restores
       what xMidYMid meet would have done if viewBox stayed equal to
       the design size, but we set viewBox to the container size so
       fonts in CSS px render at their authored physical pixel size.) */
    const centreX = (w - designW * k) / 2;
    const centreY = (h - designH * k) / 2;

    /* Plus optional manual nudge via data-shift-x / data-shift-y. */
    const shiftX = centreX + (parseFloat(svg.getAttribute('data-shift-x') || '0') || 0);
    const shiftY = centreY + (parseFloat(svg.getAttribute('data-shift-y') || '0') || 0);

    /* Geometry attributes to rescale on each child element. */
    const X_ATTRS = ['x', 'x1', 'x2', 'cx'];
    const Y_ATTRS = ['y', 'y1', 'y2', 'cy'];
    const ATTRS = ['r', 'rx', 'ry', 'width', 'height'];

    /* Walk every descendant and rescale numeric geometry attrs. */
    const all = svg.querySelectorAll('*');
    function rescale(node, attr, offset) {
      const v = node.getAttribute(attr);
      if (v == null) return;
      const num = parseFloat(v);
      if (!Number.isFinite(num)) return;
      if (!/^-?\d*\.?\d+$/.test(v.trim())) return;
      node.setAttribute(attr, (num * k + offset).toFixed(2));
    }

    all.forEach(node => {
      /* Skip everything inside <defs> — gradients, patterns, masks
         use coordinates in their own space (objectBoundingBox or
         userSpaceOnUse), and rescaling them by k breaks the fills. */
      if (node.closest && node.closest('defs')) return;

      X_ATTRS.forEach(attr => rescale(node, attr, shiftX));
      Y_ATTRS.forEach(attr => rescale(node, attr, shiftY));
      ATTRS.forEach(attr => rescale(node, attr, 0));

      /* Rescale points= for <polyline>/<polygon> if present. */
      const pts = node.getAttribute('points');
      if (pts) {
        const scaled = pts.split(/[\s,]+/).filter(Boolean)
          .map(n => (parseFloat(n) * k).toFixed(2)).join(' ');
        node.setAttribute('points', scaled);
      }

      /* Rescale path d= absolute commands (M/L/H/V/C/S/Q/T/A) if present.
         Skip relative commands (lower-case) — they don't need scaling
         since they are deltas, but if you mix them this will under-scale.
         For most hand-authored SVGs in this deck, only M/L/A absolute
         coords are used in handcrafted paths. */
      const d = node.getAttribute('d');
      if (d) {
        const scaled = d.replace(/-?\d*\.?\d+/g, m => (parseFloat(m) * k).toFixed(2));
        node.setAttribute('d', scaled);
      }
    });

    /* Finally set viewBox = container px, so 1 SVG unit = 1 device px. */
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  }

  /* Auto-discover and process any SVG with [data-design-vb] on load. */
  function processDesignSvgs() {
    document.querySelectorAll('svg[data-design-vb]').forEach(autoScaleStaticSvg);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processDesignSvgs);
  } else {
    processDesignSvgs();
  }

  root.SlideBase = { fit, injectArrowDefs, layoutBody, autoScaleStaticSvg };
})(window);
