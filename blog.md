---
title: Blog
---

# Blog

{% for item in site.blog %}
  <h2>{{ item.title }}</h2>
  <p>{{ item.description }}</p>
  <p><a href="{{ item.url | relative_url }}">{{ item.title }}</a></p>
{% endfor %}

