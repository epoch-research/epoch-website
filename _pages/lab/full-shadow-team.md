---
title: Team
permalink: /lab/full-shadow-team
---

<head>
  <style>
    .team-grid {
      grid-gap: 1.3rem !important;
      grid-template-columns: repeat(auto-fill, 230px);
    }

    .member {
      max-width: 250px;
      width: 100%;
    }

    @media (max-width: 550px) {
      .team-grid {
        justify-items: center;
      }

      .member {
        max-width: 300px;
        width: 100%;
      }
    }

		.member .mug {
      padding-top: 100%;
      margin-bottom: 10px;
      box-shadow: 0 0 4px 1px rgb(0 0 0 / 55%);
      background-size: cover;
      background-position: center;
      display: block;
    }

		.member:not(.mouse-over-resources):hover {
      cursor: pointer;
    }

		.member:not(.mouse-over-resources):hover {
      box-shadow: 0 0 6px 3px rgb(0 0 0 / 55%);
    }

    .member-resource, .member-resource:hover {
      color: black !important;
      margin-right: 0.4em;
    }

    .modal .member-resource {
      margin-right: 0.5em;
    }

		.modal .mug {
      width: 100%;
    }

    .member a {
      color: black !important;
      text-decoration: none;
    }

    .member-info {
      padding: 4px;
    }

    .member-role {
      font-size: 13px !important;
    }

    .member-name, .member-role {
      margin-bottom: 2px;
    }

    .member-description {
      margin-top: 15px;
      display: none;
    }

    .modal-header {
      align-items: flex-start;
    }

    .modal-content {
      display: flex;
    }

    .modal-content .description {
      flex: 0 0 60%;
      margin-right: 1em;
    }

    .modal-content .image {
      width: 100%;
    }

    @media (max-width: 550px) {
      .modal .mug {
        display: none;
      }

      .modal-content {
        display: block;
      }
    }

    /* Helps directing the attention when jumping to the miniprofile of a member (remove?) */
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

<script>
  let members = {
    {% for member in site.data.team %}
      '{{member.id}}': {
        name: '{{member.name}}',
        description: '{{member.description}}',
        role: '{{member.role}}',
        imageUrl: '{{member.id | prepend: '/assets/images/team/' | append: '.jpg' | relative_url }}',
        resources: [
        {% for _resource in member.resources %}
          {% assign resource = _resource | first %}
          {% assign resource_name = resource[0] %}
          {% assign resource_url = resource[1] %}
          {% assign type = site.data.resource_types | where: "name", resource_name | first %}
          {name: '{{resource_name}}', icon: '{{type.icon}}', url: '{{resource_url}}'},
        {% endfor %}
        ],
      },
    {% endfor %}
  };
</script>

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
          <a class="member-resource" href="{{resource_url}}"><i class="bi bi-{{type.icon}}"></i></a>
        {% endfor %}
      </div>
      <p class="member-description">{{member.description}}</p>
    </div>
  </div>
  {% endfor %}
</div>

<!-- Member modal -->
<div class="modal micromodal-slide" id="member-modal" aria-hidden="true">
  <div class="modal-overlay" tabindex="-1" data-micromodal-close>
    <div class="modal-container" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
      <header class="modal-header">
        <div>
          <h2 class="modal-title">
          </h2>
          <h3 class="member-role"></h3>
        </div>
        <button class="modal-close" aria-label="Close modal" data-micromodal-close></button>
      </header>
      <div class="modal-content-content">
        <!--<img class="mug">-->
        <div class="modal-content">
          <div class="description">
          </div>
          <div class="image">
            <img class="mug">
          </div>
        </div>
        <footer class="modal-footer">
        </footer>
      </div>
    </div>
  </div>
</div>

<script src="/assets/js/umbrella.min.js"></script>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    MicroModal.init({
      awaitCloseAnimation: true,
    });

    function showModal(member) {
      let modal = document.querySelector('#member-modal');

      modal.querySelector('.modal-title').innerHTML = member.name;
      modal.querySelector('.member-role').innerHTML = member.role;
      modal.querySelector('.description').innerHTML = member.description;
      modal.querySelector('.mug').src = member.imageUrl;
      modal.querySelector('.modal-container').scrollTop = 0;

      modal.querySelector('.modal-footer').innerHTML = '';
      for (let resource of member.resources) {
        let resourceDom = u(`<a class="member-resource" href="${resource.url}"><i class="bi bi-${resource.icon}"></i></a>`).first();
        modal.querySelector('.modal-footer').appendChild(resourceDom);
      }

      MicroModal.show('member-modal', {
        onShow: () => {
          // For some reason, the resources get focused when the modal is shown
          document.activeElement.blur();
        },
      });
    }

    for (let member of document.querySelectorAll('.member')) {
      let mug = member.querySelector('.mug');
      let resources = member.querySelector('.member-resources');

      resources.addEventListener('mouseenter', () => member.classList.add('mouse-over-resources'));
      resources.addEventListener('mouseleave', () => member.classList.remove('mouse-over-resources'));

      member.addEventListener('click', (e) => {
        if (e.target != resources && !resources.contains(e.target)) {
          showModal(members[member.id]);
        }
      });
    }
  });
</script>
