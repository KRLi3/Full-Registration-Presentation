Reveal.initialize({
  hash: true,
  slideNumber: true,
  width: 1920,
  height: 1080,
  margin: 0.08,
  minScale: 0.2,
  maxScale: 3.0,
  center: true,
  controls: false,
  mouseWheel: true
}).then(() => {
  createAlgorithmUsageChart();
  createParetoChart();
});
