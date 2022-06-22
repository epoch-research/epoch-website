---
layout: article
title: "How to measure FLOP/s for Neural Networks empirically?"
subtitle: Subtitle
image: assets/images/posts/2022/measure-FLOPs-empirically.png
description: Computing the utilization rate for multiple Neural Network architectures. 
external_url: https://www.alignmentforum.org/s/T9pBzinPXYB3mxSGi/p/jJApGWG95495pYM7C
tags: report

toc: auto

date: 2021-11-29

banner: true

authors:
  - name: Marius Hobbhahn

---

Experiments and text by Marius Hobbhahn. I would like to thank Jaime Sevilla, Jean-Stanislas Denain, Tamay Besiroglu, Lennart Heim, and Anson Ho for their feedback and support. 

# Summary

We measure the utilization rate of a Tesla P100 GPU for training different ML models. Most architectures and methods result in a utilization rate between 0.3 and 0.75. However, two architectures result in implausible low utilization rates of lower than 0.04. The most probable explanation for these outliers is that FLOP for inverted bottleneck layers are not counted correctly by the profiler. In general, the profiler we use shows signs of under- and overcounting and there is a possibility we made errors.

## Findings

*   Counting the FLOP for a forward pass is very simple and many different packages give correct answers.
*   Counting the FLOP for the backward pass is harder and our estimator of choice makes weird overcounting and undercounting errors.
*   After cleaning mistakes, it is very likely that the backward/forward ratio is 2:1 (at least for our setup).
*   After correcting for the overcounting issues, we get empirical utilization rates between 0.3 and 0.75 for most architectures. Theoretical predictions and empirical measurements seem very consistent for larger batch sizes.

<figure>
  <img src="https://lh4.googleusercontent.com/cH6b6WvmA5mrSaYzOFeMiFoIFWvb1OeYllX74AUMdK95LMZ3WHd7jymmFHg9S0zHuv_8FRsDubDHA68bMbAu74rD7BNhuAwWf-QeiSVxxQOqxqI6Fr3SCPC5BHqeG_cYsJLZbukq">
  <figcaption>
Estimated GPU utilization rates on different architectures, using four different estimation setups.
  </figcaption>
</figure>

# Introduction

In the “Parameter, Compute and Data Trends in Machine Learning" project we wanted to estimate GPU utilization rates for different Neural Networks and GPUs. While this sounds very easy in theory, it turned out to be hard in practice. 

*Utilization rate = empirical performance / peak performance*
{:.centered}

The post contains a lot of technical jargon. If you are just here for the results, skip to the [Analysis section](#analysis).

I don’t have any prior experience in estimating FLOP. It is very possible that I made rookie mistakes. Help and suggestions are appreciated. 

Other work on computing and measuring FLOP can be found in Lennart Heim's sequences [Transformative AI and Compute](https://forum.effectivealtruism.org/s/4yLbeJ33fYrwnfDev). It's really good.

# Methods for counting FLOP

In this post, we use FLOP to denote floating-point operations and FLOP/s to mean FLOP per second. 

We can look up the peak FLOP/s performance of any GPU by checking its datasheet (see e.g. [NVIDIA’s Tesla P100](https://images.nvidia.com/content/tesla/pdf/nvidia-tesla-p100-PCIe-datasheet.pdf)). To compare our empirical performance to the theoretical maximum, we need to measure the number of FLOP and time for one training run. This is where things get confusing. 

Packages such as PyTorch’s [fvcore](https://detectron2.readthedocs.io/en/latest/modules/fvcore.html), [ptflops](https://github.com/sovrasov/flops-counter.pytorch/tree/master/ptflops) or [pthflops](https://github.com/1adrianb/pytorch-estimate-flops) hook onto your model and compute the FLOP for one forward pass for a given input. However, they can’t estimate the FLOP for a backward pass. Given that we want to compute the utilization rate for the entire training, accurate estimates of FLOP for the backward pass are important. 

PyTorch also provides a list of packages called profilers, e.g. in the [main package](https://pytorch.org/docs/stable/profiler.html) and [autograd](https://pytorch.org/docs/stable/autograd.html#profiler). The profilers hook onto your model and measure certain quantities at runtime, e.g. CPU time, GPU time, FLOP, etc. The profiler can return aggregate statistics or individual statistics for every single operation within the training period. Unfortunately, these two profilers seem to not count the backward pass either. 

[NVIDIA offers an alternative way of using the profiler with Nsight Systems](https://docs.nvidia.com/deeplearning/frameworks/pyprof-user-guide/profile.html) that supposedly estimates FLOP for forward and backward pass accurately. This would suffice for all of our purposes. Unfortunately, we encountered problems with the estimates from this method. It shows signs of over- and undercounting operations. While we could partly fix these issues post-hoc, there is still room for errors in the resulting estimates. 

NVIDIA also offers a profiler called [dlprof](https://docs.nvidia.com/deeplearning/frameworks/dlprof-user-guide/). However, we weren’t able to run it in Google Colab (see [appendix](#appendix)). 

# Our experimental setup

We try to estimate the empirical utilization rates of 13 different conventional neural network classification architectures (resnet18, resnet34, resnet50, resnet101, resnet152, vgg11, vgg13, vgg16, vgg19, wide\_resnet50\_2, alexnet, mobilenet\_v2, efficientnet\_b0) with different batch sizes for some of them. For all experiments, we use the [Tesla P100](https://images.nvidia.com/content/tesla/pdf/nvidia-tesla-p100-PCIe-datasheet.pdf) GPU which seems to be the default for Google Colab. All experiments have been done in Google Colab and can be reproduced [here](https://drive.google.com/drive/folders/1yFLAafYtyeJcAnnTbqv4sAd2KJaboKrt?usp=sharing).

We estimate the FLOP for a forward pass with fvcore, ptflops, pthflops and the PyTorch profiler. Furthermore, we compare them to the FLOP for forward and backward pass estimated by the profiler + nsight systems method (which we name profiler\_nvtx). We measure the time for all computations once with the profiler and additionally with profiler\_nvtx to get comparisons. 

One problem for the estimation of FLOP is that fvcore, ptflops and pthflops seem to count a [Fused Multiply Add (FMA)](https://en.wikipedia.org/wiki/FMA_instruction_set) as one operation while the profiler methods count it as 2. Since basically all operations in NNs are FMAs that means we can just divide all profiler estimates by 2. We already applied this division to all estimates, so you don’t have to do it mentally. However, this is one potential source for errors since some operations might not be FMAs. 

Furthermore, it is not 100 percent clear which FMA convention was used for the peak performance. [On their website](https://docs.nvidia.com/gameworks/content/developertools/desktop/analysis/report/cudaexperiments/kernellevel/achievedflops.htm), NVIDIA states *“The peak single-precision floating-point performance of a CUDA device is defined as the number of CUDA Cores times the graphics clock frequency multiplied by two. The factor of two stems from the ability to execute two operations at once using fused multiply-add (FFMA) instructions”*.   
We interpret this statement to mean that NVIDIA used the FMA=2FLOP assumption. However, PyTorch automatically transforms all single-precision tensors to half-precision during training. Therefore, we get a speedup factor of 2 (which cancels the FMA=2FLOP)

For all experiments, we use input data of sizes 3x224x224 with 10 classes. This is similar to many common image classification setups. We either measure on single random batches of different sizes or on the test set of CIFAR10 containing 10000 images. 

# Analysis

## Something is fishy with profiler_nvtx

To understand the estimates for the profiler\_nvtx better, we run just one single forward and backward pass with different batch sizes. If we compare the profiler\_nvtx FLOP estimates for one forward pass on a random batch of size one, we see that they sometimes don’t align with all other estimates. 

<figure>
  <img src="https://lh3.googleusercontent.com/mVPRuZimITOE_Oqw0TpyLafF6nKSobYx5_mJV4mwlTNgpzInQPMX2Kk5SfEs-2M7kFoBzkpm85YEXRGayjuAlvMqBYIU4GPfDVdA7ksNjHwYV3_FpRToacO5Z3md-Dx1Vc5z0_Sf">
</figure>

The first four methods basically always yield very comparable estimates and just profiler_nvtx sometimes undercounts quite drastically. 

But it gets worse —profiler_nvtx is inconsistent with its counting. We expected the number of FLOP for a batch size of 64 to be 64 times as large as for a batch size of 1, and the number of FLOP for a batch size of 128 to be 128 times as large as for a batch size of 1. However, this is not the case for both the forward and backward pass. 

<figure>
  <img src="https://lh6.googleusercontent.com/wR7B2z5SiqCHFKKP-crHflR6IIMQl3Ydo3wQfjtT94AsIyC-JIm3TgQoDRuHX-MAtn5uUAlHFxIeQLa23DAwtgR_mYq6ybOJj4a2SjkZIw293Bwgyg1hWcD3-ix4BXS5dpASB0Zi">
</figure>

<figure>
  <img src="https://lh4.googleusercontent.com/Nu8U3pPPX7tmEajhHZjjel_UepXt2-e5qBHyscqNIr2pdCqtPmw10rULgyHZhBfSPJLaR2iutBpSyf4S-wMbPXvuJO_WruGxhERjON_7CmTJoSq6haWeWc1FkyeYNWbVSxgMWKMz">
</figure>

All FLOP estimates have been normalized by the batch size. Thus, if our profiler counted correctly, all bars would have exactly the same height. This is not what we observe in some networks, which suggests that something is off. Some networks don’t have estimates for a batch size of 128 since it didn’t fit into the GPU memory. 

To check whether profiler_nvtx is over- or undercounting we investigate it further.

## Investigating profiler_nvtx further

Since the problems from above cause all analyses to be very uncertain, we try to find out what exactly is wrong and if we can fix it in the following section. If you don’t care about that, skip to the Results section.

If we compare the counted FLOP by operation, e.g. on alexnet, we make multiple discoveries. 

*   **FMAs:** We find that profiler\_nvtx counts exactly 2x as many FLOP as fvcore (red in table) since profiler\_nvtx counts FMAs as 2 and fvcore as 1 FLOP. For the same reason, profiler_nvtx counts 128 as many operations when we use a batch size of 64 (blue in table).
*   **Undercounting:** In some cases (green in table) profiler_nvtx just doesn’t register an operation and therefore counts 0 FLOP.
*   **Overcounting:** In other cases (yellow in table), profiler_nvtx counts the same operation multiple times for no apparent reason.

<figure>
  <img src="https://lh4.googleusercontent.com/joeogGpfisxYxSDzvn_uVgby_EC-kIZ9m4pphxC8LLEjuqP5CLjxSZ2aEf-j_c_0qL1YGk9Oq1PkC3Fo9pFEb-goL-bPOXMLlkI86VvH6RSIVxycyuzt5UIVOHYAaWDee5RXPha9">
</figure>

This double-counting can happen in more extreme versions. In the forward pass of VGG13, for example, profiler_nvtx counts a single operation 16 times. That is 15 times too often. Obviously, this distorts the results.

<figure>
  <img src="https://lh4.googleusercontent.com/ylptH6R4YfWPwy2kjxw4gzqa_4axo3nJA2CaGIjsR1U61TfGuRortfMkFQDJghC2cmxUuNl765nl5yvWsBFbnGmCea8luM-CWehjxEibDtpBoEzZH-6HJTlxfRel2VuXvQ4V8_SW">
</figure>

Furthermore, we can check the empirical backward/ forward ratios from profiler_nvtx in detail. We find that 

*   Operations like conv2d and linear have a backward/forward ratio of 2:1.
*   Operations like relu, dropout, maxpooling, avgpooling have a backward/forward ratio of 1:1.

Since the vast majority of operations during training come from conv2d and linear layers, The overall ratio is therefore very close to 2:1. 

<figure>
  <img src="https://lh5.googleusercontent.com/kDyMzCk9EpHCXmxSjAKXTNKFp6IO_-rgGn9uOXSKeW0ynOn5HGesYw-khIKG-GCTt_7A5uweaO5EF5INm_PgJ3sIrUlGQFwIorGqu3Jgs1JVxxV7wUP-8bgMrBXVb_6lq0kaLmh2">
</figure>

To account for the double-counting mistakes from above, we cleaned up the original files and deleted all entries that mistakenly double-counted an operation. Note that we couldn’t fix the undercounting issue so the following numbers still contain undercounts sometimes. 

After fixing the double-counting issue we get slightly more consistent results for different batch sizes. 

<figure>
  <img src="https://lh3.googleusercontent.com/ksvO0oBGf37zWdfQvqEUl_HHcQ1fv1XduLbwkw45QzFHua7Wj2vIXHoL6xjjmGc3H1l1-jg2Xp_PqPQq5f20JKnq_CNARcEwLD1TecW5YC7EJjFfPRWEjxHv-maHmQU8afFBBoY5">
</figure>

<figure>
  <img src="https://lh3.googleusercontent.com/0C6kqPdgGJmnLmK055KClXN_Crx-tjM9-_d4PJ-cBDw7j0Z4tZqbInXVe-GbqTcwI3s9knq-4Ls3IO8LvhXsMQc-83RGLoB3-qHlz4tCLicsLjypEyojB3LUQez5yOC_hp5ltmZz">
</figure>

All remaining inconsistencies come from undercounting.

# Results

The following results are done on the cleaned version of the profiler data, i.e. double counting has been removed but undercounting still poses an issue. 

The same analysis for the original (uncleaned) data can be found in the [appendix](#appendix).

## Comparing batch sizes

We trained some of our models with different batch sizes. We are interested in whether different batch sizes affect the time it takes to train models. We additionally compare the timings from the conventional profiler and profiler_nvtx. 

<figure>
  <img src="https://lh4.googleusercontent.com/c7LITX2iUICZH1ctuj7y9DK70CqkQcTp-Nkb4J3KGmOEYXQ_sRxuUcTx-mkarZFlI5i9sO96wHFHSAxbxd5iZQ8MVrB4P-j0YjSpDbg3iia1yv1cEURyEtp6bcp1KEW9nwctFQCm">
</figure>

We find that, as expected, larger batch sizes lead to minimally shorter training times for 4 out of the 5 models. We are not sure why VGG13 is an exception. We would have expected the differences between batch sizes to be larger but don’t have a strong explanation for the observed differences. A possible hypothesis is that our measurement of GPU time (compared to wall-clock time) hides some overhead that is usually reduced by larger batch sizes.

Shorter training times directly translate into higher utilization rates since training time is part of the denominator. 

## Backward-forward pass ratios

From the detailed analysis of profiler_nvtx (see above), we estimate that the backward pass uses 2x as many FLOP as the forward pass (there will be a second post on comparing backward/forward ratios in more detail). [OpenAI has also used a ratio of 2](https://openai.com/blog/ai-and-compute/) in the past.

We wanted to further test this ratio empirically. To check consistency we tested these ratios for a single forward pass with batch size one (one) an entire batch (batch) and an entire epoch (epoch). 

<figure>
  <img src="https://lh6.googleusercontent.com/OWKK3_wgC1LlbOob-JDM7N6t0SYME2oFllGJBS8LOS-UNj_IuU3iIW80E1r4kLyhkjriQAS9-hVUErPpM1ZkqQO1_j3XzJq7ToG5CBXRl08H8ulRvaFxOb8NI1kUzq7nWtof36kS">
</figure>

We find that the empirical backward/forward ratios are mostly around the 2:1 mark. Some of the exceptions are likely due to undercounting, i.e. profiler_nvtx just not registering an operation as discussed above.   
We assume that the outliers in mobilenet and efficientnet come from the profiler incorrectly measuring FLOP for inverted bottleneck layers. 

## Utilization rates

Ultimately, we want to estimate utilization rates. We compute them by using four different methods:

*   _Theory method_: We get the forward pass FLOP estimate of fvcore and multiply it by 3.0 to account for the backward pass. Then, we divide it by the product of the GPU training time and the peak GPU performance of the Tesla P100.
*   _One method_: We take the profiler_nvtx estimate for the forward and backward passes, and divide it by the product of the training time and maximal GPU performance.
*   _Batch method_: We perform the same procedure for one batch.
*   _Epoch method_: We perform the same procedure for one epoch.

<figure>
  <img src="https://lh4.googleusercontent.com/cH6b6WvmA5mrSaYzOFeMiFoIFWvb1OeYllX74AUMdK95LMZ3WHd7jymmFHg9S0zHuv_8FRsDubDHA68bMbAu74rD7BNhuAwWf-QeiSVxxQOqxqI6Fr3SCPC5BHqeG_cYsJLZbukq">
</figure>

We can see that the utilization rates predicted by the theory are often comparable to the empirical measurements for batch and epoch. We can also see that the batch and epoch versions are usually very comparable while just forwarding and backwarding one sample is much less efficient. This is expected since the reason for larger batch sizes is that they utilize the GPU more efficiently. 

Most realistic utilization rates are between 0.3 and 0.75. Interestingly (and ironically), the least efficient utilization rates come from efficientnet and mobilenet which have low values in all approaches. We assume that the outliers come from the profiler incorrectly measuring FLOP for inverted bottleneck layers. 

# Conclusion

We use different methods to compute the utilization rate of multiple NN architectures. We find that most values lie between 0.3  and 0.75 and are consistent between approaches. Mobilenet and efficientnet pose two outliers to this rule with low utilization rates around 0.04. We assume that the outliers come from the profiler incorrectly measuring FLOP for inverted bottleneck layers. 

# Appendix

We tried to run [dlprof](https://docs.nvidia.com/deeplearning/frameworks/dlprof-user-guide/) since it looks like one possible solution to the issues with the profiler we are currently using. However, we were unable to install it since installing [dlprof with pip](https://pypi.org/project/nvidia-dlprof/) (as is recommended in the instructions) always threw errors in Colab. I installed dlprof on another computer and wasn't able to get FLOP information from it. 

## Original versions of the main figures

These versions are done without accounting for double counting. Thus, the results are wrong. We want to show them to allow readers to compare them to the cleaned-up versions. 

<figure>
  <img src="https://lh5.googleusercontent.com/KbAlxuiUZqpcO-Pif45Avm73Xqv8-sOp3Cv-xPa3HLxJScqrlf9DqoACWkfq92zS00sC1s3dbxtZ9IxtUgIiBsdVrSrkY03oRsHZ48WLZNUq5dC2gn1_TzWqsSt96NoJQlBUBH9p">
</figure>

<figure>
  <img src="https://lh6.googleusercontent.com/1CcoownVLSKxHN3dLOQPXsclSo1wNwzj4gfaN3bWjaILvPT7E1BwIcS9dopP9nM-KKmEzy388MieZ5slCKqWIpm5dOIG8yfBfX46pSFsW1lnuLjVSffRVuCc7PUABomYLD2N2nyj">
</figure>

<figure>
  <img src="https://lh4.googleusercontent.com/OYWmomtflIlO8fTWBWzk6DAI4rjlvgimE6hoWWoXrqZBqSx7WFfE9Njlk0G60cWmst2COE_-rg_wZvTWmRX_RatRYE5MpFCIUqJ0dI1oh9g4B3uKGR4SWX31lXkUymUe9V3nEBUq">
</figure>
