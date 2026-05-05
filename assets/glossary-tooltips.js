(function () {
  'use strict';

  if (window.__deckGlossaryTooltips) return;
  window.__deckGlossaryTooltips = true;

  const TERMS = {
    'CAS': 'Complex Adaptive Systems: a lens for adaptation, feedback and emergence in this thesis.',
    'RQ': 'Research question.',
    'SAEA': 'Surrogate-Assisted Evolutionary Algorithm: an EA that uses cheap model predictions to reduce expensive simulations.',
    'MOO': 'Multi-Objective Optimisation: optimisation with two or more competing objectives.',
    'MO': 'Multi-objective.',
    'MOEA': 'Multi-Objective Evolutionary Algorithm.',
    'EA': 'Evolutionary Algorithm: population-based search using selection and variation.',
    'GA': 'Genetic Algorithm: an evolutionary algorithm inspired by selection and recombination.',
    'BO': 'Bayesian Optimisation: surrogate-based optimisation driven by an acquisition function.',
    'TPE': 'Tree-structured Parzen Estimator: a Bayesian optimisation method used by Hyperopt/Optuna-style workflows.',
    'GP': 'Gaussian Process: Bayesian regression model with predictive mean and uncertainty.',
    'KRG': 'Kriging: Gaussian-process-style surrogate model, used here as the accuracy anchor.',
    'SSGP': 'Sparse Spectrum Gaussian Process: random-feature GP approximation with fast retraining.',
    'ELM': 'Extreme Learning Machine: single-hidden-layer model fitted mostly by closed-form linear solve.',
    'MLP': 'Multi-Layer Perceptron: feed-forward neural network.',
    'DNN': 'Deep Neural Network.',
    'XGBoost': 'Gradient-boosted decision-tree library/model family.',
    'LHS': 'Latin Hypercube Sampling: space-filling initial design for simulation points.',
    'SMT': 'Surrogate Modeling Toolbox, used for several surrogate backends.',
    'NSGA-II': 'Non-dominated Sorting Genetic Algorithm II: rank plus crowding-distance selection.',
    'NSGA-III': 'NSGA variant using reference-point niching for many-objective problems.',
    'NSGA': 'Non-dominated Sorting Genetic Algorithm family.',
    'MOEA/D-DE': 'MOEA/D with differential-evolution variation operators.',
    'MOEA/D-EGO': 'MOEA/D combined with Efficient Global Optimisation style GP infill.',
    'MOEA/D': 'Multi-Objective Evolutionary Algorithm based on Decomposition.',
    'RVEA': 'Reference Vector Guided Evolutionary Algorithm.',
    'K-RVEA': 'Kriging-assisted RVEA.',
    'HK-RVEA': 'Heterogeneous Kriging-assisted RVEA.',
    'CSEA': 'Classification-based Surrogate-assisted Evolutionary Algorithm.',
    'SBX': 'Simulated Binary Crossover: common real-coded GA recombination operator.',
    'DE': 'Differential Evolution: mutation/crossover operator using vector differences.',
    'APD': 'Angle-Penalised Distance: RVEA metric combining convergence and angular diversity.',
    'PBI': 'Penalty Boundary Intersection: scalarising function used in decomposition-based MOEAs.',
    'EI': 'Expected Improvement: acquisition score balancing probability and amount of improvement.',
    'UCB': 'Upper Confidence Bound: acquisition score combining mean and uncertainty.',
    'GP-UCB': 'Gaussian-process UCB acquisition with regret-bound theory.',
    'EHVI': 'Expected Hypervolume Improvement: expected gain in dominated hypervolume.',
    'ParEGO': 'Pareto Efficient Global Optimisation: scalarises MOO into repeated EI subproblems.',
    'q-EI': 'Batch Expected Improvement for q candidates at once.',
    'q-EHVI': 'Batch Expected Hypervolume Improvement for q candidates at once.',
    'q-ParEGO': 'Batch ParEGO-style scalarised expected improvement.',
    'HV': 'Hypervolume: volume dominated by the Pareto set relative to a reference point.',
    'IGD': 'Inverted Generational Distance: distance from a reference Pareto set to the obtained set.',
    'RMSE': 'Root Mean Squared Error.',
    'MAE': 'Mean Absolute Error.',
    'CV': 'Cross-validation: holdout/leave-out estimate of prediction quality.',
    'PRESS': 'Predicted Residual Error Sum of Squares, often from leave-one-out validation.',
    'PRESS-LOO': 'PRESS computed with leave-one-out validation.',
    'LOO': 'Leave-one-out validation.',
    'ARD': 'Automatic Relevance Determination: separate length-scale/relevance per input dimension.',
    'BFGS': 'Quasi-Newton optimiser used for continuous hyperparameter fitting.',
    'L-BFGS': 'Limited-memory BFGS, a scalable quasi-Newton optimiser.',
    'RFF': 'Random Fourier Features: finite features approximating shift-invariant kernels.',
    'EM': 'Expectation-Maximisation: iterative latent-variable parameter estimation.',
    'KDE': 'Kernel Density Estimation.',
    'HPC': 'High-Performance Computing: parallel compute resources or cluster execution.',
    'CFD': 'Computational Fluid Dynamics.',
    'FEM': 'Finite Element Method.',
    'GH': 'Grasshopper, the Rhino visual-programming environment.',
    'PF': 'Pareto front: non-dominated objective-space boundary.',
    'ND': 'Non-dominated.',
    'ANN': 'Artificial Neural Network.',
    'BPNN': 'Back-Propagation Neural Network.',
    'LSSVM': 'Least-Squares Support Vector Machine.',
    'BIM-DB': 'Building Information Modelling database.',
    'LOD': 'Level of Detail.',
    'PV': 'Photovoltaic.',
    'TEVC': 'IEEE Transactions on Evolutionary Computation.',
    'GECCO': 'Genetic and Evolutionary Computation Conference.',
    'ACADIA': 'Association for Computer Aided Design in Architecture.',
    'eCAADe': 'Education and research in Computer Aided Architectural Design in Europe.',
    'IJAC': 'International Journal of Architectural Computing.',
    'Q1': 'First quartile journal ranking.',
    'Q2': 'Second quartile journal ranking.',
    'd': 'Number of design variables or input dimensions.',
    'm': 'Number of objectives.',
    'N': 'Population size or number of samples, depending on local context.',
    'N₀': 'Initial sample count before optimisation/infill begins.',
    'K': 'Batch size, cadence or number of selected candidates, depending on local context.',
    'q': 'Batch size in Bayesian optimisation: number of candidates proposed together.',
    'μ(x)': 'Predictive mean at design point x.',
    'μ': 'Predictive mean.',
    'σ²(x)': 'Predictive variance at design point x.',
    'σ²': 'Predictive variance or uncertainty.',
    'σ': 'Predictive standard deviation.',
    'θ': 'Model hyperparameter, often a kernel length-scale parameter.',
    'λ': 'Weight vector for scalarisation or decomposition.',
    'ξ': 'Exploration coefficient: larger values push acquisition or candidate choice toward more uncertain regions.',
    'τ': 'Threshold parameter.',
    'β': 'Strength or discount parameter.',
    'γ': 'Penalty/gain parameter.',
    'δ': 'Effect size or difference statistic, depending on local context.',
    'ℓ': 'Length-scale parameter.',
    'Ŷ': 'Predicted objective value.',
    'Y_true': 'True simulation/evaluation objective value.',
    'R²': 'Coefficient of determination.',
    'O(N³)': 'Cubic scaling with sample count N.',
    'ΔHV': 'Change or improvement in hypervolume.',
    'Gmax': 'Maximum generation count.',
    'freezeTheta': 'Ablation where GP/kernel hyperparameters are frozen instead of re-optimised.',
    'NoisyEI': 'Expected Improvement variant designed for noisy observations.',
    'MeanOnObserved': 'Prediction baseline computed on already observed/training points.',
    'ObservedY': 'Observed objective values from true evaluations.',
    'Tchebycheff': 'Scalarisation that minimises the maximum weighted objective deviation.',
    'crowding distance': 'NSGA-II diversity metric measuring local spacing along the front.',
    'reference points': 'Target directions/locations used to preserve diversity in many-objective search.',
    'non-dominated sort': 'Ranking by Pareto dominance layers.',
    'polynomial mutation': 'Real-coded mutation operator with a polynomial perturbation distribution.',
    'infill': 'New true simulations chosen to improve or update a surrogate model.',
    'Pareto': 'Set/front of solutions where no objective can improve without worsening another.',
    'Mann-Whitney': 'Non-parametric test comparing two distributions.',
    'Mann–Whitney': 'Non-parametric test comparing two distributions.',
    'Cliff’s δ': 'Non-parametric effect-size statistic.'
  };

  const SKIP_SELECTOR = [
    'script', 'style', 'svg', 'a', 'button', 'input', 'textarea', 'select', 'option',
    '.term-tip', '[data-tip]', '[data-no-glossary]', '#deck-hud', '#deck-overview'
  ].join(',');

  const sortedTerms = Object.keys(TERMS).sort((a, b) => b.length - a.length);
  const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    '(^|[^\\p{L}\\p{N}_])(' + sortedTerms.map(escapeRegExp).join('|') + ')(?=$|[^\\p{L}\\p{N}_])',
    'gu'
  );

  function injectStyle() {
    if (document.getElementById('deck-glossary-style')) return;
    const style = document.createElement('style');
    style.id = 'deck-glossary-style';
    style.textContent = `
      .term-tip {
        position: relative;
        display: inline;
        color: inherit;
        cursor: help;
        text-decoration-line: underline;
        text-decoration-style: dotted;
        text-decoration-thickness: 1px;
        text-underline-offset: 0.18em;
        text-decoration-color: rgba(139, 39, 39, 0.62);
      }
      .deck-glossary-card {
        position: fixed;
        left: 0;
        top: 0;
        z-index: 9999;
        width: max-content;
        max-width: 260px;
        transform: translate(-50%, -100%);
        opacity: 0;
        pointer-events: none;
        padding: 10px 12px 11px;
        background: var(--paper, #faf7ee);
        color: var(--ink, #1a2942);
        border: 1px solid var(--rule, #c7bfa9);
        border-top: 3px solid var(--accent, #8b2727);
        box-shadow: 0 14px 32px -18px rgba(26, 41, 66, 0.34);
        font-family: var(--body, "Inter Tight", sans-serif);
        font-size: 12px;
        font-weight: 400;
        letter-spacing: 0;
        line-height: 1.35;
        text-align: left;
        white-space: normal;
        transition: opacity 0.14s ease, transform 0.14s ease;
      }
      .deck-glossary-card::after {
        content: "";
        position: absolute;
        left: 50%;
        bottom: -5px;
        transform: translateX(-50%) rotate(45deg);
        width: 9px;
        height: 9px;
        background: var(--paper, #faf7ee);
        border-right: 1px solid var(--rule, #c7bfa9);
        border-bottom: 1px solid var(--rule, #c7bfa9);
      }
      .deck-glossary-card.show {
        opacity: 1;
        transform: translate(-50%, calc(-100% - 10px));
      }
      .term-tip:focus-visible {
        outline: 1px solid var(--accent, #8b2727);
        outline-offset: 2px;
      }
    `;
    document.head.appendChild(style);
  }

  let card = null;
  let activeTerm = null;

  function ensureCard() {
    if (card) return card;
    card = document.createElement('div');
    card.className = 'deck-glossary-card';
    card.setAttribute('role', 'tooltip');
    document.body.appendChild(card);
    return card;
  }

  function positionCard(target) {
    const c = ensureCard();
    const rect = target.getBoundingClientRect();
    c.style.left = `${rect.left + rect.width / 2}px`;
    c.style.top = `${rect.top - 10}px`;

    const cardRect = c.getBoundingClientRect();
    const margin = 12;
    const minX = margin + cardRect.width / 2;
    const maxX = window.innerWidth - margin - cardRect.width / 2;
    const x = Math.max(minX, Math.min(maxX, rect.left + rect.width / 2));
    const y = rect.top - 10 < cardRect.height + margin
      ? rect.bottom + cardRect.height + 20
      : rect.top - 10;

    c.style.left = `${x}px`;
    c.style.top = `${y}px`;
  }

  function showCard(target) {
    if (!target || !target.dataset || !target.dataset.tip) return;
    activeTerm = target;
    const c = ensureCard();
    c.textContent = target.dataset.tip;
    c.classList.add('show');
    positionCard(target);
  }

  function hideCard(target) {
    if (target && activeTerm && target !== activeTerm) return;
    activeTerm = null;
    if (card) card.classList.remove('show');
  }

  function bindCardEvents() {
    if (document.documentElement.dataset.glossaryBound === '1') return;
    document.documentElement.dataset.glossaryBound = '1';

    document.addEventListener('pointerover', (evt) => {
      const target = evt.target.closest && evt.target.closest('.term-tip');
      if (target) showCard(target);
    });
    document.addEventListener('pointerout', (evt) => {
      const target = evt.target.closest && evt.target.closest('.term-tip');
      if (target) hideCard(target);
    });
    document.addEventListener('focusin', (evt) => {
      if (evt.target.classList && evt.target.classList.contains('term-tip')) {
        showCard(evt.target);
      }
    });
    document.addEventListener('focusout', (evt) => {
      if (evt.target.classList && evt.target.classList.contains('term-tip')) {
        hideCard(evt.target);
      }
    });
    window.addEventListener('scroll', () => {
      if (activeTerm) positionCard(activeTerm);
    }, true);
    window.addEventListener('resize', () => {
      if (activeTerm) positionCard(activeTerm);
    });
  }

  function shouldSkip(textNode) {
    const parent = textNode.parentElement;
    if (!parent) return true;
    if (!textNode.nodeValue || !textNode.nodeValue.trim()) return true;
    return Boolean(parent.closest(SKIP_SELECTOR));
  }

  function wrapTextNode(textNode) {
    const value = textNode.nodeValue;
    pattern.lastIndex = 0;
    if (!pattern.test(value)) return;

    pattern.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let match;

    while ((match = pattern.exec(value)) !== null) {
      const prefix = match[1] || '';
      const term = match[2];
      const termStart = match.index + prefix.length;

      if (termStart > last) {
        frag.appendChild(document.createTextNode(value.slice(last, termStart)));
      }

      const span = document.createElement('span');
      span.className = 'term-tip';
      span.tabIndex = 0;
      span.dataset.tip = TERMS[term];
      span.textContent = term;
      frag.appendChild(span);
      last = termStart + term.length;
    }

    if (last < value.length) {
      frag.appendChild(document.createTextNode(value.slice(last)));
    }
    textNode.parentNode.replaceChild(frag, textNode);
  }

  function applyGlossary(root) {
    injectStyle();
    bindCardEvents();
    const walker = document.createTreeWalker(root || document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return shouldSkip(node) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapTextNode);
  }

  function boot() {
    if (!document.body) return;
    applyGlossary(document.body);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.DeckGlossary = { apply: applyGlossary, terms: TERMS };
})();
