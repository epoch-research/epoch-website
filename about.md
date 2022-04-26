---
title: About
---

<head>
  <style>
    .team-grid {
      grid-column-gap: 20px;
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 700px) {
      .team-grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 400px) {
      .team-grid { grid-template-columns: repeat(1, 1fr); }
    }

    /*
    @media (min-width: 600px) {
      .team-grid { grid-template-columns: repeat(2, 1fr); }
    }
    */

		.member .mug {
      /*
      width: 100%;
      height: 300px;
      */
      padding-top: 100%;
      box-shadow: 0 0 10px 0 rgb(0 0 0 / 20%);
      background-size: cover;
      background-position: center;
    }
  </style>
</head>

# About us
We are a research initiative at working on monitoring AI developments and forecasting the development of Transformative AI. Our mission is to narrow the gap between technical AI developments and AI governance, and inform key decision makers in AI safety.

## Our Team

<div class="collection-grid team-grid">
  {% for item in site.data.team %}
  <div class="member">
  <!--
    <img src="{{item.image | prepend: '/assets/images/team/' | relative_url }}" style="background-image: ">
  -->
    <div class="mug" style="background-image: url('{{item.image | prepend: '/assets/images/team/' | relative_url }}')"></div>
    <p>{{item.name}} - {{item.role}} - {{item.description}}</p>
  </div>
  {% endfor %}
</div>

