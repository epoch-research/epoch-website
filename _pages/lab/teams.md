---
title: Team
permalink: /lab/teams
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

    .member {
      padding: 5px;
    }

    .m0 .mug {
      background-size: cover !important;
      background-position: center !important;
    }


    #jaime-sevilla .mug {
      background-size: 135%, 100%;
      background-position: -40px -3px, 0px 0px;
    }

    #tamay-besiroglu .mug {
      background-size: 148%, 100%;
      background-position: -48px -8px, 0 0;
    }

    #pablo-villalobos .mug {
      background-size: 163%, 100%;
      background-position: -82px -51px, 0 0;
    }

    #anson-ho .mug {
      background-size: 141%, 100%;
      background-position: -56px -56px, 0 0;
    }

    #eduardo-infante-roldan .mug {
      background-size: 140%, 100%;
      background-position: -44px -23px, 0 0;
    }

    .m4#jaime-sevilla .mug, .m6#jaime-sevilla .mug {
      background-size: 135%, 158%;
      background-position: -40px -3px, 0px 0px;
    }

    .m4#tamay-besiroglu .mug, .m6#tamay-besiroglu .mug {
      background-size: 148%, 158%;
      background-position: -48px -8px, 0 0;
    }

    .m4#pablo-villalobos .mug, .m6#pablo-villalobos .mug {
      background-size: 163%, 158%;
      background-position: -82px -51px, 0 0;
    }

    .m4#anson-ho .mug, .m6#anson-ho .mug {
      background-size: 141%, 158%;
      background-position: -56px -56px, 0 0;
    }

    .m4#eduardo-infante-roldan .mug, .m6#eduardo-infante-roldan .mug {
      background-size: 140%, 158%;
      background-position: -44px -23px, 0 0;
    }

		.member .mug {
      padding-top: 100%;
      margin-bottom: 10px;
      //box-shadow: 0 0 4px 1px rgb(0 0 0 / 55%);
      border: 1px solid grey;
      background-size: cover;
      background-position: center;
      display: block;
    }

		.member:not(.mouse-over-resources):hover {
      cursor: pointer;
    }

		.member:not(.mouse-over-resources):hover, .member.selected {
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
      border: 1px solid grey;
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

{% include scripts/team_members.html %}

# About us
We are a research initiative working to support AI governance and improve forecasts around the development of advanced AI systems. Our mission is to narrow the gap between technical AI developments and AI governance, and inform key decision makers in AI safety.

{% assign backgrounds = "" | split: ',' %}
{% assign backgrounds = backgrounds | push: '' %}
{% assign backgrounds = backgrounds | push: 'https://mir-s3-cdn-cf.behance.net/project_modules/fs/c7507b49671425.58bb77365c8ed.jpg' %}
{% assign backgrounds = backgrounds | push: '/assets/images/team/transparent/bahamas.png' %}


{% for index in (0..6) %}

{% case index == 1 %}
{% when 0 %}
  {% assign subtitle = 'original' %}
{% when 1 %}
  {% assign subtitle = 'zoomed in' %}
{% when 2 %}
  {% assign subtitle = 'blurry approximation' %}
{% when 3 %}
  {% assign subtitle = 'boring white' %}
{% when 4 %}
  {% assign subtitle = 'textured white' %}
{% when 5 %}
  {% assign subtitle = 'Bahamas' %}
{% when 6 %}
  {% assign subtitle = 'please, pick this one' %}
{% endcase %}

{% assign background = '' %}
{% assign imageDir = '/assets/images/team/transparent/' %}

{% if index == 0 or index == 1%}
  {% assign imageDir = '/assets/images/team/original/' %}
{% endif %}

{% if index == 2 %}
  {% assign imageDir = '/assets/images/team/blurry/' %}
{% endif %}

{% if index == 4 %}
  {% assign background = 'https://img.freepik.com/free-photo/white-texture_1160-786.jpg?w=2000' %}
{% endif %}

{% if index == 5 %}
  {% assign background = '/assets/images/team/transparent/bahamas.png' %}
{% endif %}

{% if index == 6 %}
  {% assign background = 'https://wallpaperaccess.com/full/3199302.jpg' %}
{% endif %}

{% assign backgroundIndex = forloop.index %}
{% assign backgroundIndex = index %}

## Our Team ({{subtitle}})

<div class="collection-grid team-grid">
  {% for member in site.data.team %}
  <div class="member m{{backgroundIndex}}" id="{{member.id}}">
    <div class="mug" style="background-image: url('{{member.id | prepend: imageDir | append: '.png' | relative_url }}'), url('{{background}}')"></div>
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
<div class="modal micromodal-slide" id="member-modal-{{backgroundIndex}}" aria-hidden="true">
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

    function showModal(memberDom, member) {
      let modal = document.querySelector('#member-modal-{{backgroundIndex}}');

      modal.querySelector('.modal-title').innerHTML = member.name;
      modal.querySelector('.member-role').innerHTML = member.role;
      modal.querySelector('.description').innerHTML = member.description;
      modal.querySelector('.mug').src = `{{imageDir}}/${member.id}.png`;
      modal.querySelector('.mug').style.backgroundImage = 'url({{background}})';
      modal.querySelector('.mug').style.backgroundPositionY = '-187px';
      modal.querySelector('.modal-container').scrollTop = 0;

      modal.querySelector('.modal-footer').innerHTML = '';
      for (let resource of member.resources) {
        let resourceDom = u(`<a class="member-resource" href="${resource.url}"><i class="bi bi-${resource.icon}"></i></a>`).first();
        modal.querySelector('.modal-footer').appendChild(resourceDom);
      }

      MicroModal.show('member-modal-{{backgroundIndex}}', {

        onShow: () => {
          memberDom.classList.add('selected');

          // For some reason, the resources get focused when the modal is shown
          document.activeElement.blur();
        },
        onClose: () => {
          memberDom.classList.remove('selected');
        },
      });
    }

    for (let member of document.querySelectorAll('.member.m{{backgroundIndex}}')) {
      console.log(member);
      let mug = member.querySelector('.mug');
      let resources = member.querySelector('.member-resources');

      resources.addEventListener('mouseenter', () => member.classList.add('mouse-over-resources'));
      resources.addEventListener('mouseleave', () => member.classList.remove('mouse-over-resources'));

      member.addEventListener('click', (e) => {
        if (e.target != resources && !resources.contains(e.target)) {
          showModal(member, teamMembers[member.id]);
        }
      });
    }
  });
</script>

{% endfor %}
