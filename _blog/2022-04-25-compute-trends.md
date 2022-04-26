---
layout: article
title: Compute Trends Across Three Eras of Machine Learning
subtitle: An interesting collaboration between two of the best teams in the world
image: assets/images/sunrise.jpg
description: A new era has arrived. Are you prepared for it?

toc:
  - name: What is Lorem Ipsum?
  - name: Why do we use it?
  - name: Where does it come from?

date: 2022-04-26

authors:
  - name: Anson Ho
    url: "https://ansonwhho.github.io"
    affiliations:
      name: Epoch
  - name: Boris Podolsky
    url: "https://en.wikipedia.org/wiki/Boris_Podolsky"
    affiliations:
      name: IAS, Princeton
  - name: Nathan Rosen
    url: "https://en.wikipedia.org/wiki/Nathan_Rosen"
    affiliations:
      name: IAS, Princeton
---

<!--
# Contents
{:.no_toc}

1. Will be replaced with the ToC, excluding the "Contents" header
{:toc}
-->


_Summary: We have collected a dataset and analysed key trends in the training compute of Machine Learning models since 1950. We identify three major eras of training compute - the pre-Deep Learning Era, the Deep Learning Era, and the Large-Scale Era. Furthermore, we find that the training compute has grown by a factor of 10 billion since 2010, with a doubling rate of around 5-6 months. See our recent paper, [Compute Trends Across Three Eras of Machine Learning](https://arxiv.org/abs/2202.05924), for more details._

# Introduction
It is well known that progress in machine learning (ML) is driven by three primary factors - algorithms, data, and compute. This makes intuitive sense - the development of algorithms like backpropagation transformed the way that machine learning models were trained, leading to significantly improved efficiency compared to previous optimisation techniques ([Goodfellow _et al._, 2016](https://www.deeplearningbook.org/contents/mlp.html#pf25); [Rumelhart _et al._, 1986](http://www.cs.toronto.edu/~hinton/absps/naturebp.pdf)). Data has been becoming increasingly available, particularly with the advent of "[big data](https://en.wikipedia.org/wiki/Big_data)" in recent years. At the same time, progress in computing hardware has been rapid, with increasingly powerful and specialised AI hardware ([Heim, 2021](https://forum.effectivealtruism.org/s/4yLbeJ33fYrwnfDev/p/YNB39RyJ7iAQKGJvq); [Khan and Mann, 2020](https://cset.georgetown.edu/wp-content/uploads/AI-Chips%E2%80%94What-They-Are-and-Why-They-Matter.pdf)). 

What is less obvious is the *relative* importance of these factors, and what this implies for the future of AI. [Kaplan _et al._ (2020)](https://arxiv.org/abs/2001.08361) studied these developments through the lens of **scaling laws**, identifying three key variables:
* Number of parameters of a machine learning model
* Training dataset size
* Compute required for the final training run of a machine learning model (henceforth referred to as **training compute**)

Trying to understand the relative importance of these is challenging because our theoretical understanding of them is insufficient - instead, we need to take large quantities of data and analyse the resulting trends. Previously, we looked at trends in parameter counts of ML models - in this paper, we try to understand how training compute has evolved over time.

[Amodei and Hernandez (2018)](https://openai.com/blog/ai-and-compute/) laid the groundwork for this, finding a $300,000\times$ increase in training compute from 2012 to 2018, doubling every 3.4 months. However, this investigation had only around $15$ datapoints, and does not include some of the most impressive recent ML models like GPT-3 ([Brown, 2020](https://arxiv.org/abs/2005.14165)). 

Motivated by these problems, we have curated the largest ever dataset containing the training compute of machine learning models, with over 120 datapoints. Using this data, we have drawn several novel insights into the significance of compute as an input to ML models. 

These findings have implications for the future of AI development, and how governments should orient themselves to compute governance and a future with powerful AI systems. 

# Methodology
Following the approach taken by OpenAI ([Amodei and Hernandez, 2018](https://openai.com/blog/ai-and-compute/)), we use two main approaches to determining the training compute[^1] of ML systems:
1. **Counting the number of operations**: The training compute can be determined from the number of arithmetic operations that is performed by the machine. By looking at the model architecture and closely monitoring the training process, we can directly calculate the total number of multiplications and additions, yielding the training compute. As ML models become significantly more complex (as continues to be the case), this approach becomes significantly more tedious and tricky. Doing this also requires knowledge of key details of the training process[^2], which may not always be accessible. 
2. **GPU-time**: A second approach, which is independent of the model architecture, uses the information about the total training time and hardware to estimate the training compute. This method typically requires making several assumptions about the training process, which leads to a greater uncertainty in the final value.[^3] 

Most of the time, we were able to use either of the above approaches to estimate the training compute for a particular ML model. In practice this process involved many difficulties, since authors would often not publish key information about the hardware used or training time. 

Of course, it would be infeasible for us to gather this data for *all* ML systems since 1950. Instead, we focus on *milestone* systems, based on the following criteria: 
* **Clear importance**: These are systems that have major historical influence, significantly improve on the state-of-the-art, or have over 1000 citations[^4]
* **Relevance**: We only include papers which include *experimental results* and a key machine learning component, and have a goal of pushing the existing state-of-the-art
* **Uniqueness**: If another paper describing the same system is more influential, then the paper is excluded from our dataset

This selection process lets us focus on the most important systems, helping us understand the key drivers of the state-of-the-art. 

# Results
Using these techniques, we yielded a [dataset](https://docs.google.com/spreadsheets/d/1AAIebjNsnJj_uKALHbXNfn3_YsT6sHXtCU0q7OIPuc4/edit#gid=0) with training compute for over 120 milestone ML systems, the largest such dataset yet. We have chosen to make this and our [interactive data visualisation](https://colab.research.google.com/drive/11m0AfSQnLiDijtE1fsIPqF-ipbTQcsFp) publicly available, in order to facilitate further research along the same lines. 

When analysing the gathered data, we draw two main conclusions. 
* Trends in training compute are slower than previously reported
* We identify three eras of training compute usage across machine learning

## Compute trends are slower than previously reported
In the previous investigation by [Amodei and Hernandez (2018)](https://openai.com/blog/ai-and-compute/), the authors found that the training compute used was growing extremely rapidly - doubling every 3.4 months. With approximately 10 times more data than the original study, we find a doubling time closer to 6 months. This is still extraordinarily fast! Since 2010, the amount of training compute for machine learning models has grown by a factor of 10 billion, significantly exceeding a naive extrapolation of Moore's Law. 

This suggests that many previous analyses based on OpenAI's paper were biased towards rapid developments, approximately by a factor of two. 

## Three eras of machine learning
One of the more speculative contributions of our paper is that we argue for the presence of three eras of machine learning. This is in contrast to prior work, which identifies two trends separated by the start of the Deep Learning revolution ([Amodei and Hernandez, 2018](https://openai.com/blog/ai-and-compute/)). Instead, we split the history of ML compute into three eras: 
1. The **Pre-Deep Learning Era**: Prior to Deep Learning, training compute approximately follows Moore's Law, with a doubling time of approximately every 20 months. 
2. The **Deep Learning Era**: This starts somewhere between 2010 and 2012[^5], and displays a doubling time of approximately 6 months
3. The **Large-Scale Era**: Arguably, a separate trend of of models breaks off the main trend between 2015 and 2016. These systems are characteristic in that they are run by large corporations, and use training compute 2-3 orders of magnitude larger than systems that follow the Deep Learning Era trend in the same year. Interestingly, the growth of compute in these Large-Scale models seems slower, with a doubling time of about 10 months. 

A key benefit of this framing is that it helps make sense of developments over the last two decades of ML research. Deep Learning marked a major paradigm shift in ML, with an increased focus on training larger models, using larger datasets, and using more compute. The bifurcation of the Deep Learning trend coincides with the shift in focus towards major projects at large corporations, such as DeepMind and OpenAI. 

However, there is a fair bit of ambiguity with this framing. For instance, how do we know exactly which models can be considered large-scale? How can we be sure that this "large-scale" trend isn't just due to noise? To test these questions, we used different statistical thresholds for what counts as "large-scale", and the resulting trend does not change very much, thus the findings are at least somewhat robust to different selection criteria. Of course, the exact threshold that we use is still debatable, and it is hard to be certain about the observed trends without more data. 

# Implications and further work
We expect that future work will build upon this research project. Using the aforementioned compute estimation techniques, more training compute data can be gathered, offering the potential for more conclusive analyses. We can also make the data gathering process easier, such as by:
* Developing tools for automatically measuring training compute usage (as well as inference compute)
* Publishing key details about the training process, such as the GPU model used

Taking these steps helps key actors obtain valuable information in the future. 

Naturally, we will also be looking at trends in dataset sizes, and comparing the relative importance of data and compute for increased performance. We can also look how factors like funding and talent influence the primary inputs of a ML system, like data and compute. 

Answering questions like these is crucial for understanding how the future of AI will look like. At Epoch, we're particularly concerned about ensuring that AI is developed in a beneficial way, with appropriate governance intervention to ensure safety. Better understanding the progress of compute capabilities can help us better navigate a future with powerful AI systems. 

_[Read the full paper now on the arXiv](https://arxiv.org/abs/2202.05924)._

---
[^1]: Specifically, we focus on the *final* training run of a ML system. This is primarily due to measurability - researchers generally do not mention the total compute or training time that does not directly contribute to the final machine learning model. We simply do not have sufficient information to determine the total compute through the entire experimentation process. 

[^2]: i.e. the total number of iterations during training.

[^3]: For instance, we often assumed that the GPU utilisation rate was 10%. We often also had to guess which GPU model was in use based on the year in which the paper was published, in the event that this information was not disclosed in the paper of interest and the authors were not able to provide an answer. 

[^4]: These criteria are ambiguous and can vary on a case-by-case basis. For instance, new papers (published within the last year or two) can be very influential without having had the time to gather many citations. In such cases we make relatively subjective decisions of the importance of these ML models. 

[^5]: We discuss this more in Appendix D of the [paper](https://arxiv.org/pdf/2202.05924.pdf). While AlexNet ([Krizhevsky _et al._, 2012](https://proceedings.neurips.cc/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf)) is commonly associated with the start of Deep Learning, we argue that models before AlexNet have key features commonly associated with Deep Learning, and that 2010 is most consistent with evidence.