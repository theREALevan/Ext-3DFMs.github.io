const RESULTS_DATA = {
    "relative_rotation": {
    "title": "Extreme Relative Rotation",
    "description": "We report the median rotation error (MRE) and relative rotation accuracy (RA) at thresholds of 15° and 30° over non-overlapping image pairs. As shown, our fine-tuned models (VGGT, WorldMirror, and π³) achieve consistent and substantial improvements across all test sets, establishing a new state of the art in extreme rotation estimation, outperforming the previous SOTA ExRot.",
    "leftAxisTitle": "Median Rotation Error (degrees)",
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
  },
  "multiview_pose": {
    "title": "Multiview Pose",
    "description": "We report relative rotation accuracy (RA), relative translation accuracy (TA), and AUC at a threshold of 30°. As shown, despite fine-tuning on image pairs and a rotation loss alone, rotation and translation accuracies are mostly preserved across all models, indicating that the aligned variants continue to perform well in multi-view settings.",
    "leftAxisTitle": "Percentage",
    "combineMetrics": true,
    "yMax": 100,
    "datasets": {
      "re10k": {
        "name": "RealEstate10K",
        "labels": ["RA < 30° (↑)", "TA < 30° (↑)", "AUC < 30° (↑)"],
        "metrics": [
          { "label": "VGGT", "data": [99.91, 92.75, 77.28], "backgroundColor": "rgba(255, 99, 132, 0.5)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "VGGT (FT)", "data": [99.99, 93.77, 79.11], "backgroundColor": "rgba(255, 99, 132, 1)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "WorldMirror", "data": [99.99, 95.42, 85.93], "backgroundColor": "rgba(75, 192, 192, 0.5)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "WorldMirror (FT)", "data": [99.99, 95.72, 85.52], "backgroundColor": "rgba(75, 192, 192, 1)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "π³", "data": [99.99, 95.52, 87.14], "backgroundColor": "rgba(54, 162, 235, 0.5)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 },
          { "label": "π³ (FT)", "data": [99.99, 95.21, 85.25], "backgroundColor": "rgba(54, 162, 235, 1)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 }
        ]
      },
      "eth3d": {
        "name": "ETH3D",
        "labels": ["RA < 30° (↑)", "TA < 30° (↑)", "AUC < 30° (↑)"],
        "metrics": [
          { "label": "VGGT", "data": [96.41, 87.01, 72.52], "backgroundColor": "rgba(255, 99, 132, 0.5)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "VGGT (FT)", "data": [96.41, 94.70, 79.30], "backgroundColor": "rgba(255, 99, 132, 1)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "WorldMirror", "data": [92.48, 91.45, 78.24], "backgroundColor": "rgba(75, 192, 192, 0.5)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "WorldMirror (FT)", "data": [92.48, 90.26, 74.95], "backgroundColor": "rgba(75, 192, 192, 1)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "π³", "data": [100.00, 95.38, 82.81], "backgroundColor": "rgba(54, 162, 235, 0.5)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 },
          { "label": "π³ (FT)", "data": [100.00, 95.21, 79.81], "backgroundColor": "rgba(54, 162, 235, 1)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 }
        ]
      }
    }
  },
  "dense_reconstruction": {
    "title": "Dense Reconstruction",
    "description": "We report the accuracy (ACC) and completion (CMP) in meters. As shown, our fine-tuned models preserve, and in many cases improve, the reconstruction performance of 3DFMs, despite using only a rotation loss and receiving no supervision on dense outputs.",
    "leftAxisTitle": "Error (meters)",
    "combineMetrics": true,
    "datasets": {
      "unscenerecon": {
        "name": "UnSceneRecon",
        "labels": ["ACC Mean (↓)", "ACC Med. (↓)", "CMP Mean (↓)", "CMP Med. (↓)"],
        "metrics": [
          { "label": "VGGT", "data": [1.441, 1.049, 1.403, 0.729], "backgroundColor": "rgba(255, 99, 132, 0.5)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "VGGT (FT)", "data": [1.291, 0.908, 1.155, 0.650], "backgroundColor": "rgba(255, 99, 132, 1)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "WorldMirror", "data": [0.933, 0.612, 0.702, 0.387], "backgroundColor": "rgba(75, 192, 192, 0.5)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "WorldMirror (FT)", "data": [0.972, 0.660, 0.735, 0.368], "backgroundColor": "rgba(75, 192, 192, 1)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "π³", "data": [0.716, 0.466, 0.635, 0.377], "backgroundColor": "rgba(54, 162, 235, 0.5)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 },
          { "label": "π³ (FT)", "data": [0.791, 0.517, 0.689, 0.403], "backgroundColor": "rgba(54, 162, 235, 1)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 }
        ]
      },
      "eth3d": {
        "name": "ETH3D",
        "labels": ["ACC Mean (↓)", "ACC Med. (↓)", "CMP Mean (↓)", "CMP Med. (↓)"],
        "metrics": [
          { "label": "VGGT", "data": [0.284, 0.194, 0.342, 0.204], "backgroundColor": "rgba(255, 99, 132, 0.5)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "VGGT (FT)", "data": [0.233, 0.144, 0.259, 0.144], "backgroundColor": "rgba(255, 99, 132, 1)", "borderColor": "rgba(255, 99, 132, 1)", "borderWidth": 1 },
          { "label": "WorldMirror", "data": [0.285, 0.201, 0.301, 0.169], "backgroundColor": "rgba(75, 192, 192, 0.5)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "WorldMirror (FT)", "data": [0.235, 0.167, 0.217, 0.126], "backgroundColor": "rgba(75, 192, 192, 1)", "borderColor": "rgba(75, 192, 192, 1)", "borderWidth": 1 },
          { "label": "π³", "data": [0.187, 0.125, 0.210, 0.129], "backgroundColor": "rgba(54, 162, 235, 0.5)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 },
          { "label": "π³ (FT)", "data": [0.202, 0.137, 0.219, 0.137], "backgroundColor": "rgba(54, 162, 235, 1)", "borderColor": "rgba(54, 162, 235, 1)", "borderWidth": 1 }
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

    // Handle layout for combined vs split charts
    const containerMRE = document.getElementById('chart-container-mre');
    const containerRA = document.getElementById('chart-container-ra');
    const combineMetrics = taskData.combineMetrics;

    if (combineMetrics) {
      if (containerMRE) containerMRE.style.display = 'none';
      if (containerRA) containerRA.style.flex = '1';
    } else {
      if (containerMRE) {
        containerMRE.style.display = 'block';
        containerMRE.style.flex = '1';
      }
      if (containerRA) containerRA.style.flex = '1.8';
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
    
    let mreData = null;
    let raData = null;

    if (combineMetrics) {
      // Prepare combined data (all metrics in RA chart)
      raData = {
        labels: data.labels,
        datasets: data.metrics.map(dataset => ({
          ...dataset,
          data: dataset.data
        }))
      };
    } else {
      // Prepare data for MRE (index 0)
      mreData = {
        labels: [data.labels[0]],
        datasets: data.metrics.map(dataset => ({
          ...dataset,
          data: [dataset.data[0]]
        }))
      };

      // Prepare data for RA (indices 1 and 2)
      raData = {
        labels: [data.labels[1], data.labels[2]],
        datasets: data.metrics.map(dataset => ({
          ...dataset,
          data: [dataset.data[1], dataset.data[2]]
        }))
      };
    }

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

    if (!combineMetrics && mreData) {
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
                text: taskData.leftAxisTitle || 'Percentage'
              }
            },
            x: {
              // Enable ticks to match the RA chart's bottom spacing
              ticks: { display: true } 
            }
          }
        }
      });
    }

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
            max: (combineMetrics && taskData.yMax !== undefined) ? taskData.yMax : (combineMetrics ? undefined : 100),
            title: {
              display: true,
              text: combineMetrics ? taskData.leftAxisTitle : 'Percentage'
            }
          }
        }
      }
    });
  }

  initTabs();
  renderCharts();
});
