---
layout: article
title: Estimating Training Compute of Deep Learning Models
subtitle: We describe two approaches for estimating the training compute of Deep Learning systems, by counting operations and looking at GPU time. 
image: assets/images/posts/2022/estimating-training-compute.png
description: We describe two approaches for estimating the training compute of Deep Learning systems, by counting operations and looking at GPU time. 
tags: report

date: 2022-01-20

banner:
  fullscreen: false

authors:
  - name: Jaime Sevilla
    affiliations:
      name: University of Aberdeen
  - name: Lennart Heim
    affiliations:
      name: Centre for the Governance of AI
  - name: Marius Hobbhahn
    affiliations:
      name: University of Tübingen
  - name: Tamay Besiroglu
    affiliations:
      name: Massachusetts Institute of Technology
  - name: Anson Ho
    affiliations:
      name: University of St Andrews
  - name: Pablo Villalobos
    affiliations:
      name:
---

<head>
  <script src="/assets/bundles/compute-calculator/libs/papaparse.min.js"></script>
  <script src="/assets/bundles/compute-calculator/libs/umbrella.min.js"></script>

  <link rel="stylesheet" href="/assets/bundles/compute-calculator/main.css">

  <style>
    .calculator-method-container {
      display: flex;
      flex-flow: wrap;
      grid-column: 1/15;
      padding-left: var(--nav-bar-margin);
      padding-right: var(--nav-bar-margin);
    }

    .calculator-method-container .method {
      width: 600px;
      max-width: calc(100% - 50px);
      display: flex;
    }

    .output-separator {
      margin-top: auto;
    }

    @media (max-width: 700px) {
      .calculator-method-container {
        display: block;
      }
    }
  </style>
</head>

{% assign docUrl = 'https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit' %}

ML Models trained on more compute have better performance and more advanced capabilities (see e.g. Kaplan et al or ). Due to this, estimating and reporting compute usage is crucial to enable accurate comparisons between ML models.

Compute usage is commonly measured as the number of **floating point operations (FLOPs)** required to train the final version of the system. To estimate this we can resort to two strategies: a) using information about the architecture and amount of training data, or b) using information about the hardware used and training time.

Below we provide two calculators that illustrate these methods.

<div class="calculator-method-container"></div>

*Do you see a mistake or do you want to submit missing information about hardware specs? Fill [this form](https://docs.google.com/forms/d/e/1FAIpQLSexq86cydEh36zA_A1FT0xT7gZCdazFS7Qi2GCFVLnO985iwQ/viewform?usp=sf_link) and we will look into it.*

You can read more about these methods and find detailed examples in [our full report](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#).

{% include scripts/tippy.html %}

<script src="/assets/bundles/compute-calculator/calculator.js"></script>

<script>
  let {calculator, Utils} = buildComputeCalculator('/assets/bundles/compute-calculator/data/hardware_data.csv');
  let method1 = calculator.renderMethod1('.calculator-method-container');
  let method2 = calculator.renderMethod2('.calculator-method-container');
</script>
