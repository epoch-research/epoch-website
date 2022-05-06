---
title: About
---

<head>
  <style>
    .team-grid {
      grid-gap: 10px !important;
      grid-template-columns: repeat(2, 1fr);
    }

    .member {
      max-width: 350px;
      width: 100%;
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

    .member-info {
      padding: 4px;
    }

    .member-name {
      margin-bottom: 2px;
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
We are a research initiative at working on monitoring AI developments and forecasting the development of Transformative AI. Our mission is to narrow the gap between technical AI developments and AI governance, and inform key decision makers in AI safety.

## Our Team

<div class="collection-grid team-grid">
  {% for item in site.data.team %}
  <div class="member" id="{{item.id}}">
    <div class="mug" style="background-image: url('{{item.id | prepend: '/assets/images/team/' | append: '.jpg' | relative_url }}')"></div>
    <div class="member-info">
      <h3 class="member-name">{{item.name}}</h3>
      <h4 class="member-role">{{item.role}}</h4>
      <p class="member-description">{{item.description}}</p>
    </div>
  </div>
  {% endfor %}
</div>

