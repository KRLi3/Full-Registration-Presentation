function createParetoChart() {
  const el = document.getElementById('pareto-chart');
  if (!el) return;

  const A = { x: 2, y: 7 };
  const B = { x: 6, y: 4 };

  const paretoPlugin = {
    id: 'paretoAnnotations',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      const { left, right, top, bottom } = chartArea;

      const pA = { x: xScale.getPixelForValue(A.x), y: yScale.getPixelForValue(A.y) };
      const pB = { x: xScale.getPixelForValue(B.x), y: yScale.getPixelForValue(B.y) };

      ctx.save();

      const arrowLen = 10;
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(left, top - 2);
      ctx.lineTo(left - arrowLen * 0.5, top + arrowLen);
      ctx.lineTo(left + arrowLen * 0.5, top + arrowLen);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(right + 2, bottom);
      ctx.lineTo(right - arrowLen, bottom - arrowLen * 0.5);
      ctx.lineTo(right - arrowLen, bottom + arrowLen * 0.5);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px "Segoe UI"';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('f\u2081', left - 10, top - 10);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('f\u2082', right + 14, bottom + 6);

      ctx.strokeStyle = '#EF5350';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pA.x, top);
      ctx.lineTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.lineTo(right, pB.y);
      ctx.stroke();

      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = 'rgba(129,199,132,0.5)';
      ctx.lineWidth = 1.5;

      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(left, pA.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pB.x, pB.y); ctx.lineTo(left, pB.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pA.x, pA.y); ctx.lineTo(pA.x, bottom); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pB.x, pB.y); ctx.lineTo(pB.x, bottom); ctx.stroke();

      ctx.setLineDash([]);

      const bracketX = left + 28;
      ctx.strokeStyle = 'rgba(129,199,132,0.7)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(bracketX, pA.y);
      ctx.lineTo(bracketX, pB.y);
      ctx.stroke();
      drawArrow(ctx, bracketX, pA.y, -Math.PI / 2, 7);
      drawArrow(ctx, bracketX, pB.y, Math.PI / 2, 7);

      const bracketY = bottom - 28;
      ctx.beginPath();
      ctx.moveTo(pA.x, bracketY);
      ctx.lineTo(pB.x, bracketY);
      ctx.stroke();
      drawArrow(ctx, pA.x, bracketY, Math.PI, 7);
      drawArrow(ctx, pB.x, bracketY, 0, 7);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 26px "Segoe UI"';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText('A', pA.x - 26, pA.y - 14);
      ctx.textBaseline = 'top';
      ctx.fillText('B', pB.x + 26, pB.y + 14);

      ctx.fillStyle = 'rgba(129,199,132,0.95)';
      ctx.font = '17px "Segoe UI"';

      ctx.save();
      ctx.translate(bracketX - 16, (pA.y + pB.y) / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('f\u2081(A) > f\u2081(B)', 0, 0);
      ctx.restore();

      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText('f\u2082(B) > f\u2082(A)', (pA.x + pB.x) / 2, bracketY + 10);

      ctx.restore();
    }
  };

  new Chart(el, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Pareto-optimal',
          data: [A, B],
          backgroundColor: '#4CAF50',
          borderColor: '#2E7D32',
          borderWidth: 2.5,
          pointRadius: 20,
          pointHoverRadius: 22,
          pointStyle: 'rect',
        },
        {
          label: 'Dominated',
          data: [
            { x: 3.5, y: 9.2 },
            { x: 5, y: 8.5 },
            { x: 6.5, y: 7.8 },
            { x: 7.5, y: 6.5 },
            { x: 9, y: 5.5 },
            { x: 9.2, y: 3.5 },
          ],
          backgroundColor: '#BDBDBD',
          borderColor: '#888',
          borderWidth: 2,
          pointRadius: 17,
          pointHoverRadius: 19,
          pointStyle: 'rect',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1,
      layout: { padding: { left: 20, bottom: 45, top: 40, right: 40 } },
      scales: {
        x: {
          title: { display: false },
          min: 0,
          max: 10.5,
          ticks: { color: '#999', stepSize: 2, callback: (v) => v <= 10 ? v : '' },
          grid: { color: 'rgba(255,255,255,0.05)' },
          border: { color: 'rgba(255,255,255,0.3)' },
        },
        y: {
          title: { display: false },
          min: 0,
          max: 10.5,
          ticks: { color: '#999', stepSize: 2, callback: (v) => v <= 10 ? v : '' },
          grid: { color: 'rgba(255,255,255,0.05)' },
          border: { color: 'rgba(255,255,255,0.3)' },
        },
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#ddd', usePointStyle: true, font: { size: 14 }, padding: 20 },
        },
        tooltip: {
          callbacks: {
            label: (item) => `(f\u2082=${item.parsed.x}, f\u2081=${item.parsed.y})`,
          },
        },
      },
    },
    plugins: [paretoPlugin],
  });
}

function drawArrow(ctx, x, y, angle, size) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, -size * 0.5);
  ctx.moveTo(0, 0);
  ctx.lineTo(-size, size * 0.5);
  ctx.stroke();
  ctx.restore();
}
