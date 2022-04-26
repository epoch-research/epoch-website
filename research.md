---
title: Research
---

<head>
	<style>
		.project {
			vertical-align: top;
			display: grid;
			color: #111;
      height: 100%;
		}

		.project h3 {
			margin-bottom: 0px;
		}

		.project p {
			color: grey;
		}
	</style>
</head>

# Research


<div class="collection-grid">
  {% for item in site.research %}
  <a href="{{item.url | relative_url}}">
    <div class="project">
      <h3>{{ item.title }}</h3>
      <p>{% if item.subtitle %} {{item.subtitle}} {% else %} {{item.excerpt}} {% endif %}</p>
      <div><img src="{{ item.image | relative_url }}"></div>
    </div>
  </a>
  {% endfor %}
</div>

## Research Agenda