---
layout: distill
title: Parameter Counts in Machine Learning
subtitle: We describe two approaches for estimating the training compute of Deep Learning systems, by counting operations and looking at GPU time. 
image: assets/images/thumbnail.jpg
description: We describe two approaches for estimating the training compute of Deep Learning systems, by counting operations and looking at GPU time.
external: true
external_url: https://www.alignmentforum.org/s/T9pBzinPXYB3mxSGi/p/GzoWcYibWYwJva8aL
tags: editorial

toc:
  - name: Summary
  - name: Introduction
  - name: "Method 1: Counting operations in the model"
  - name: "Method 2: GPU time"
  - name: Conclusion

date: 2021-06-19

authors:
  - name: Jaime Sevilla
    url: ""
    affiliations:
      name: University of Aberdeen
  - name: Lennart Heim
    url: ""
    affiliations:
      name: Centre for the Governance of AI
  - name: Marius Hobbhahn
    url: ""
    affiliations:
      name: University of Tübingen
  - name: Tamay Besiroglu
    url: ""
    affiliations:
      name: Massachusetts Institute of Technology
  - name: Anson Ho
    url: ""
    affiliations:
      name: University of St Andrews
---

# Summary 
To estimate the compute used to train a Deep Learning model we can either: 1) directly count the number of operations needed or 2) estimate it from GPU time.

## Method 1: Counting operations in the model

## Method 2: GPU time

We are uncertain about what utilization rate is best, but our recommendation is 30% for Large Language Models and 40% for other models.

You can read more about method 1 here and about method 2 here.
Other parts of interest of this article include:
- We argue that the ratio of operations of backward and forward pass of neural networks is often close to 2:1. More.
- We discuss how the formula of method 1 changes for recurrent models. More.
- We argue that dropout does not affect the number of operations per forward and backward pass. More.
- We have elaborated a table with parameter and operation counts for common neural network layers. More.
- We give a detailed example of method 1. More.
- We discuss commonly used number representation formats in ML. More.
- We share an estimate of the average performance of GPU cards each year. More.
- We share some reported GPU usages in real experiments. More.
- We give a detailed example of method 2. More.
- We compare both methods and conclude they result in similar estimates. More.
- We discuss the use of profilers to measure compute. More.

|Multadds|Petaflops-day|
|:---:|:---:|
|Some authors measure the number of multiplications-and-additions (multadds) that happen during training. Often those make up the bulk of the computation, and since one multadd is two FLOP we can often estimate FLOP in terms of multadds by multiplying by 2. <br /><br /> Confusingly, some profilers consider a multadd as a single FLOP, since they are usually implemented as the single instruction Fused Multiply-Add (FMA) in the hardware. Since peak performance numbers of GPU specs usually consider a FMA as 2 FLOP we opt for that convention as well. |Another popular option is measuring in terms of petaflops-day, which is equivalent to the number of  floating point operations that can be done by a machine operating at a speed of one petaFLOP per second in a day; that is, 1e20 FLOP. <br /><br />PetaFLOP-day levels of training compute for ML models were first reported around ~2016, so this unit makes more sense when working with models from that date onwards.|
