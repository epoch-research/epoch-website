---
title: Blog
---

<head>
	<style>
    .project:hover {
      text-decoration: none;
    }

    .project-list {
      overflow: hidden;
    }

		.project {
			vertical-align: top;
			color: #111;
      height: 100%;
      padding-bottom: 15px;
      margin-bottom: 15px;
      border-bottom: 1px solid var(--global-divider-color);
      display: flex;
      flex-wrap: wrap;
		}

    .project:last-child {
      border-bottom: 0;
    }

		.project h3 {
			margin-bottom: 0px;
		}

    .project-date {
      margin-top: 0.5em;
      margin-right: 1em;
      margin-right: 0;
      font-size: 0.9rem;
      color: #333;
      flex: none;
      width: 10%;
      order: 0;
      margin-bottom: 18px;
    }

    .project-meat {
      flex: none;
      width: 50%;
      margin: 0;
      padding-right: 0.8rem;
      box-sizing: border-box;
      order: 1;
    }

		.project-authors {
      font-size: 0.9rem;
			color: #555;
		}

    .project-thumbnail {
      flex: none;
      width: 40%;
      margin: 0;
      order: 2;
    }

    .project-name {
      margin-bottom: 0;
    }

    .project-thumbnail img {
      width: 100%;
    }

    @media (max-width: 750px) {
      .project {
        display: block;
      }

      .project-date {
        width: 100%;
      }

      .project-thumbnail {
        width: 100%;
      }

      .project-meat {
        width: 100%;
      }
    }

	</style>
</head>

# Blog

<div class="project-list">
  {% assign articles = site.blog | sort: 'date' | reverse %}
  {% for item in articles %}
  <a href="{{item.url | relative_url}}" class="project">
    <div class="project-date">{{item.date | date: "%b. %d, %Y"}}</div>
    <div class="project-thumbnail"><img src="{{item.image | relative_url }}"></div>
    <div class="project-meat">
      <h2 class="project-name">{{item.title}}</h2>
      <p class="project-authors">{{item.authors | map: 'name' | better_join: ", ", ", and "}}</p>
      <p class="project-abstract">{{item.excerpt}}</p>
    </div>
  </a>
  {% endfor %}
</div>
