---
routable: false
process:
    markdown: true
    twig: true
pp_protect: '0'
---

#### Some Text Widget

You can **edit** this by modifying the `modules/sidebar/default.md` page. 

To **reorder** things in the sidebar you need to modify the `partials/sidebar.html.twig` template file.

{% set flex = grav.get('flex') %}

{% set directory = flex.directory('einsaetze') %}

{% set einsaetze = directory.collection() %}

<h4>Letzte Einsatze</h4>
  {% for einsatz in einsaetze.filterBy({published: true}).limit(0, 5) %}
   <b> {{ einsatz.titel|e }}</b><br>{{ einsatz.datetime|e }}<br>{{ einsatz.ort|e }}<br><br>
  {% endfor %}