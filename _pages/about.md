---
title: About
permalink: /about
---

<head>
  <style>
    .team-grid {
      grid-gap: 10px !important;
      grid-template-columns: repeat(3, 1fr);
    }

    .member {
      max-width: 350px;
      width: 100%;
    }

    @media (max-width: 800px) {
      .team-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 550px) {
      .team-grid {
        grid-template-columns: repeat(1, 1fr);
        justify-items: center;
      }

      .member {
        max-width: 300px;
        width: 100%;
      }
    }

		.mug {
      padding-top: 100%;
      margin-bottom: 10px;
      box-shadow: 0 0 10px 0 rgb(0 0 0 / 20%);
      background-size: cover;
      background-position: center;
    }

    .member a {
      color: black;
      text-decoration: none;
    }

    .member-info {
      padding: 4px;
    }

    .member-name, .member-role {
      margin-bottom: 2px;
    }


    .member-description {
      margin-top: 15px;
    }

    /* Helps directing the attention when jumping to the miniprofile of a member */
    body:not(.clicked) :target {
      box-shadow: 0 0 18px 3px rgb(203 104 253 / 74%);
    }
  </style>

  <script>
    // TODO Implement this properly
    document.body.addEventListener("touchstart", e => document.body.classList.add("clicked"));
    document.body.addEventListener("click", e => document.body.classList.add("clicked"));
  </script>
</head>

# About us
We are a research initiative working to support AI governance and improve forecasts around the development of advanced AI systems. Our mission is to narrow the gap between technical AI developments and AI governance, and inform key decision makers in AI safety.

## Our Team

<div class="collection-grid team-grid">
  {% for member in site.data.team %}
  <div class="member" id="{{member.id}}">
    <div class="mug" style="background-image: url('{{member.id | prepend: '/assets/images/team/' | append: '.jpg' | relative_url }}')"></div>
    <div class="member-info">
      <h3 class="member-name">{{member.name}}</h3>
      <h4 class="member-role">{{member.role}}</h4>
      <div class="member-resources">
        {% for _resource in member.resources %}
          {% assign resource = _resource | first %}
          {% assign resource_name = resource[0] %}
          {% assign resource_url = resource[1] %}
          {% assign type = site.data.resource_types | where: "name", resource_name | first %}
          <a class="article-resource" href="{{resource_url}}"><i class="bi bi-{{type.icon}}"></i></a>
        {% endfor %}
      </div>
      <p class="member-description">{{member.description}}</p>
    </div>
  </div>
  {% endfor %}
</div>
