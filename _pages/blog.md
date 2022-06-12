---
title: Blog
permalink: /blog
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
      padding-top: 2em;
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
      margin-bottom: 0.2em;

      font-size: 0.7rem;
      line-height: 1.0rem;
    }

    .post-meat {
      width: 45%;
      margin: 0;
      padding-right: 0.8rem;
      box-sizing: border-box;
      order: 1;
    }

    /*
    .post.external .post-name:after {
      content: url(http://upload.wikimedia.org/wikipedia/commons/6/64/Icon_External_Link.png);
      margin: 0 0 0 5px;
    }
    */

    .external-icon {
      font-size: 0.6em;
      vertical-align: 0.5em;
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
      margin-bottom: 2.5em;
    }

    .pin {
      margin-bottom: 0;
      margin-right: 0.5rem;
      font-size: 0.8rem;
      color: grey;
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
        margin-top: 1.5em;
      }

      .post-meat {
        width: 100%;
      }
    }
	</style>
</head>

# Blog

<div class="post-list">
  {% assign posts = "" | split: ',' %}

  {% assign _posts = site.blog | sort: 'date' | reverse %}

  {% for post in _posts %}
    {% if post.pinned %}
      {% assign posts = posts | push: post %}
    {% endif %}
  {% endfor %}

  {% for post in _posts %}
    {% unless post.pinned %}
      {% assign posts = posts | push: post %}
    {% endunless %}
  {% endfor %}

  {% for post in posts %}
  <a href="{{post.url | relative_url}}" class="post">
    <div class="post-metadata">
      {% if post.pinned %}
        <p class="pin"><i class="bi bi-pin-angle"></i> Pinned</p>
      {% endif %}
      <div class="post-date">{{post.date | date: "%b. %d, %Y"}}</div>
      {% if post.tags %}
        <div class="post-tags">
          {% for tag in post.tags %}
            {% assign backgroundColor = site.data.tags | find_exp: 'post','post.name == tag' | map: 'background_color' %}
            <div class="post-tag {{tag}}" style="background-color: {{backgroundColor}}">{{tag}}</div>
          {% endfor %}
        </div>
      {% endif %}
    </div>
    <div class="post-thumbnail"><img src="{{post.image | relative_url }}"></div>
    <div class="post-meat">
      <h2 class="post-name">{{post.title}}</h2>
      <p class="post-authors">{{post.authors | map: 'name' | better_join: ", ", ", and "}}</p>
      <p class="post-abstract">{% if post.description %} {{post.description}} {% else %} {{post.excerpt}} {% endif %}</p>
    </div>
  </a>

  {% endfor %}
</div>
