---
title: Understanding the AI Landscape
summary: Doing foundational research to understand the inner workings of the AI production function, and what impacts this will have as we head into a world with increasingly advanced AI. 
image: /assets/images/bioanchors-compute.png
---

<img src="{{ page.image | relative_url }}" style="max-width: 95%">

### We aim to do foundational research to understand the inner workings of the AI production function, and what impacts this will have as we head into a world with increasingly advanced AI. 

This involves: 
- Studying the interactions between different inputs and outputs of ML systems
- Understanding what drives progress at second order, and how this will impact society over the long run
- Working on novel research questions at the intersection of AI and economics

This work is critical because it helps decision makers develop a high-level understanding of how AI works. These decision makers generally do not have the time to learn about AI, and synthesizing large amounts of information is crucial for narrowing the gap between technical developments and AI governance. 

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