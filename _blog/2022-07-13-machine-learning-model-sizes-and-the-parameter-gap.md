---
layout: article
title: "Machine Learning Model Sizes and the Parameter Gap"
description: 'The model size of notable Machine Learning systems has grown ten times faster than before since 2018. After 2020 growth has not been entirely continuous: there was a jump of one order of magnitude which persists until today. This is relevant for forecasting model size and thus AI capabilities.'
tags: paper
image: assets/images/posts/2022/machine-learning-model-sizes-and-the-parameter-gap.png
date: 2022-07-05

banner:
  fullscreen: false
  resources:
    - label: Paper
      url: https://arxiv.org/abs/2207.02852
      icon: file-text
    - label: Visualization
      url: /mlinputs/visualization
      icon: graph-up
    - label: Dataset
      url: /mlinputs/data
      icon: table


authors:
  - name: Pablo Villalobos
  - name: Jaime Sevilla
  - name: Tamay Besiroglu
  - name: Lennart Heim
  - name: Anson Ho
  - name: Marius Hobbhahn
---

<style>
  .side-by-side {
    display: flex;
  }
</style>

**Summary**: The model size of notable Machine Learning systems has grown ten times faster than before since 2018. After 2020 growth has not been entirely continuous: there was a jump of one order of magnitude which persists until today. This is relevant for forecasting model size and thus AI capabilities.

Trends in model size
--------------------

In current ML systems, model size (number of parameters) is related to performance via known [scaling laws](https://arxiv.org/abs/2203.15556). We used [our dataset](https://epochai.org/mlinputs/visualization?startDate=1950-1-1&endDate=2022-2-1&xAxis=Publication%20date&yAxis=Parameters&separateCategories=true&citationThreshold=0&otherDomainThreshold=10&startDlEra=2009-12-31&startLargeScaleEra=2015-9-1&largeScaleAction=ignore&outliersAction=ignore&recordSettersAction=ignore&bigAlphagoAction=ignore&alphagozeroAction=ignore&lowOutliersZValueThreshold=-2&highOutliersZValueThreshold=0.76&outlierWindowSize=2&filterText=&splitDomains=&domainsToNotSplit=&ranges=[object%20Object]&splitDlEra=true&splitLargeScaleEra=true&plotRegressions=false&bootstrapSampleSize=10&adjustForEstimateUncertainty=true&preset=Three%20eras%20of%20compute&labelEras=false&showDoublingTimes=true&labelSystems=false&showLegend=true&parametersRange=NaN,NaN&trainingComputeRange=NaN,NaN&inferenceComputeRange=NaN,NaN&trainingDatasetSizeRange=NaN,NaN&inferenceComputePerParameterRange=NaN,NaN&inferenceComputeTimesParameterRange=NaN,NaN&labelPoints=false) to analyze trends in the model size of 237 milestone machine learning systems. The systems are categorized into Language, Vision, Games and Other according to the task they solve.

Model size slowly increased by 7 orders of magnitude from the 1950s to around 2018. **Since 2018, growth has accelerated for language models, with model size increasing by another 4 orders of magnitude in the four years from 2018 to 2022** (see Figure 1). Other domains like vision have grown at a more moderate pace, but still faster than before 2018.

<div class="side-by-side">
  <figure>
  <img src="https://lh3.googleusercontent.com/RgwabneROy3bf1gtazXYrZmm974VOpV5bKDK9nfZzHk9HX5K3DMtauvmY8JwSQ8SY2PVwSrJChlsj7DW9OlxlkSTSuQqDWwzQlVCMDBF13VRpLg9Wo3hZN_yykGvxc-FiEau-6CvqaPOpBzuRXk"/>
  </figure>

  <figure>
  <img src="https://lh6.googleusercontent.com/BDlOf5f8T2fqIANL4tx4nocYppQYwerKhqd0oix5vOWK5F7kPM5lTY-KOVW-GLHztUcUYPr0D-3PBwX6QlfP4D9EsSAYk49NXgYeMNn9HHqUqY1zT7fQoB77bpuUGOSmG2dpUD7-dV4PTlT3wtY"/>
  </figure>
</div>

<figcaption class="caption" markdown="1">
Figure 1. Left: Transition period around 2018, assuming a single post-2018 trend. Right: the same period, assuming two separate post-2018 trends.
</figcaption>

The parameter gap
-----------------

Starting in 2020, we see many models below 20B parameters and above 70B parameters, but very few in the 20B-70B range. We refer to this scarcity as the *parameter gap* (see Figure 2).

<figure>
<img src="https://lh4.googleusercontent.com/j2sPKJ0Y8kBIu3zVUBABuJPcfaOme4KIA88tAEwo91yF3_gSqTSL22M3p83w5nQImGPFl64vAo_jhp0M8ugDr61fJcSefPkAwhgjVLWipJHLBSfgpX7JF0QcLtn53kzedT-FW9nw3qoUImSBvQ"/>
</figure>

<figcaption class="caption" markdown="1">
Figure 2: Model size over time, separated by domain. Red lines highlight the parameter gap. Most systems above the gap are language or multimodal models.  
</figcaption>

We have come up with some hypotheses that explain the parameter gap, of which these two are the ones most consistent with the evidence:

1. Increasing model size beyond 20B parameters has a high marginal cost due to the need to adopt different parallelism techniques, so that mid-sized models are less cost-effective than bigger or smaller ones.
2. GPT-3 initiated the gap by ‘jumping’ one order of magnitude in size over previous systems. This gap was maintained because researchers are incentivized to build the cheapest model that can outperform previous models. Those competing with GPT-3 are above the gap; the rest are below.

**The existence of the parameter gap suggests that model size has some underlying constraints that might cause discontinuities in the future.**  
 

[*Read the full paper now on the arXiv*](https://arxiv.org/abs/2207.02852)


