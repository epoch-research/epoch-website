---
title: Machine Learning Trends
summary: Gathering crucial data about the inputs and outputs of Machine Learning systems, analysing trends, helping build a big-picture understanding of developments in AI. 
image: assets/images/posts/2022/compute-trends.png
---

<!-- <head>
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
</head> -->

<img src="{{ page.image | relative_url }}" style="max-width: 95%">

### We aim to gather crucial data about the inputs and outputs of Machine Learning systems, analyse trends, and build a big-picture of understanding of developments in AI. 

This involves:
- Designing guidelines for collecting relevant data, to help decision-makers monitor AI developments and make informed decisions
- Gathering data and making them publicly available for other researchers to build upon
- Creating measuring tools 
- Analysing data trends

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