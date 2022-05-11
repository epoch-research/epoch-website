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

    .thumbs-buttons button {
      border: none;
      cursor: pointer;
      background-color: transparent;
      margin-left: 0;
      margin-right: 0;
      padding-left: 0;
      padding-right: 0;
    }

    #msg-bar {
      position: fixed;
      top: 0;
      width: 100%;
      font-size: 1.4rem;
      background-color: purple;
      font-weight: bold;
      padding: 10px;
      box-sizing: border-box;
    }

    #msg-bar-msg {
      color: white;
    }

    .close {
      cursor: pointer;
    }

    .pink {
      box-shadow: 0 0 10px 10px pink;
    }
  </style>

  <script>
    // TODO Implement this properly
    document.body.addEventListener("touchstart", e => document.body.classList.add("clicked"));
    document.body.addEventListener("click", e => document.body.classList.add("clicked"));
  </script>
</head>

<div id="msg-bar" style="display: none"><span id="msg-bar-msg">Anson is no more</span><span class="close" style="float: right; color: white" onclick="closeBar()">X</span></div>

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

        <span class="thumbs-buttons">
          <button><i class="bi bi-hand-thumbs-up-fill" style="color: green" onclick="pinkIt('{{member.id}}')"></i></button>
          <button><i class="bi bi-hand-thumbs-down-fill" style="color: red" onclick="remove('{{member.id}}', '{{member.name}}')"></i></button>
        </span>
      </div>
      <p class="member-description">{{member.description}}</p>
    </div>
  </div>
  {% endfor %}
</div>


<script>
  let msgBar = document.getElementById('msg-bar');
  let msgBarMsg = document.getElementById('msg-bar-msg');
  let ourTeam = document.getElementById('our-team');
  document.body.appendChild(msgBar);

  window.onload = () => {
    let footer = document.getElementsByClassName('site-footer')[0];
    footer.style.borderTop = '0px';
  }

  function closeBar() {
    msgBar.style.display = 'none';
  }

  let teamGrid = document.getElementsByClassName('team-grid')[0];
  console.log(teamGrid);

  function pinkIt(memberId, memberName) {
    let node = document.getElementById(memberId);
    node.classList.add("pink");
  }

  function remove(memberId, memberName) {
    let firstName = memberName.split(' ')[0];
    if (confirm(`It looks like you are not satisfied with ${firstName}.\nDo you want us to fire ${firstName}?`)) {
      let node = document.getElementById(memberId);
      node.remove();
      msgBarMsg.innerHTML = `${firstName} is no more`;
      if (teamGrid.childElementCount <= 3) {
        msgBarMsg.innerHTML += `. Only ${teamGrid.childElementCount} left.`;
        if (teamGrid.childElementCount == 1) {
          msgBarMsg.innerHTML += ` He's asking for mercy.`;
        }
      }
      msgBar.style.display = '';

      if (teamGrid.childElementCount == 0) {
        msgBar.remove();
        let div = document.createElement('div');
        div.innerHTML = `
          <h3 style="color: white">🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏🙏</h3>
          <h3 style="color: white; font-size: 3.4em">THANK YOU</h3>
          <h3 style="color: white">You fearlessly clicked all those thumbs down buttons</h3>
          <h3 style="color: white">The team has been destroyed</h3>
          <h3 style="color: white; font-size: 2.2em">Epoch has been saved</h3>
          <h3 style="color: white">❤️</h3>
        `;
        let wrapper = document.getElementsByClassName('wrapper')[0];
        document.body.style.backgroundColor = '#700a6d';
        wrapper.innerHTML = '';
        wrapper.appendChild(div);
        console.log("Sorry. I tried resisting.");
      }
    }
  }
</script>
