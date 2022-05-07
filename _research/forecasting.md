---
title: Modeling the Future of AI
summary: Improving our understanding of how future AI developments will unfold, by creating and improving forecasting models, and answering fundamental questions of central strategic importance to AI safety. 
image: assets/images/posts/2022/projecting-compute-trends.jpeg
---

<img src="{{ page.image | relative_url }}" style="max-width: 95%">

### The AI Forecasting team aims to improve our understanding of how future AI developments will unfold, by creating and improving forecasting models, and answering fundamental questions that are of central strategic importance to AI safety. 

This involves: 
- Analysing core assumptions and inputs to existing models of AI development, and improving them
- Developing new forecasting models about the road towards increasingly advanced AI
- Making concrete, tractable, and strategically relevant forecasting questions
- Reducing uncertainty about what a future with advanced AI will look like

---
# Prior work
<div class="collection-grid research-grid">
  {% for item in site.data.research %}
  <a href="{{item.url}}">
  <div class="member">
    <div class="member-info">
	  <h4>{{item.domain}}</h4>
      <h3>{{item.name}}</h3>
	  <h4>{{item.type}}</h4>
	  <p>{{item.date | date: "%b. %d, %Y"}}</p>
	  <p>{{item.authors}}</p>
    </div>
	<!-- <p class="member-description">{{item.description}}</p> -->
	<!-- Want to show the description when hovering, similar to GovAI's research page -->
  </div>
  </a>
  {% endfor %}
</div>