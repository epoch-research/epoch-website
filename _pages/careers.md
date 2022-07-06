---
title: Careers
permalink: /careers
banner:
  fullscreen: false
  type: regular
  hide_date: true
  image_position: bottom left
image: /assets/images/team/epoch-team.jpg
---

<head>
	<style>
		.job-list {
          display: grid;
          grid-template-columns: 1fr;
          grid-auto-rows: 1fr;
    	}
		.job {
			vertical-align: top;
			color: #111;
			border: 2px solid gray;
			padding: 10px 10px 10px 30px;
			margin-bottom: 10px;
      width: 95%;
      display: flex;
      flex-direction: column;
		}

    .apply-button {
      margin-top: auto;
    }

    .job {
      border-radius: 5px;
    }

    .job:hover {
      text-decoration: none;
      box-shadow: 0px 0px 5px 3px rgb(0 0 0 / 20%);
    }

    .job:hover .apply-button {
      text-decoration: underline;
    }

	</style>
</head>

<!-- {: .tex2jax_ignore } -->

# Open Positions

{% assign list = site.data.jobs %}
{% include box_list.html button="Apply" sameRowHeight=false %}

*Applications for the current hiring round will be open until July 30th.*
