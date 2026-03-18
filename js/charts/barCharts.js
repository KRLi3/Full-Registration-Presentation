function createAlgorithmUsageChart() {
  const ctx = document.getElementById('chart');
  if (!ctx) return;

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['NSGA-II', 'SPEA-2', 'MOEA/D', 'NSGA-III'],
      datasets: [{
        label: 'Number of Papers',
        data: [30, 5, 3, 2]
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true
    }
  });
}
