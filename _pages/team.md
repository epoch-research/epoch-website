---
title: Team
permalink: /team
---

{% include scripts/team_members.html %}

{% include team_grid_head.html %}

# About us
We are a research initiative working to support AI governance and improve forecasts around the development of advanced AI systems. Our mission is to narrow the gap between technical AI developments and AI governance, and inform key decision makers in AI safety.

## Our Team

{% include team_grid.html %}

## Advisor Board

<div class="collection-grid team-grid">
  {% for member in site.data.advisor_board %}
  <div class="member" id="{{member.id}}">
    <div class="mug" style="background-image: url('{{member.id | prepend: '/assets/images/advisors/' | append: '.jpg' | relative_url }}')"></div>
    <div class="member-info">
      <h3 class="member-name">{{member.name}}</h3>
      <h4 class="member-role">{{member.role}}</h4>
      <div class="member-resources">
        {% for _resource in member.resources %}
          {% assign resource = _resource | first %}
          {% assign resource_name = resource[0] %}
          {% assign resource_url = resource[1] %}
          {% assign type = site.data.resource_types | where: "name", resource_name | first %}
          <a class="member-resource" href="{{resource_url}}"><i class="bi bi-{{type.icon}}"></i></a>
        {% endfor %}
      </div>
      <p class="member-description">{{member.description}}</p>
    </div>
  </div>
  {% endfor %}
</div>

{% include team_grid_footer.html %}
