---
layout: article
title: "Trends in GPU price-performance"
description: 'Using a dataset of 470 models of graphics processing units released between 2006 and 2021, we find that the amount of floating-point operations/second per $ doubles every ~2.5 years.'
tags: report
banner: true
image: assets/images/posts/2022/gpu-perf/banner.png

toc: auto

date: 2022-06-27

authors:
  - name: Marius Hobbhahn
  - name: Tamay Besiroglu
---

<style>
  .figure-flexbox {
    display: flex;
    flex-wrap: wrap;
  }

  .figure-flexbox figure {
    max-width: calc(min(100%, 345px));
  }

  @media (max-width: 1180px) {
    max-width: calc(min(100%, 490px));
  }
</style>


*We would like to thank Alyssa Vance, Ashwin Acharya, Jessica Taylor and the Epoch team for helpful feedback and comments.*

<br>

Executive Summary
===============================

Using a dataset of 470 models of graphics processing units (GPUs) released between 2006 and 2021, we find that the amount of floating-point operations/second per $ (hereafter FLOP/s per $) doubles every ~2.5 years. For top GPUs at any point in time, we find a slower rate of improvement (FLOP/s per $ doubles every 2.95 years), while for models of GPU typically used in ML research, we find a faster rate of improvement (FLOP/s per $ doubles every 2.07 years). GPU price-performance improvements have generally been slightly slower than the 2-year doubling time associated with Moore’s law, much slower than what is implied by Huang’s law, yet considerably faster than was generally found in prior work on trends in GPU price-performance.[^a] We aim to provide a more precise characterization of GPU price-performance trends based on more or higher-quality data, that is more robust to justifiable changes in the analysis than previous investigations.

<figure>
  <img src="{% link assets/images/posts/2022/gpu-perf/image2.png %}">
  <figcaption class="caption" markdown="1">
  Figure 1. Plots of FLOPs and FLOPs/dollar for our dataset and relevant trends from the existing literature
  </figcaption>
</figure>

<table>
  <thead>
    <tr>
      <th><p><span>Trend</span></p></th>
      <th><p><span>2x time</span></p></th>
      <th><p><span>10x time</span></p></th>
      <th><p><span>Metric</span></p></th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #d9d2e9">
      <td><p><span>Our dataset<br />(n=470)</span></p></td>
      <td><p><span>2.46 years <br />[2.24, 2.72]</span></p></td>
      <td><p><span>8.17 years <br />[7.45, 9.04]</span></p></td>
      <td><p><span>FLOPs/dollar</span></p></td>
    </tr>
    <tr style="background-color: #f6b26b">
      <td><p><span>ML GPUs<br />(n=26)</span></p></td>
      <td><p><span>2.07 years<br />[1.54, 3.13]</span></p></td>
      <td><p><span>6.86 years<br />[5.12, 10.39]</span></p></td>
      <td><p><span>FLOPs/dollar</span></p></td>
    </tr>
    <tr style="background-color: #b7b7b7">
      <td> <p> <span> Top GPUs<br /> (n=57) </span> </p> </td>
      <td> <p> <span> 2.95 years<br /> [2.54, 3.52] </span> </p> </td>
      <td> <p> <span> 9.81 years<br /> [8.45, 11.71] </span> </p> </td>
      <td> <p><span>FLOPs/dollar</span></p> </td>
    </tr>
    <tr style="background-color: #a2c4c9">
      <td> <p><span>Our data FP16 (n=91)</span></p> </td>
      <td> <p> <span> 2.30 years<br /> [1.69, 3.62] </span> </p> </td>
      <td> <p> <span> 7.64 years<br /> [5.60, 12.03] </span> </p> </td>
      <td> <p><span>FLOPs/dollar</span></p> </td>
    </tr>
    <tr style="background-color: #d9ead3">
      <td> <p><span>Moore’s law</span></p> </td>
      <td> <p><span>2 years</span></p> </td>
      <td> <p><span>6.64 years</span></p> </td>
      <td> <p><span>FLOPs</span></p> </td>
    </tr>
    <tr style="background-color: #f4cccc">
      <td> <p><span>Huang’s law</span></p> </td>
      <td> <p><span>1.08 years</span></p> </td>
      <td> <p><span>3.58 years</span></p> </td>
      <td> <p><span>FLOPs</span></p> </td>
    </tr>
    <tr style="background-color: #cfe2f3">
      <td>
        <p>
          <span>CPU historical (<a href="https://aiimpacts.org/trends-in-the-cost-of-computing/">AI Impacts, 2019</a>)</span>
        </p>
      </td>
      <td>
        <p><span>2.32 years</span></p>
      </td>
      <td>
        <p><span>7.7 years</span></p>
      </td>
      <td>
        <p><span>FLOPs/dollar</span></p>
      </td>
    </tr>
    <tr style="background-color: #cfe2f3">
      <td>
        <p>
          <span>
            <a href="https://aiimpacts.org/2019-recent-trends-in-gpu-price-per-flops/">
                Bergal, 2019
            </a>
          </span>
        </p>
      </td>
      <td>
        <p><span>4.4 years</span></p>
      </td>
      <td>
        <p><span>14.7 years</span></p>
      </td>
      <td>
        <p><span>FLOPs/dollar</span></p>
      </td>
    </tr>
  </tbody>
  <caption markdown="1">
    Table 1. Summary of our findings on GPU price-performance trends and relevant trends in the existing literature with the 95% confidence intervals in square brackets.
  </caption>
</table>

Introduction
============

GPUs are the dominant computing platform for accelerating machine learning (ML) workloads, and most (if not all) of the biggest models over the last five years have been trained on GPUs or other special-purpose hardware like tensor processing units (TPUs). Price-performance improvements in underlying hardware has resulted in a rapid growth of the size of ML training runs ([Sevilla et al., 2022](https://arxiv.org/abs/2202.05924)), and has thereby centrally contributed to the recent progress in AI.

The rate at which GPUs have been improving has been analyzed previously. For example, [Su et al., 2017](https://www.semanticscholar.org/paper/Multi-chip-technologies-to-unleash-computing-gains-Su-Naffziger/7ff96079f20fc5dbb399be8c6189464ef990692a) finds a 2.4-year doubling rate for GPU FLOPs from 2006 to 2017. [Sun et al., 2019](https://arxiv.org/abs/1911.11313) analyses over 4,000 GPU models and finds that FLOPS per watt doubles around every three to four years. By contrast, some have speculated that GPU performance improvements are more rapid than the exponential improvements associated with other microprocessors like CPUs (which typically see a 2 to 3-year doubling time, see [AI Impacts, 2019](https://aiimpacts.org/trends-in-the-cost-of-computing/)). Notable amongst these is the so-called Huang’s Law proposed by NVIDIA CEO, Jensen Huang, according to whom GPUs see a “25x improvement every 5 years” ([Mims, 2020](https://www.wsj.com/articles/huangs-law-is-the-new-moores-law-and-explains-why-nvidia-wants-arm-11600488001)), which would be equivalent to a ~1.1-year doubling time in performance.

There is previous work that specifically analyzes price-performance across CPUs and GPUs (summarized in Table 1). Prior estimates of the rate of improvement vary widely (e.g. the time it takes for price-performance to increase by 10-fold ranges from ~6 to ~15 years, depending on the computing precision—see Table 2.). Due to the high variance of previous approaches and their usage of smaller datasets, we are not confident in existing estimates.[^b]

<style>
  @media (min-width: 1180px) {
    #table-2 tr th:nth-child(2) {
      width: 8em;
    }
  }
</style>

<table id="table-2">
  <thead>
    <tr>
      <th><strong>Reference</strong></th>
      <th><strong>Processor type</strong></th>
      <th><strong>Metric</strong></th>
      <th><strong>2x time</strong></th>
      <th><strong>10x time</strong></th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #f4cccc">
      <td><a href="https://aiimpacts.org/2019-recent-trends-in-gpu-price-per-flops/">Bergal, 2019</a></td>
      <td>GPU</td>
      <td>FLOP/$ in FP32, FP16, and FP16 fused multiply-add</td>
      <td>4.4 years (FP32)<br> 3.0 years (FP16)<br> 1.8 years (FP16 fused)</td>
      <td>14.7 years (FP32)<br> 10.0 years (FP16)<br> 6.1 years (FP16 fused)</td>
    </tr>
    <tr style="background-color: #fff2cc">
      <td><a href="http://mediangroup.org/docs/Feasibility%20of%20Training%20an%20AGI%20using%20Deep%20Reinforcement%20Learning,%20A%20Very%20Rough%20Estimate.pdf">Median Group, 2018</a></td>
      <td>GPU</td>
      <td>FLOPS/$ in FP32</td>
      <td>1.5 years</td>
      <td>5.0 years</td>
    </tr>
    <tr style="background-color: #d9ead3">
      <td><a href="https://intelligence.org/2014/05/12/exponential-and-non-exponential/#footnote_7_11027">Muehlhauser and Rieber, 2014</a></td>
      <td>Various</td>
      <td>MIPS/$</td>
      <td>1.6 years</td>
      <td>5.2 years</td>
    </tr>
    <tr style="background-color: #c9daf8">
      <td><a href="http://www.fhi.ox.ac.uk/brain-emulation-roadmap-report.pdf">Sandberg and Bostrom, 2008</a></td>
      <td>CPU-based</td>
      <td>MIPS/$ and FLOP/$</td>
      <td>1.7 years (MIPS)<br> 2.3 (FLOPS)</td>
      <td>5.6 years (MIPS)<br> 7.7 years (FLOPS)</td>
    </tr>
    <tr style="background-color: #d9d2e9">
      <td><a href="https://web.archive.org/web/20160222082744/http://www.econ.yale.edu/~nordhaus/homepage/prog_083001a.pdf">Nordhaus, 2001</a></td>
      <td>CPU-based</td>
      <td>MIPS/$</td>
      <td>1.6 years</td>
      <td>5.3 years</td>
    </tr>
  </tbody>
  <caption class="caption" markdown="1">
    Table 2. Price-performance improvements found in prior work. See also [AI Impacts 2015](https://aiimpacts.org/trends-in-the-cost-of-computing/#Evidence) for a more detailed overview of prior estimates.
  </caption>
</table>

We aim to extend the existing work with three main contributions:

1. Using a larger dataset of GPU models than has been analyzed in previous investigations that includes more recent GPU models, we produce more precise estimates of the rate of price-performance improvements for GPUs than currently exists[^1]
2. We analyze multiple key subtrends for GPU price-performance improvements, such as the trends in price-performance for top-performing GPU and for GPUs commonly used for Machine Learning
3. We put the trends into perspective by comparing them against prior estimates, Moore’s law, Huang’s law, prior analyses, and public predictions on GPU performance

Dataset
=======

We combine two existing datasets on GPU price-performance. One dataset is from the Median Group, which contains data on 223 Nvidia and AMD GPUs ([Median Group, 2018](http://mediangroup.org/docs/Feasibility%20of%20Training%20an%20AGI%20using%20Deep%20Reinforcement%20Learning,%20A%20Very%20Rough%20Estimate.pdf)). The second dataset is from [Sun et al., 2019,](https://arxiv.org/pdf/1911.11313.pdf) which contains price-performance data on 413 GPUs released by Nvidia, Intel and AMD.

<figure>
  <img src="{% link assets/images/posts/2022/gpu-perf/image7.png %}">
  <figcaption class="caption" markdown="1">
  Figure 2. Plots of FLOPs and FLOPs/dollar for Median Group’s and [Sun et al., 2019](https://arxiv.org/pdf/1911.11313.pdf)’s datasets.
  </figcaption>
</figure>

We merged both datasets and removed duplicate observations, i.e. GPU models that were contained in both datasets. Furthermore, we removed different versions of the same product unless they had different specifications.[^2]

We also decided to drop observations prior to 2006 for two main reasons: 1) it is unclear whether the we can meaningfully compare their levels of performance as these models predate innovations that enable general-purpose computing on GPUs, and 2) we were not able to validate the accuracy of the data by looking up the relevant performance details in models’ data sheets. For a more detailed discussion see [Appendix A](#appendix-a---dropping-data-before-2006). 

Finally, we noticed that there is a subset of 20 GPUs for which the 16-bit performance is ~60-fold worse than its performance in 32-bit format, while for all other GPUs the 16-bit performance is at least as good as its 34-bit performance. We dropped these 16-bit performance numbers, which we think might have been erroneous. 

The final dataset thus contains 470 GPUs from AMD, Intel, and Nvidia released between 2006 and 2021. We will refer to this merged dataset as “our dataset” for the rest of the report. Throughout, FLOPs are those in 32-bit (full) precision.

<figure>
  <img src="{% link assets/images/posts/2022/gpu-perf/image9.png %}">
  <figcaption class="caption" markdown="1">
  Figure 3. Plots of FLOPs and FLOPs/dollar for the dataset used in our analysis
  </figcaption>
</figure>

Empirical analysis
==================

In what follows, we analyze trends in price-performance, measured in FLOPs/dollar as well as raw performance in FLOPs for GPUs in our dataset. Our analysis considers key subsets, such as GPUs commonly used in Machine Learning research, as well as top-performing GPUs.[^3] 

Empirical trend vs. other predictions
-------------------------------------

To put our findings in context, we compare them with other proposed GPU (price) performance trends found elsewhere. These are

* Moore’s law, which states that a transistor density doubled every two years. For the purpose of comparison, we take that to mean that the amount of FLOPs also doubles every two years
* [Huang’s law](https://en.wikipedia.org/wiki/Huang%27s_law), which describes the rate of performance improvements for GPUs. While there are multiple interpretations of Huang’s law, we chose the one that reflects Huang’s original wording, namely “25x improvement every 5 years”
* Historical trends in CPU price-performance, which has been found to increase by a factor of 10 every 7.7 years since 1940 ([AI Impacts, 2019](https://aiimpacts.org/trends-in-the-cost-of-computing/))
* The prediction made in [Cotra 2020](https://www.alignmentforum.org/posts/KrJfoZzpSDpnrv9va/draft-report-on-ai-timelines) of a 2.5-year doubling time in price-performance of compute relevant to Machine Learning training runs[^4]
* Prior estimates of the rate of GPU price-performance found by [Bergal, 2019](https://aiimpacts.org/2019-recent-trends-in-gpu-price-per-flops/)

We recognize that some of these trends are not quite comparable to FLOP/s per $ (Moore’s law relates to the density of circuits, Huang’s law relates to theoretical performance improvements, while [Cotra 2020](https://www.alignmentforum.org/posts/KrJfoZzpSDpnrv9va/draft-report-on-ai-timelines)’s predictions relates to FLOP per dollar[^5]). The purpose of these comparisons is just to provide a rough sense of how our estimated trends relate to relevant empirical trends and predictions.

Unless specified otherwise, we will present the results for FLOPs/dollar. This is because we a) think that FLOPs/dollar is the more relevant trend as argued previously and b) because there is not that much of a difference between FLOPs and FLOPs/dollar trends. For a detailed comparison see [Appendix B](#appendix-b---robustness-check-for-flops).

<figure>
  <img style="max-width: calc(min(100%, 600px))" src="{% link assets/images/posts/2022/gpu-perf/image11.png %}">
  <figcaption class="caption" markdown="1">
  Figure 4. FLOPs/dollar for our dataset and relevant trends found elsewhere
  </figcaption>
</figure>

We find that a linear regression through all of our data shows a doubling time of 2.46 years (95% CI: 2.24 to 2.72 years). This is very well in line with the slope of 2.5 used in [Cotra 2020](https://www.alignmentforum.org/posts/KrJfoZzpSDpnrv9va/draft-report-on-ai-timelines). We can also see that Huang’s law is not a good fit for the entire trend and is strongly overstated.

Trends across precision for floating formats
--------------------------------------------

Half-precision computing (FP16) and mixed-precision computing (usually FP16 and FP32) are now commonly used for deep learning. In our dataset, we had 91 GPUs for which we had both price and FP16 performance numbers.[^6] 

<figure>
  <img style="max-width: calc(min(100%, 600px))" src="{% link assets/images/posts/2022/gpu-perf/image14.png %}">
  <figcaption class="caption" markdown="1">
  Figure 5. FLOPs/dollar for FP32 and FP16 performance
  </figcaption>
</figure>

We find that the price-performance doubling time in FP16 was 2.32 years (95% CI: 1.69 years, 3.62 years). This was significantly different from the slope for the doubling time for price-performance in FP32, suggesting that price-performance improvements in FP16 and FP32 are likely to be similar. This stands in contrast to the findings of [Bergal, 2019](https://aiimpacts.org/2019-recent-trends-in-gpu-price-per-flops/), which finds a 1.8-year doubling time for FP16 FMA.[^7] In what follows, we decide to focus on price-performance in FP32 as we do not find a statistically significant difference between the two trends, and we therefore choose to analyze the models for which we have the most data on.

Trends of GPUs used in ML
-------------------------

The vast majority of all ML training is done on a very small number of different models of GPUs. From a [previous publication](https://arxiv.org/abs/2202.05924) where we looked at 75 papers that present milestone ML models, we collected a total of 42 distinct models of GPUs commonly used to train ML systems. In total, we found 26 of these 42 GPUs in our dataset on GPUs.

We find that the price-performance of GPUs used in ML improves faster than the typical GPU. We find that FLOPs/dollar for ML GPUs double every 2.07 years (95% CI: 1.54 to 3.13 years) compared to 2.46 years for all GPUs. This is not significantly different from the slope for the doubling time for price-performance for all GPUs.

<figure>
  <img style="max-width: calc(min(100%, 620px))" src="{% link assets/images/posts/2022/gpu-perf/image6.png %}">
  <figcaption class="caption" markdown="1">
  Figure 6. FLOPs/dollar for our dataset and separately for GPU models commonly used in ML research compared to relevant trends found elsewhere
  </figcaption>
</figure>

Furthermore, the latest ML GPUs tend to be among the GPUs with high price-performance, whereas the older ones are more middle of the pack. 

Moreover, when looking through the FLOPs lens, it becomes even more clear that the latest ML experiments use the most powerful GPUs. We think that shows the increased importance of GPUs for modern ML. Once again, the ML GPUs show a steeper slope than the general trend (doubling time of 2.00 years compared to 2.31 years for all GPUs).

  
Our higher point estimate for the rate of performance improvements amongst GPUs used for ML research could be explained by relevant labs spending more resources on procuring top GPUs over time. If this were the case, this would reflect merely a change in investment decisions by relevant research labs and not a faster-than-usual rate of improvement of the underlying hardware amongst the relevant GPUs suitable for ML workloads. Given this, and because our estimates for the entire GPUs is not statistically significantly different, we expect that the ~2.5 year doubling time to be a more reliable estimate of the underlying rate of hardware price-performance improvements.

Trend of top-performing GPUs
----------------------------

As we saw in the previous section, the latest ML models tend to be trained on state-of-the-art GPUs. Therefore, looking at the trend of top-performing GPUs might be a good indicator for ML capabilities in the future. Note, that this does not imply that we think that GPU performance will grow linearly. We will publish more detailed thoughts on predictions from this data in a second piece.

Here, we select the subset of GPUs that had the highest FLOPs per dollar values during each month. For this subset of models, we find a doubling time of 2.95 years (95% CI: 2.54 to 3.52 years), which is statistically significantly longer than the typical doubling time. 

<figure>
  <img style="max-width: calc(min(100%, 620px))" src="{% link assets/images/posts/2022/gpu-perf/image10.png %}">
  <figcaption class="caption" markdown="1">
  Figure 7. FLOPs per dollar for our dataset and separately for top-performing GPUs compared to relevant trends found elsewhere
  </figcaption>
</figure>

All trends (table & figure)
---------------------------

To compare all the trends we highlighted above and the ones you can find in the appendix, we collected all trends, and for each, report the associated time it takes to increase 2x and 10x.

<style>
  @media (min-width: 1180px) {
    #table-3 tr th:nth-child(2) {
      width: 6em;
    }
  }
</style>

<table id="table-3">
  <thead>
    <tr>
      <th>Trend</th>
      <th>Original presentation</th>
      <th>2x time</th>
      <th>10x time</th>
      <th>Reference</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background-color: #d9ead3">
      <td>Moore’s law</td>
      <td>2x every 2 years</td>
      <td>2 years</td>
      <td>6.64 years</td>
      <td>FLOPs</td>
    </tr>
    <tr style="background-color: #f4cccc">
      <td>Huang’s law</td>
      <td>25x every 5 years</td>
      <td>1.08 years</td>
      <td>3.58 years</td>
      <td>FLOPs</td>
    </tr>
    <tr style="background-color: #d0e0e3">
      <td>Biological anchors report (<a href="https://www.lesswrong.com/posts/KrJfoZzpSDpnrv9va/draft-report-on-ai-timelines&amp;sa=D&amp;source=editors&amp;ust=1656344719876336&amp;usg=AOvVaw2i9SKlYv4rV31-zjyBCI1V">Cotra, 2020</a>)</td>
      <td>2x every 2.5 years</td>
      <td>2.5 years</td>
      <td>8.30 years</td>
      <td>FLOPs/dollar</td>
    </tr>
    <tr style="background-color: #cfe2f3">
      <td>CPU historical (<a href="https://aiimpacts.org/trends-in-the-cost-of-computing/&amp;sa=D&amp;source=editors&amp;ust=1656344719878007&amp;usg=AOvVaw1tSSji93R6BI_tQm87PjPW">AI Impacts, 2019</a>)</td>
      <td>10x every 7.7 years</td>
      <td>2.32 years</td>
      <td>7.7 years</td>
      <td>FLOPs/dollar</td>
    </tr>
    <tr style="background-color: #fff2cc">
      <td><a href="http://mediangroup.org/docs/Feasibility%20of%20Training%20an%20AGI%20using%20Deep%20Reinforcement%20Learning,%20A%20Very%20Rough%20Estimate.pdf">Median Group, 2018</a></td>
      <td>2x every 1.5 years</td>
      <td>1.5 years</td>
      <td>1.5 years</td>
      <td>FLOPs/dollar</td>
    </tr>
    <tr style="background-color: #d9d2e9">
      <td>Our data (n=470)</td>
      <td>-</td>
      <td>2.46 years [2.24, 2.72]</td>
      <td>8.17 years [7.45, 9.04]</td>
      <td>FLOPs/dollar</td>
    </tr>
    <tr style="background-color: #d9d2e9">
      <td>Our data (n=470)</td>
      <td>-</td>
      <td>2.31 years[2.14, 2.51]</td>
      <td>7.68 years[7.12, &nbsp;8.33]</td>
      <td>FLOPs</td>
    </tr>
    <tr style="background-color: #a2c4c9">
      <td>Our data FP16 (n=91)</td>
      <td>-</td>
      <td>2.30 years[1.69, 3.62]</td>
      <td>7.64 years[5.60, 12.03]</td>
      <td>FLOPs/dollar</td>
    </tr>
    <tr style="background-color: #a2c4c9">
      <td>Our data FP16 (n=91)</td>
      <td>-</td>
      <td>2.91 years[1.94, 5.83]</td>
      <td>9.68 years[6.45, 19.35]</td>
      <td>FLOPs</td>
    </tr>
    <tr style="background-color: #f6b26b">
      <td>ML GPUs (n=26)</td>
      <td>-</td>
      <td>2.07 years[1.54, 3.13]</td>
      <td>6.86 years[5.12, 10.39]</td>
      <td>FLOPs/dollar</td>
    </tr>
    <tr style="background-color: #f6b26b">
      <td>ML GPUs (n=26)</td>
      <td>-</td>
      <td>2.00 years[1.69, 2.43]</td>
      <td>6.63 years[5.63, &nbsp;8.07]</td>
      <td>FLOPs</td>
    </tr>
    <tr style="background-color: #b7b7b7">
      <td>Top GPUs (n=57)</td>
      <td>-</td>
      <td>2.95 years[2.54, 3.52]</td>
      <td>9.81 years[8.45, 11.71]</td>
      <td>FLOPs/dollar</td>
    </tr>
    <tr style="background-color: #b7b7b7">
      <td>Top GPUs (n=57)</td>
      <td>-</td>
      <td>2.69 years[2.40, &nbsp;3.30]</td>
      <td>8.92 years[7.99, 10.95]</td>
      <td>FLOPs</td>
    </tr>
  </tbody>
  <caption markdown="1">
  Table 3. Summary of our findings on GPU price-performance trends and relevant trends in the existing literature. 95% confidence intervals are displayed in square brackets.
  </caption>
</table>

<figure>
  <img style="max-width: calc(min(100%, 544px));" src="{% link assets/images/posts/2022/gpu-perf/image4.png %}">
</figure>
<figure>
  <img style="max-width: calc(min(100%, 544px));" src="{% link assets/images/posts/2022/gpu-perf/image5.png %}">
</figure>
<figcaption class="caption" markdown="1">
Figure 8. FLOPs per dollar for our dataset and various subgroups compared to relevant trends found elsewhere
</figcaption>

Conclusion
==========

We find that the trend of all data shows a doubling time of 2.46 years, the trend implied by GPUs used in ML shows a doubling time of 2.07 years and the trend implied by every month’s top GPU shows a doubling time of 2.95. We think that a doubling time below 2 years or above 3 years is implausible given the data. Furthermore, we think that part of the trend in ML GPUs can be explained by ML prioritizing better GPUs rather than actual hardware advances. We, therefore, think that a doubling time of 2 years is too aggressive and ~2.5 years accurately describes the doubling time of price-performance for GPUs over the past 15 years.

Appendix A - dropping data before 2006
======================================

On balance, we felt like the arguments for keeping the data were weaker than for removing them. In short, it’s very unclear whether pre-2006 data are measured in a comparable way and whether pre-2006 GPUs are even really comparable to post-2006 GPUs.

Arguments for including pre-2006 data:

1. The median group provides the data and somehow got a hold of the estimated FLOPs

Arguments against including pre-2006 data:

<ol>
  <style>
    .no-flops { background-color: #f4cccc; }
    .yes-flops { background-color: #d9ead3; }
  </style>
  <li>The data just looks fishy in the graph</li>
  <li>Alyssa Vance pointed out in a comment that general-purpose GPUs have not been developed until 2005 and cuda didn’t exist until 2007. This means we are talking about some very different GPUs that have little to do with the GPUs we are talking about today.</li>
  <li>The measure of “theoretical performance” is unavailable for most pre-2006 GPUs. It is therefore unclear how this data was initially collected.
    <ol>
      <li>List of pre-2006 GPUs:
        <ol>
          <li><span class="no-flops">GeForce 2 GTS Pro (<a href="https://www.techpowerup.com/gpu-specs/geforce2-gts-pro.c1722">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce 3 (<a href="https://www.techpowerup.com/gpu-specs/geforce3.c738">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce 3 Ti500 (<a href="https://www.techpowerup.com/gpu-specs/geforce3-ti500.c741">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce 3 Ti200 (<a href="https://www.techpowerup.com/gpu-specs/geforce3-ti200.c742">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5200 (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5200.c60">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5200 Ultra (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5200-ultra.c61">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5600 Ultra (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5600-ultra.c65">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5800 (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5800.c703">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5800 Ultra (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5800-ultra.c74">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5900 / 5900 XT / 5900 ZT (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5900-zt.c75">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5700 Ultra (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5700-ultra.c70">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5950 Ultra (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5950-ultra.c79">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce FX 5900 Ultra (<a href="https://www.techpowerup.com/gpu-specs/geforce-fx-5900-ultra.c704">no FLOPs</a>)</span></li>
          <li><span class="no-flops">GeForce 6200 TurboCache 64-TC/256MB (<a href="https://www.techpowerup.com/gpu-specs/geforce-6200-turbocache.c909">no FLOPs</a>)</span></li>
          <li><span class="yes-flops">ATI Xbox 360 GPU 90nm (<a href="https://www.techpowerup.com/gpu-specs/xbox-360-gpu-90nm.c1919#:~:text=The%20Xbox%20360%20GPU%2090nm,device%20supports%20DirectX%209.0c.">YES FLOPs</a>)</span></li>
        </ol>
      </li>
      <li>After 2006 it looks like the GPU model cards contain this FP32 FLOPs performance. Here are some samples
        <ol>
          <li><span class="no-flops">GeForce 7900 GX2 (2006, <a href="https://www.techpowerup.com/gpu-specs/geforce-7900-gx2.c172">no FLOPs</a>)</span></li>
          <li><span class="yes-flops">GeForce 8800 GTX (2006, <a href="https://www.techpowerup.com/gpu-specs/geforce-8800-gtx.c187">YES FLOPs</a>)</span></li>
          <li><span class="yes-flops">GeForce 8800 GTS 640 (2006, <a href="https://www.techpowerup.com/gpu-specs/geforce-8800-gts-640.c757">YES FLOPs</a>)</span></li>
          <li><span class="yes-flops">GeForce 8600 GT (2007, <a href="https://www.techpowerup.com/gpu-specs/geforce-8600-gt.c198">YES FLOPs</a>)</span></li>
          <li><span class="yes-flops">GeForce 8500 GT (2007, <a href="https://www.techpowerup.com/gpu-specs/geforce-8500-gt.c765">YES FLOPs</a>)</span></li>
          <li><span class="yes-flops">Radeon HD 2900 XT (2007, <a href="https://www.techpowerup.com/gpu-specs/radeon-hd-2900-xt.c192">YES FLOPs</a>)</span></li>
          <li><span>Trend continues afterward</span></li>
        </ol>
      </li>
    </ol>
  </li>
</ol>

Appendix B - Robustness check for FLOPs
=======================================

In our dataset, we only look at GPUs for which we have the FLOPs and price information since we are interested in performance and price. However, there are many more GPUs that have performance information than ones for which we have both performance and price. We find 1848 data points for which we have FLOPs data. To make sure that there is no selection effect, we also analyze the trend from “just FLOPs”. 

<figure>
  <img src="{% link assets/images/posts/2022/gpu-perf/image3.png %}">
  <figcaption class="caption" markdown="1">
  Figure 9: empirical FLOPs with all GPUs that we have FLOPs information for
  </figcaption>
</figure>

We find that it pretty much aligns exactly with what we see from our previous selection and therefore preliminary conclude that there is no reason to discard our previous findings. We additionally see that the GPUs for which we have price data tend to be the ones with higher FLOPs values. We speculate that more powerful GPUs are used more often and therefore have higher availability of price information. 

### More FLOPs plots

For all the plots used in the paper, there is also a version in which we only look at FLOPs information. Note, that this is not the “just-FLOPs” data from the previous section. Rather it is the same dataset as used in the main text but we didn’t divide it by price. 

<div class="figure-flexbox">
  <figure>
    <img src="{% link assets/images/posts/2022/gpu-perf/image1.png %}">
    <figcaption class="caption">
    Figure 10: empirical FLOPs for our dataset
    </figcaption>
  </figure>

  <figure>
    <img src="{% link assets/images/posts/2022/gpu-perf/image4.png %}">
    <figcaption class="caption">
    Figure 11: empirical FLOPs for our dataset with subset of GPUs used for ML
    </figcaption>
  </figure>

  <figure>
    <img src="{% link assets/images/posts/2022/gpu-perf/image13.png %}">
    <figcaption class="caption">
    Figure 12: empirical FLOPs for the GPUs with the highest FLOPs value for every month
    </figcaption>
  </figure>

  <figure>
    <img src="{% link assets/images/posts/2022/gpu-perf/image12.png %}">
    <figcaption class="caption">
    Figure 13: empirical FLOPs for top FLOP GPUs and ML GPUs combined
    </figcaption>
  </figure>
</div>

<br>

<figure>
  <img src="{% link assets/images/posts/2022/gpu-perf/image8.png %}">
  <figcaption class="caption" markdown="1">
  Figure 14: empirical FLOPs for FP16 and FP32
  </figcaption>
</figure>

We did not include these in the main text because they show very similar slopes as the FLOPs/dollar and we think FLOPs/dollar is the more important metric. 

---

[^a]: This work *does not* attempt to project future GPU price-performance but merely to take stock of the recent historical trend. In future work, we intend to investigate what GPU price-performance trends informs us about historical growth in hardware spending in Machine Learning and future large Machine Learning training runs.

[^b]: Moreover, we had discovered issues in estimates from a prior investigation by the [Median Group (2018)](http://mediangroup.org/gpu.html), which we have since pointed out to them, and which they have since corrected.

[^1]: We unfortunately can’t publish our data but the code that generated all the figures can be found [here](https://colab.research.google.com/drive/1wGoqa1ErAzuzDZ6hgLrhubS6YHWNAp9I?usp%3Dsharing). 

[^2]: For example, consider NVIDIA Tesla K40c and NVIDIA Tesla K40d to be the same models, as these have essentially identical specifications.

[^3]: We focus primarily on these metrics as we are mostly interested in questions related to the amount of compute that might be deployed for large AI experiments. While there are other metrics that might be of interest (such as energy efficiency), we do not consider these here as they relate less directly to the questions motivating our work, and because these have been analyzed in prior work, notably in [Sun et al., 2019](https://arxiv.org/pdf/1911.11313.pdf).

[^4]: This is our interpretation of section 4 of her draft report, where she writes “I also assume that effective FLOP per dollar is doubling roughly once every 2.5 years around 2025. This is slower than Moore’s law (which posits a ~1-2 year doubling time and described growth reasonably well until the mid-2000s) but faster than growth in effective FLOP per dollar from ~2008 to 2018 (a doubling time of ~3-4 years)”

[^5]: FLOP per dollar in [Cotra 2020](https://www.alignmentforum.org/posts/KrJfoZzpSDpnrv9va/draft-report-on-ai-timelines) refers to the total amount of computation that can be done per dollar.

[^6]: We also took an initial look at FP64 performance but decided not to include the analysis because FP64 performance seems to be much lower than FP32 performance for newer GPUs. We interpret this as GPU companies deprioritizing FP64 in favor of FP32 and FP16.

[^7]: This is, we suspect, due to the fact that their approach involves analyzing the moving optima—which, in their case, involves analyzing 9 data points, which we think is insufficient to yield confidence in their point estimate.

