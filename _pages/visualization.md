---
layout: full_screen_app
title: ML input trends visualization
image: /assets/images/posts/2022/compute-trends.png
permalink: /mlinputs/visualization
exclude_mathjax: true
---

{% include head.html %}

{% include ml_trends_head.html %}

<style>
  body {
    height: 100vh;
  }

  * { transition none !important; }

  .graph-wrapper {
    width: 100%;
    height: 100%;
    padding-top: 20px;
    padding-right: 20px;
    padding-bottom: 5px;
    padding-left: 10px;
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

{% include header.html %}

<div class="graph-wrapper tex2jax_ignore">
  <div id="trends-graph">
  </div>
</div>

{% include footer.html %}

<script>
  buildTrendsGraph("#trends-graph", database, {linkParamsToUrl: true});
</script>

