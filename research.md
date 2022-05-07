---
title: Research
---

<head>
	<style>
		.project-list {
      		overflow: hidden;
    	}
		.project {
			vertical-align: top;
			color: #111;
     		height: 100%;
			display: inline-block;
			border: 2px solid gray;
			padding: 10px 10px 10px 30px;
			margin-bottom: 10px;
		}
		.project-summary {
			float: left;
			width: 50%;
		}
		.project-thumbnail {
			float: right;
			width: 45%;
		}
		.project-thumbnail img {
			max-width: 100%;
		}
		.research-grid {
			grid-gap: 10px !important;
			grid-template-columns: repeat(3, 1fr);
		}
		.member {
			border: 2px solid gray;
			padding: 10px;
			max-width: 300px;
			width: 100%;
		}
	</style>
</head>

# Research
Our mission is to answer key questions about the drivers of AI progress and the future of AI developments. Our current research focuses on three main directions, which have a strong degree of overlap and interaction. 

<div class="project-list">
  {% assign pages = site.research %}
  {% for item in pages %}
  <a href="{{item.url | relative_url}}">
	<div class="project">
			<div class="project-thumbnail"><img src="{{ item.image | relative_url }}"></div>
			<h2>{{ item.title }}</h2>
			<p class="project-summary">{{ item.summary }}</p>
	</div>
  </a>
  {% endfor %}
</div>

---

# Publications
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