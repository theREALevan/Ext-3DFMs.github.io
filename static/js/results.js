const RESULTS_DATA = {
    "relative_rotation": {
    "title": "Extreme Relative Rotation Estimation",
    "description": "We report the median rotation error (MRE) and relative rotation accuracy (RA) at thresholds of 15° and 30°. As shown, our fine-tuned models (VGGT, WorldMirror, and π³) achieve consistent and substantial improvements across all test sets, establishing a new state of the art in extreme rotation estimation, outperforming the previous state-of-the-art method ExRot.",
    "datasets": {
      "cambridge": {
        "name": "sELP",
        "labels": ["MRE (↓)", "RA < 15° (↑)", "RA < 30° (↑)"],
        "metrics": [
          {
            "label": "ExRot",
            "data": [13.23, 53.1, 59.6],
            "backgroundColor": "rgba(128, 128, 128, 0.6)",
            "borderColor": "rgba(128, 128, 128, 1)",
            "borderWidth": 1
          },
          {
            "label": "VGGT",
            "data": [92.92, 24.2, 29.1],
            "backgroundColor": "rgba(255, 99, 132, 0.5)",
            "borderColor": "rgba(255, 99, 132, 1)",
            "borderWidth": 1
          },
          {
            "label": "VGGT (FT)",
            "data": [14.21, 50.9, 56.6],
            "backgroundColor": "rgba(255, 99, 132, 1)",
            "borderColor": "rgba(255, 99, 132, 1)",
            "borderWidth": 1
          },
          {
            "label": "WorldMirror",
            "data": [68.96, 36.3, 42.5],
            "backgroundColor": "rgba(75, 192, 192, 0.5)",
            "borderColor": "rgba(75, 192, 192, 1)",
            "borderWidth": 1
          },
          {
            "label": "WorldMirror (FT)",
            "data": [9.74, 56.9, 63.5],
            "backgroundColor": "rgba(75, 192, 192, 1)",
            "borderColor": "rgba(75, 192, 192, 1)",
            "borderWidth": 1
          },
          {
            "label": "π³",
            "data": [45.24, 43.8, 48.3],
            "backgroundColor": "rgba(54, 162, 235, 0.5)",
            "borderColor": "rgba(54, 162, 235, 1)",
            "borderWidth": 1
          },
          {
            "label": "π³ (FT)",
            "data": [11.96, 53.7, 60.0],
            "backgroundColor": "rgba(54, 162, 235, 1)",
            "borderColor": "rgba(54, 162, 235, 1)",
            "borderWidth": 1
          }
        ]
      },
      "welp": {
        "name": "UnScenePairs",
        "labels": ["MRE (↓)", "RA < 15° (↑)", "RA < 30° (↑)"],
        "metrics": [
          {
            "label": "ExRot",
            "data": [28.48, 35.7, 50.8],
            "backgroundColor": "rgba(128, 128, 128, 0.6)",
            "borderColor": "rgba(128, 128, 128, 1)",
            "borderWidth": 1
          },
          {
            "label": "VGGT",
            "data": [31.64, 33.8, 48.8],
            "backgroundColor": "rgba(255, 99, 132, 0.5)",
            "borderColor": "rgba(255, 99, 132, 1)",
            "borderWidth": 1
          },
          {
            "label": "VGGT (FT)",
            "data": [12.71, 53.6, 67.9],
            "backgroundColor": "rgba(255, 99, 132, 1)",
            "borderColor": "rgba(255, 99, 132, 1)",
            "borderWidth": 1
          },
          {
            "label": "WorldMirror",
            "data": [19.25, 44.1, 58.9],
            "backgroundColor": "rgba(75, 192, 192, 0.5)",
            "borderColor": "rgba(75, 192, 192, 1)",
            "borderWidth": 1
          },
          {
            "label": "WorldMirror (FT)",
            "data": [11.75, 56.2, 68.1],
            "backgroundColor": "rgba(75, 192, 192, 1)",
            "borderColor": "rgba(75, 192, 192, 1)",
            "borderWidth": 1
          },
          {
            "label": "π³",
            "data": [17.66, 46.5, 59.4],
            "backgroundColor": "rgba(54, 162, 235, 0.5)",
            "borderColor": "rgba(54, 162, 235, 1)",
            "borderWidth": 1
          },
          {
            "label": "π³ (FT)",
            "data": [12.92, 54.0, 69.2],
            "backgroundColor": "rgba(54, 162, 235, 1)",
            "borderColor": "rgba(54, 162, 235, 1)",
            "borderWidth": 1
          }
        ]
      },
      "welpt": {
        "name": "UnScenePairs-t",
        "labels": ["MRE (↓)", "RA < 15° (↑)", "RA < 30° (↑)"],
        "metrics": [
          {
            "label": "ExRot",
            "data": [42.45, 31.3, 43.8],
            "backgroundColor": "rgba(128, 128, 128, 0.6)",
            "borderColor": "rgba(128, 128, 128, 1)",
            "borderWidth": 1
          },
          {
            "label": "VGGT",
            "data": [46.65, 29.1, 42.1],
            "backgroundColor": "rgba(255, 99, 132, 0.5)",
            "borderColor": "rgba(255, 99, 132, 1)",
            "borderWidth": 1
          },
          {
            "label": "VGGT (FT)",
            "data": [14.48, 50.6, 62.1],
            "backgroundColor": "rgba(255, 99, 132, 1)",
            "borderColor": "rgba(255, 99, 132, 1)",
            "borderWidth": 1
          },
          {
            "label": "WorldMirror",
            "data": [21.52, 42.6, 57.4],
            "backgroundColor": "rgba(75, 192, 192, 0.5)",
            "borderColor": "rgba(75, 192, 192, 1)",
            "borderWidth": 1
          },
          {
            "label": "WorldMirror (FT)",
            "data": [13.13, 53.3, 64.5],
            "backgroundColor": "rgba(75, 192, 192, 1)",
            "borderColor": "rgba(75, 192, 192, 1)",
            "borderWidth": 1
          },
          {
            "label": "π³",
            "data": [21.62, 43.5, 56.8],
            "backgroundColor": "rgba(54, 162, 235, 0.5)",
            "borderColor": "rgba(54, 162, 235, 1)",
            "borderWidth": 1
          },
          {
            "label": "π³ (FT)",
            "data": [13.31, 53.1, 65.5],
            "backgroundColor": "rgba(54, 162, 235, 1)",
            "borderColor": "rgba(54, 162, 235, 1)",
            "borderWidth": 1
          }
        ]
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const ctxMRE = document.getElementById('results-chart-mre');
  const ctxRA = document.getElementById('results-chart-ra');
  if (!ctxMRE || !ctxRA) return;

  let currentTask = 'relative_rotation';
  let currentDataset = 'cambridge';
  let chartMRE = null;
  let chartRA = null;

  // Create task tabs
  const taskTabsContainer = document.getElementById('results-task-tabs');
  // Create dataset tabs
  const datasetTabsContainer = document.getElementById('results-dataset-tabs');

  function initTabs() {
    // Render Task Tabs
    const tasks = Object.keys(RESULTS_DATA);
    if (taskTabsContainer) {
      const ul = document.createElement('ul');
      tasks.forEach(task => {
        const li = document.createElement('li');
        if (task === currentTask) li.classList.add('is-active');
        const a = document.createElement('a');
        a.textContent = RESULTS_DATA[task].title;
        a.onclick = () => switchTask(task);
        li.appendChild(a);
        ul.appendChild(li);
      });
      taskTabsContainer.innerHTML = '';
      taskTabsContainer.appendChild(ul);
    }

    renderDatasetTabs();
  }

  function renderDatasetTabs() {
    if (!datasetTabsContainer) return;
    const datasets = Object.keys(RESULTS_DATA[currentTask].datasets);
    
    const buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'buttons has-addons is-centered';
    
    datasets.forEach(dsKey => {
      const btn = document.createElement('button');
      btn.className = `button is-small ${dsKey === currentDataset ? 'is-dark is-selected' : ''}`;
      btn.textContent = RESULTS_DATA[currentTask].datasets[dsKey].name;
      btn.onclick = () => switchDataset(dsKey);
      buttonsDiv.appendChild(btn);
    });
    
    datasetTabsContainer.innerHTML = '';
    datasetTabsContainer.appendChild(buttonsDiv);
  }

  function switchTask(task) {
    currentTask = task;
    currentDataset = Object.keys(RESULTS_DATA[task].datasets)[0];
    
    initTabs();
    renderCharts();
  }

  function switchDataset(dsKey) {
    currentDataset = dsKey;
    renderDatasetTabs();
    renderCharts();
  }

  function renderCharts() {
    if (chartMRE) chartMRE.destroy();
    if (chartRA) chartRA.destroy();

    const taskData = RESULTS_DATA[currentTask];
    const data = taskData.datasets[currentDataset];
    
    // Update description
    const descriptionEl = document.getElementById('results-caption');
    if (descriptionEl && taskData.description) {
      descriptionEl.textContent = taskData.description;
    }

    // Render external legend
    const legendContainer = document.getElementById('results-legend');
    if (legendContainer) {
      legendContainer.innerHTML = data.metrics.map(metric => `
        <div style="display: flex; align-items: center; margin: 0 6px; font-family: 'Google Sans', sans-serif; font-size: 0.85rem; color: #666; white-space: nowrap;">
          <span style="display: inline-block; width: 20px; height: 10px; background-color: ${metric.backgroundColor}; border: 1px solid ${metric.borderColor}; margin-right: 6px; border-radius: 2px;"></span>
          ${metric.label}
        </div>
      `).join('');
    }
    
    // Prepare data for MRE (index 0)
    const mreData = {
      labels: ["MRE"],
      datasets: data.metrics.map(dataset => ({
        ...dataset,
        data: [dataset.data[0]]
      }))
    };

    // Prepare data for RA (indices 1 and 2)
    const raData = {
      labels: ["RA < 15°", "RA < 30°"],
      datasets: data.metrics.map(dataset => ({
        ...dataset,
        data: [dataset.data[1], dataset.data[2]]
      }))
    };

    // Common options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false // Hide internal legend
        },
        title: {
          display: false 
        },
        tooltip: {
          mode: 'index',
          intersect: false,
        }
      },
      animation: {
        duration: 500
      }
    };

    chartMRE = new Chart(ctxMRE, {
      type: 'bar',
      data: mreData,
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Median Rotation Error (degrees)'
            }
          },
          x: {
            // Enable ticks to match the RA chart's bottom spacing
            ticks: { display: true } 
          }
        }
      }
    });

    chartRA = new Chart(ctxRA, {
      type: 'bar',
      data: raData,
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          // Legend is disabled in commonOptions
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100, 
            title: {
              display: true,
              text: 'Percentage'
            }
          }
        }
      }
    });
  }

  initTabs();
  renderCharts();
});
