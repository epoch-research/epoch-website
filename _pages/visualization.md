---
layout: full_screen_app
title: ML input trends visualization
image: /assets/images/posts/2022/compute-trends.png
permalink: /mlinputs/visualization
---

{% include head.html %}

<head>
  <!-- Jesus -->

  <link rel="stylesheet" href="/assets/bundles/trends/graph.css">
  <link rel="stylesheet" href="/assets/bundles/trends/plotter/multislider.css">
  <link rel="stylesheet" href="/assets/bundles/trends/plotter/libs/modal.css">
  <link rel="stylesheet" href="/assets/bundles/trends/plotter/mlp.css">

  <script src="/assets/bundles/trends/plotter/libs/d3-scale/d3-array@3"></script>
  <script src="/assets/bundles/trends/plotter/libs/d3-scale/d3-color@3"></script>
  <script src="/assets/bundles/trends/plotter/libs/d3-scale/d3-format@3"></script>
  <script src="/assets/bundles/trends/plotter/libs/d3-scale/d3-interpolate@3"></script>
  <script src="/assets/bundles/trends/plotter/libs/d3-scale/d3-time@3"></script>
  <script src="/assets/bundles/trends/plotter/libs/d3-scale/d3-time-format@4"></script>
  <script src="/assets/bundles/trends/plotter/libs/d3-scale/d3-scale@4"></script>

  <script src="/assets/bundles/trends/plotter/HEADER.js"></script>
  <script src="/assets/bundles/trends/plotter/utils.js"></script>
  <script src="/assets/bundles/trends/plotter/libs/canvas-txt.js"></script>
  <script src="/assets/bundles/trends/plotter/libs/modal.js"></script>
  <script src="/assets/bundles/trends/plotter/libs/interact.min.js"></script>
  <script src="/assets/bundles/trends/plotter/libs/event.js"></script>
  <script src="/assets/bundles/trends/plotter/canvas.js"></script>
  <script src="/assets/bundles/trends/plotter/objects.js"></script>
  <script src="/assets/bundles/trends/plotter/controls.js"></script>
  <script src="/assets/bundles/trends/plotter/plotter.js"></script>
  <script src="/assets/bundles/trends/plotter/multislider.js"></script>

  <script src="/assets/bundles/trends/stats.js"></script>
  <script src="/assets/bundles/trends/trends.js"></script>
  <script src="/assets/bundles/trends/presets.js"></script>
  <script src="/assets/bundles/trends/graph.js"></script>

  <script src="/assets/bundles/trends/database.js"></script>

  <style>
    body {
      height: 100vh;
    }

    * { transition none !important; }

    .graph-wrapper {
      width: 100%;
      height: 100%;
      padding: 5px;
      box-sizing: border-box;
    }

    #trends-graph {
      width: 100%;
      height: 100%;
    }

    .modal-container {
      max-width: 400px;
    }

    .mlp-tooltip-table {
      border: 0;
      margin-bottom: 0;
    }

    .mlp-tooltip-table td {
      padding: 2px;
    }

    .mlp-tooltip-table tr, .mlp-tooltip-table td {
      background-color: rgba(255, 255, 255, 0.95) !important;
      border: 0;
    }
  </style>
</head>

{% include header.html %}

<div class="graph-wrapper">
  <div id="trends-graph">
  </div>
</div>

{% include footer.html %}

<script>
  buildTrendsGraph("#trends-graph", database, {linkParamsToUrl: true});
</script>

