---
title: Blog
---

<head>
	<style>
    .post:hover {
      text-decoration: none;
    }

    .post-list {
      overflow: hidden;
    }

		.post {
			vertical-align: top;
			color: #111;
      height: 100%;
      padding-bottom: 15px;
      margin-bottom: 15px;
      border-bottom: 1px solid var(--global-divider-color);
      display: flex;
      flex-wrap: wrap;
		}

    .post:last-child {
      border-bottom: 0;
    }

		.post h3 {
			margin-bottom: 0px;
		}

    .post-metadata {
      margin-top: 0.5rem;
      margin-right: 0.5rem;
      font-size: 0.9rem;
      width: calc(15% - 0.5rem);
      order: 0;
      margin-bottom: 0px;
    }

    .post-date {
      color: #333;
      margin-right: 0.5rem;
    }

    .post-tags {
    }

    .post-tag {
      width: fit-content;
      padding: 0.01rem 0.3rem;
      color: white;
      font-weight: bold;
      background-color: #333;
      border-radius: 4px;
      border: 1px solid #0008;
      margin-bottom: 0.2em;

      font-size: 0.7rem;
      line-height: 1.0rem;
    }

    .post-tag.peer-reviewed {
      background-color: #557;
    }

    .post-tag.editorial {
      background-color: #646;
    }

    .post-meat {
      width: 45%;
      margin: 0;
      padding-right: 0.8rem;
      box-sizing: border-box;
      order: 1;
    }

		.post-authors {
      font-size: 0.9rem;
			color: #555;
		}

    .post-thumbnail {
      width: 40%;
      margin: 0;
      order: 2;
    }

    .post-name {
      margin-bottom: 0;
    }

    .post-thumbnail img {
      width: 100%;
    }

    @media (max-width: 750px) {
      .post {
        display: block;
      }

      .post-metadata * {
        display: inline-block;
      }

      .post-tags {
        transform: translateY(-2px);
      }

      .post-metadata {
        width: 100%;
      }

      .post-thumbnail {
        width: 100%;
      }

      .post-meat {
        width: 100%;
      }
    }

	</style>
</head>

# Blog

<div class="post-list">
  {% assign articles = site.blog | sort: 'date' | reverse %}
  {% for item in articles %}
  <a href="{{item.url | relative_url}}" class="post">
    <div class="post-metadata">
      <div class="post-date">{{item.date | date: "%b. %d, %Y"}}</div>
      {% if item.tags %}
      <div class="post-tags">
        {% for tag in item.tags %}
        <div class="post-tag {{tag}}">{{tag}}</div>
        {% endfor %}
      </div>
      {% endif %}
    </div>
    <div class="post-thumbnail"><img src="{{item.image | relative_url }}"></div>
    <div class="post-meat">
      <h2 class="post-name">{{item.title}}</h2>
      <p class="post-authors">{{item.authors | map: 'name' | better_join: ", ", ", and "}}</p>
      <p class="post-abstract">{% if item.description %} {{item.description}} {% else %} {{item.excerpt}} {% endif %}</p>
    </div>
  </a>
  {% endfor %}
</div>
