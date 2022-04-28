---
title: About
---

<head>
  <style>
    .team-grid {
      grid-column-gap: 20px;
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 800px) {
      .team-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 500px) {
      .team-grid { grid-template-columns: repeat(1, 1fr); }
    }

		.mug {
      padding-top: 100%;
      margin-bottom: 10px;
      box-shadow: 0 0 10px 0 rgb(0 0 0 / 20%);
      background-size: cover;
      background-position: center;
    }

    .member-name {
      margin-bottom: 2px;
    }
  </style>
</head>

# About us
We are a research initiative at working on monitoring AI developments and forecasting the development of Transformative AI. Our mission is to narrow the gap between technical AI developments and AI governance, and inform key decision makers in AI safety.

## Our Team

<div class="collection-grid team-grid">
  {% for item in site.data.team %}
  <div class="member">
    <div class="mug" style="background-image: url('{{item.image | prepend: '/assets/images/team/' | relative_url }}')"></div>
    <h3 class="member-name">{{item.name}}</h3>
    <h4 class="member-role">{{item.role}}</h4>
    <p class="member-description">{{item.description}}</p>
  </div>
  {% endfor %}
</div>

