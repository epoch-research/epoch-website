---
title: Research
permalink: /lab/research-2
---

# Research

Our current research focuses on three main directions, which have a strong degree of overlap and interaction. 

{% assign list = site.research %}
{% include lab/box_list.html button="Click to learn more" %}

# Publications

{% include lab/research_grid.html %}

<script>
  for (let footer of document.querySelectorAll('.footer-wrapper')) {
    footer.remove();
  }
</script>
