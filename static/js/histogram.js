document.addEventListener('DOMContentLoaded', () => {
  const chartEl = document.getElementById('histogram-chart');
  if (!chartEl || !window.HISTOGRAM_DATA) {
    return;
  }

  const datasetKey = 'vggt_unscenepairs_t';
  const dataset = window.HISTOGRAM_DATA[datasetKey];
  if (!dataset) {
    console.warn(`Histogram data for ${datasetKey} not found.`);
    return;
  }

  const xValues = dataset.kdeX || [];
  if (!xValues.length) {
    console.warn('No KDE data present.');
    return;
  }

  const toPercentData = (fractions, xs) =>
    xs.map((x, idx) => ({
      x,
      y: (fractions[idx] || 0) * 100,
    }));

  const baseCurve = toPercentData(dataset.baseKdeFractions || [], xValues);
  const ftCurve = toPercentData(dataset.finetunedKdeFractions || [], xValues);
  const peakPercent = Math.max(
    ...baseCurve.map((pt) => pt.y),
    ...ftCurve.map((pt) => pt.y),
  );
  const suggestedMax = Number.isFinite(peakPercent) ? peakPercent * 1.2 : undefined;

  const floatingImagesEl = document.getElementById('histogram-floating-images');
  const previewEls = {
    container: floatingImagesEl,
    img1: document.getElementById('histogram-preview-img1'),
    img2: document.getElementById('histogram-preview-img2'),
  };

  const bins = dataset.bins || [];
  // Build a sorted array of pairs by their finetuned error value
  const pairsByError = (dataset.pairs || [])
    .filter((pair) => typeof pair.finetunedError === 'number')
    .sort((a, b) => a.finetunedError - b.finetunedError);

  const setPreviewPair = (pair) => {
    if (!pair || !previewEls.container) {
      return;
    }
    previewEls.img1.src = pair.image1;
    previewEls.img2.src = pair.image2;
    previewEls.container.classList.add('visible');
    
    // Update info overlay
    const sceneNameEl = document.getElementById('histogram-scene-name');
    const gtAnglesEl = document.getElementById('histogram-gt-angles');
    const baseAnglesEl = document.getElementById('histogram-base-angles');
    const ftAnglesEl = document.getElementById('histogram-ft-angles');
    const formatAngles = (yaw, pitch) => {
      if (typeof yaw === 'number' && typeof pitch === 'number' && !Number.isNaN(yaw) && !Number.isNaN(pitch)) {
        return `${(-yaw).toFixed(0)}° / ${pitch.toFixed(0)}°`;
      }
      return '–';
    };
    
    if (sceneNameEl) {
      // Extract scene name from image path or use pair index
      const sceneName = pair.sceneName || `Pair ${pair.pairIdx}`;
      sceneNameEl.textContent = sceneName;
    }
    if (gtAnglesEl) {
      gtAnglesEl.textContent = formatAngles(pair.gtYaw, pair.gtPitch);
    }
    if (baseAnglesEl) {
      baseAnglesEl.textContent = formatAngles(pair.baseYaw, pair.basePitch);
    }
    if (ftAnglesEl) {
      ftAnglesEl.textContent = formatAngles(pair.finetunedYaw, pair.finetunedPitch);
    }
  };

  // Find the closest pair to a given rotation error value
  const findClosestPair = (errorValue) => {
    if (pairsByError.length === 0) {
      return null;
    }
    if (pairsByError.length === 1) {
      return pairsByError[0];
    }
    
    // Binary search for closest pair
    let left = 0;
    let right = pairsByError.length - 1;
    while (right - left > 1) {
      const mid = Math.floor((left + right) / 2);
      if (pairsByError[mid].finetunedError < errorValue) {
        left = mid;
      } else {
        right = mid;
      }
    }
    
    // Choose the closer one
    const distLeft = Math.abs(pairsByError[left].finetunedError - errorValue);
    const distRight = Math.abs(pairsByError[right].finetunedError - errorValue);
    return distLeft < distRight ? pairsByError[left] : pairsByError[right];
  };

  // Create scatter points for all pairs (positioned at their rotation error on x-axis, at y=0)
  const pairPoints = pairsByError.map((pair) => ({
    x: pair.finetunedError,
    y: 0,
    pair: pair,
  }));

  // Helper function to find closest point on a curve using binary search (more efficient than reduce)
  const findClosestOnCurve = (curve, xValue) => {
    if (curve.length === 0) return null;
    if (curve.length === 1) return curve[0];
    
    let left = 0;
    let right = curve.length - 1;
    
    while (right - left > 1) {
      const mid = Math.floor((left + right) / 2);
      if (curve[mid].x < xValue) {
        left = mid;
      } else {
        right = mid;
      }
    }
    
    const distLeft = Math.abs(curve[left].x - xValue);
    const distRight = Math.abs(curve[right].x - xValue);
    return distLeft < distRight ? curve[left] : curve[right];
  };

  // Track currently selected pair
  let currentPair = null;

  // Show default pair on load (near the middle of the error range)
  // This will be set in the chart data initialization
  let initialSelectedPair = null;
  if (pairsByError.length > 0) {
    const defaultError = 40; // Middle-ish of 0-160 range
    initialSelectedPair = findClosestPair(defaultError);
    currentPair = initialSelectedPair;
    if (currentPair) {
      setPreviewPair(currentPair);
    }
  }

  const chart = new Chart(chartEl, {
    type: 'line',
    data: {
      datasets: [
        {
          label: 'Pre-trained KDE',
          data: baseCurve,
          borderColor: '#ff4444',
          backgroundColor: 'rgba(255, 68, 68, 0.12)',
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: 'transparent',
          borderWidth: 3,
          borderDash: [8, 6],
        },
        {
          label: 'Fine-tuned KDE',
          data: ftCurve,
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.12)',
          fill: false,
          tension: 0.35,
          pointRadius: 0,
          pointHoverRadius: 0,
          pointHoverBackgroundColor: 'transparent',
          borderWidth: 3,
        },
        {
          label: 'Pair Points',
          data: pairPoints,
          type: 'scatter',
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: 'rgba(100, 100, 100, 0.3)',
          pointBorderColor: 'rgba(100, 100, 100, 0.6)',
          pointBorderWidth: 1,
          showLine: false,
          order: 1,
        },
        {
          label: 'Selected Pair',
          data: initialSelectedPair ? [{ x: initialSelectedPair.finetunedError, y: 0 }] : [],
          type: 'scatter',
          pointRadius: 8,
          pointHoverRadius: 8,
          pointHoverBorderWidth: 3,
          pointBackgroundColor: 'transparent',
          pointBorderColor: '#ff9800',
          pointBorderWidth: 3,
          showLine: false,
          order: 0,
        },
        {
          label: 'Pre-trained Model',
          data: initialSelectedPair ? (() => {
            const xVal = initialSelectedPair.baseError;
            const closest = findClosestOnCurve(baseCurve, xVal);
            return closest ? [{ x: xVal, y: closest.y }] : [];
          })() : [],
          type: 'scatter',
          pointRadius: 9,
          pointBackgroundColor: '#ff4444',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          showLine: false,
          order: 0,
        },
        {
          label: 'Finetuned Model',
          data: initialSelectedPair ? (() => {
            const xVal = initialSelectedPair.finetunedError;
            const closest = findClosestOnCurve(ftCurve, xVal);
            return closest ? [{ x: xVal, y: closest.y }] : [];
          })() : [],
          type: 'scatter',
          pointRadius: 9,
          pointBackgroundColor: '#ff9800',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          showLine: false,
          order: 0,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          type: 'linear',
          title: {
            display: true,
            text: 'Rotation Error on Non-Overlapping Pairs (degrees)',
          },
          ticks: {
            maxRotation: 0,
            minRotation: 0,
          },
        },
        y: {
          beginAtZero: true,
          suggestedMax,
          title: {
            display: true,
            text: 'Frequency (%)',
          },
        },
      },
      interaction: {
        mode: 'nearest',
        intersect: false,
      },
      plugins: {
        tooltip: {
          enabled: false,
        },
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            generateLabels: (chart) => {
              const original = Chart.defaults.plugins.legend.labels.generateLabels(chart);
              return original.filter(item => {
                return item.text === 'Pre-trained Model' || item.text === 'Finetuned Model';
              });
            },
          },
        },
      },
      animation: {
        duration: 300,
        easing: 'easeOutQuart',
        properties: ['x', 'y'], // Only animate position, not size or border width
      },
      transitions: {
        active: {
          animation: {
            duration: 300,
            easing: 'easeOutQuart',
            properties: ['x', 'y'],
          },
        },
      },
    },
  });

  // Optimized hover handler with requestAnimationFrame throttling
  let rafPending = false;
  let pendingUpdate = null;
  
  const updateChart = () => {
    if (!pendingUpdate) {
      rafPending = false;
      return;
    }
    
    const { nearestPair } = pendingUpdate;
    pendingUpdate = null;
    rafPending = false;
    
    if (nearestPair && nearestPair !== currentPair) {
      currentPair = nearestPair;
      setPreviewPair(currentPair);
      
      // Calculate all marker positions
      const baseX = currentPair.baseError;
      const baseClosest = findClosestOnCurve(baseCurve, baseX);
      const redMarkerData = baseClosest ? [{ x: baseClosest.x, y: baseClosest.y }] : [];
      
      const ftX = currentPair.finetunedError;
      const ftClosest = findClosestOnCurve(ftCurve, ftX);
      const orangeMarkerData = ftClosest ? [{ x: ftClosest.x, y: ftClosest.y }] : [];
      
      // Update red marker instantly (no animation)
      chart.data.datasets[4].data = redMarkerData;
      chart.update('none');
      
      // Update selected pair and orange marker data
      chart.data.datasets[3].data = [{ x: currentPair.finetunedError, y: 0 }];
      chart.data.datasets[5].data = orangeMarkerData;
      
      // Animate selected pair and orange marker
      chart.update({
        duration: 300,
        easing: 'easeOutQuart',
        lazy: false,
      });
      
      // Force red marker to stay at target position (override any animation attempt)
      // Use multiple requestAnimationFrame calls to ensure it stays put
      requestAnimationFrame(() => {
        chart.data.datasets[4].data = redMarkerData;
        chart.update('none');
        requestAnimationFrame(() => {
          chart.data.datasets[4].data = redMarkerData;
          chart.update('none');
        });
      });
    }
  };
  
  // Handle hover to update preview - snap to nearest pair point
  chart.canvas.addEventListener('mousemove', (event) => {
    const canvasPosition = Chart.helpers.getRelativePosition(event, chart);
    const mouseX = canvasPosition.x;
    const mouseY = canvasPosition.y;
    
    // Convert mouse X to data value for more efficient search
    const dataX = chart.scales.x.getValueForPixel(mouseX);
    
    // Use binary search to find nearest pair by error value (much faster than pixel distance)
    const nearestPair = findClosestPair(dataX);
    
    // Store pending update
    pendingUpdate = { nearestPair };
    
    // Throttle updates using requestAnimationFrame
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(updateChart);
    }
  });

  const baseMeanEl = document.querySelector('#histogram-stats .base-mean');
  const ftMeanEl = document.querySelector('#histogram-stats .ft-mean');
  if (baseMeanEl) {
    baseMeanEl.textContent = dataset.baseSummary.mean.toFixed(1);
  }
  if (ftMeanEl) {
    ftMeanEl.textContent = dataset.finetunedSummary.mean.toFixed(1);
  }
});


