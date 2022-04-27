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
      border-bottom: 1 solid grey;
		}

		.project h3 {
			margin-bottom: 0px;
		}

		.project p {
			color: grey;
		}

    .project-date {
      float: left;
      width: 10%;
      margin-top: 7px;
      margin-right: 1em;
    }

    .project-summary {
      float: left;
      width: 50%;
    }

    .project-thumbnail {
      float: right;
      width: 30%;
    }

    .project-thumbnail img {
      max-width: 100%;
    }
	</style>
</head>

# Research

<div class="project-list">
  {% for item in site.research %}
  <a href="{{item.url | relative_url}}">
    <div class="project">
      <div class="project-date">27 Apr 2022</div>
      <div class="project-summary">
        <h2 class="project-name">{{item.title}}</h2>
        <p class="project-description">{% if item.subtitle %} {{item.subtitle}} {% else %} {{item.excerpt}} {% endif %}</p>
      </div>
      <div class="project-thumbnail"><img src="{{item.image | relative_url }}"></div>
    </div>
  </a>
  {% endfor %}
</div>

## Research Agenda
