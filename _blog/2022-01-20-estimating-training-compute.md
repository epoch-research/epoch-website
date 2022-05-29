---
layout: article
title: Estimating Training Compute of Deep Learning Models
subtitle: We describe two approaches for estimating the training compute of Deep Learning systems, by counting operations and looking at GPU time. 
image: assets/images/posts/2022/estimating-training-compute.jpeg
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

**You can find the complete article [here](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit?usp=sharing). We provide a short summary below.**

<div class="calculator-method-container"></div>

In short: To estimate the compute used to train a Deep Learning model we can either: 1) directly count the number of operations needed or 2) estimate it from GPU time.

We are uncertain about what utilization rate is best, but our recommendation is 30% for Large Language Models and 40% for other models.

You can read more about method 1 [here](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.2mby4t3qns9s) and about method 2 [here](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.erkg6ljdb9la).

Other parts of interest of this article include:

* We argue that the ratio of operations of backward and forward pass of neural networks is often close to 2:1. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.w8eohir5vge4).
* We discuss how the formula of method 1 changes for recurrent models. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.fdnj8v30m5rm).
* We argue that dropout does not affect the number of operations per forward and backward pass. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.a2552o2358pi).
* We have elaborated a table with parameter and operation counts for common neural network layers. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.l4gw5vkpumk5).
* We give a detailed example of method 1. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.rp5vcfhyzosa).
* We discuss commonly used number representation formats in ML. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.gjzi5oaefiet).
* We share an estimate of the average performance of GPU cards each year. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.73bi8uuftsk4).
* We share some reported GPU usages in real experiments. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.xalldzr955i3).
* We give a detailed example of method 2. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.nr9q2lgxai4g).
* We compare both methods and conclude they result in similar estimates. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.cvy3rx7nvrkh).
* We discuss the use of profilers to measure compute. [More](https://docs.google.com/document/d/1J2BX9jkE5nN5EA1zYRN0lHhdCf1YkiFERc_nwiYqCOA/edit#heading=h.wee32i38js1o).

{% include scripts/tippy.html %}

<script src="/assets/bundles/compute-calculator/calculator.js"></script>

<script>
  let calculator = buildComputeCalculator('/assets/bundles/compute-calculator/data/hardware_data.csv');
  calculator.renderMethod1('.calculator-method-container');
  calculator.renderMethod2('.calculator-method-container');
</script>

