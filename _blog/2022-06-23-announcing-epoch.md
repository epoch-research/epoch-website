---
layout: article
title: "Announcing Epoch: A research initiative monitoring the road to transformative AI"
subtitle: Subtitle
image: assets/images/epoch-logo.svg
description: We’re a new research initiative working on monitoring AI developments and forecasting the developments of AI. Come join us!
pinned: true
tags: announcements

banner:
  fullscreen: false
  image: assets/images/epoch-logo-white-text.svg

toc: auto

date: 2022-06-23

authors:
  - name: The Epoch Team

---

{% include team_grid_head.html %}
{% include ml_trends_head.html %}

<style>
  /* fix toc */
  d-article d-contents {
    position: initial;
  }

  d-article d-contents a {
    color: black !important;
  }

  .banner-img-wrapper img {
    border-radius: 0px;
  }

  .member-resources {
    display: none;
  }

  .team-grid {
    grid-gap: 1.3rem !important;
    grid-template-columns: repeat(auto-fill, 200px);
  }

  .member {
    max-width: 200px;
    width: 100%;
  }

  .logos {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    justify-items: stretch;
  }

  .logos a {
    text-decoration: none !important;
    border: 0 !important;
    outline: none !important;
  }

  .logos img {
    height: 105px;
  }

  .workshow {
    display: flex;
    flex-wrap: wrap;
    text-align: center;
    justify-content: space-around;
    gap: 10px;
    margin-bottom: 1em;
  }

  .workshow .work {
    width: 300px;
    padding: 5px;
    text-decoration: none !important;
    border: none !important;
  }

  .workshow .work:hover {
    box-shadow: 0 0 6px 3px rgb(0 0 0 / 55%);
    border-radius: var(--default-radius);
  }

  .workshow .work .thumbnail {
    height: 200px;
  }

  .workshow .work .thumbnail img {
    height: 100%;
    width: 100%;
    object-fit: scale-down;
  }

  .workshow .work .description {
    font-size: 0.9em;
  }
</style>

# Summary

* We are a new research initiative working on investigating trends in Machine Learning and forecasting the development of Transformative Artificial Intelligence
* This work is done in close collaboration with other organizations, like [Rethink Priorities](https://rethinkpriorities.org/), [Open Philanthropy](https://www.openphilanthropy.org/), and [MIT CSAIL](https://www.csail.mit.edu/)
* We will be hiring for 2-4 full-time roles between June and August – more information [here]({% link _pages/careers.md %})
* You can find up-to-date information about Epoch on [our website]({% link _pages/index.md %})

<figure style="width: 60%; min-width: min(350px, 100%);">
  <img src="/assets/images/epoch-logo.svg">
</figure>


# What is *Epoch*?

[*Epoch*](https://epochai.org/) is a new research organization that works to support AI strategy and improve forecasts around the development of [Transformative Artificial Intelligence (TAI)](https://www.openphilanthropy.org/blog/some-background-our-views-regarding-advanced-artificial-intelligence) – AI systems that have the potential to have an effect on society as large as that of the industrial revolution.

Our founding team consists of seven members – Jaime Sevilla, Tamay Besiroglu, Lennart Heim, Pablo Villalobos, Eduardo Infante-Roldán, Marius Hobbhahn, and Anson Ho. Collectively, we have backgrounds in Machine Learning, Statistics, Economics, Forecasting, Physics, Computer Engineering, and Software Engineering.

<div class="team-grid">
  {% include team_grid.html %}
</div>

Our work involves close collaboration with other organizations, such as [MIT CSAIL](https://www.csail.mit.edu/), [Open Philanthropy](https://www.openphilanthropy.org/), and [Rethink Priorities](https://rethinkpriorities.org/)’ [AI Governance and Strategy team](https://forum.effectivealtruism.org/posts/K7tjvcDurrCj72D7H/rethink-priorities-2021-impact-and-2022-strategy). We are advised by Tom Davidson from Open Philanthropy and Neil Thompson from MIT CSAIL. Rethink Priorities is also our fiscal sponsor.

<div class="logos">
  <a href="https://www.openphilanthropy.org/"><img src="/assets/images/logos/op-logo.png"></a>
  <a href="https://www.csail.mit.edu/"><img src="/assets/images/logos/csail-logo.png"></a>
  <a href="https://rethinkpriorities.org/"><img src="/assets/images/logos/rp-logo.png"></a>
</div>

# Our mission

Epoch seeks to clarify **_when_ and _how_ TAI capabilities will be developed**.

We see these two problems as core questions for **informing AI strategy** decisions by grantmakers, policy-makers, and technical researchers.[^1]

We believe that to make good progress on these questions we need to advance towards **a field of AI forecasting**. We are committed to developing tools, gathering data and creating a scientific ecosystem to make collective progress towards this goal.

# Our research agenda

Our work at Epoch encompasses two interconnected lines of research:

* The analysis of **trends in Machine Learning**. We aim to gather data on what has been happening in the field during the last two decades, explain it, and extrapolate the results to inform our views on the future of AI.

* The development of **quantitative forecasting models** related to the development of advanced AI capabilities. We seek to use techniques from economics and statistics to predict _when_ and _how fast_ AI will be developed.

These two research strands feed into each other: the analysis of trends informs the choice of parameters in quantitative models, and the development of these models brings clarity on the most important trends to analyze.

<figure>
  <img src="/assets/images/posts/2022/research-agenda-sketch.png">
  <figcaption class="caption">
    A sketch of Epoch’s research agenda. We plan to develop quantitative models to forecast advanced AI capabilities, and to research and extrapolate trends in Machine Learning.
  </figcaption>
</figure>

Besides this, we also plan to opportunistically research topics important for AI governance where we are well positioned to do so. These investigations might relate to compute governance, near term advances in AI and other topics. 

# Our work so far

Earlier this year we published *[Compute Trends Across Three Eras of Machine Learning]({% link _blog/2022-02-16-compute-trends.md %})*. We collected and analyzed data about the training compute budget of >100 Machine Learning models across history. Consistent with our commitment to field building, we have released the associated dataset and an interactive visualization tool to help other researchers understand these trends better. This work has been featured in [Our World in Data](https://ourworldindata.org/grapher/ai-training-computation), in [The Economist](https://www.economist.com/interactive/briefing/2022/06/11/huge-foundation-models-are-turbo-charging-ai-progress) and at the OECD.

<div id="trends-graph-wrapper">
  <div id="trends-graph">
  </div>
</div>

More recently we have published *[Grokking “Forecasting TAI with biological anchors”]({% link _blog/2022-06-06-grokking-bioanchors.md %})* and *[Grokking “Semi-informative priors over AI timelines”]({% link _blog/2022-06-13-grokking-semi-informative-priors.md %})*. In these pieces, Anson Ho dissects two popular AI forecasting models. These are the two first installments of a series of articles covering work on quantitative forecasting of when we will develop TAI.

<figure>
  <img src="/assets/images/posts/2022/bioanchors-diagram.png">
  <figcaption class="caption">
    Diagram summarizing Ajeya Cotra’s biological anchors model.
  </figcaption>
</figure>

You can see more of our work on [our blog]({% link _pages/blog.md %}). Here is a selection of further work by Epoch members:


<div class="workshow">
  <a href="{% link _blog/2022-03-07-projecting-compute-trends.md %}" class="work">
    <div class="thumbnail"><img src="{% link assets/images/posts/2022/projecting-compute-trends.jpeg %}"></div>
    <div class="description">Projecting compute trends in Machine Learning</div>
  </a>

  <a href="{% link _blog/2022-01-20-estimating-training-compute.md %}" class="work">
    <div class="thumbnail"><img src="{% link assets/images/posts/2022/estimating-training-compute.png %}"></div>
    <div class="description">Estimating training compute of Deep Learning models</div>
  </a>

  <a href="{% link _blog/2021-12-13-backward-forward-FLOP-ratio.md %}" class="work">
    <div class="thumbnail"><img src="{% link assets/images/posts/2022/backward-forward-FLOP-ratio.png %}"></div>
    <div class="description">Estimating the backward-forward FLOP ratio</div>
  </a>

  <a href="{% link _blog/2021-06-19-parameter-counts.md %}" class="work">
    <div class="thumbnail"><img src="{% link assets/images/posts/2022/parameter-counts.png %}"></div>
    <div class="description">Parameter counts in Machine Learning</div>
  </a>
</div>

# Hiring

**We expect to be hiring for several full-time research and management roles from July to August. Salaries range from $60,000 for entry roles to $80,000 for senior roles.**

If you think you might be a good fit for us, please apply! If you’re unsure whether this is the right role for you, we strongly encourage you to apply anyway. Please register your interest for these roles through our [webpage]({% link _pages/careers.md %}) – **applications will open in July.**

<figure>
  <img src="/assets/images/posts/2022/founding-members.png">
</figure>

---

[^1]: Here is [a post](https://www.lesswrong.com/posts/hRohhttbtpY3SHmmD/takeoff-speeds-have-a-huge-effect-on-what-it-means-to-work-1) by Buck Shlegeris of Redwood Research which argues that takeoff speeds are highly relevant to AI Alignment research.

{% include team_grid_footer.html %}
{% include ml_trends_footer.html %}
